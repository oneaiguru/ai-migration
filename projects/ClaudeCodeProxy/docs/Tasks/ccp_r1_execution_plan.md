## Metadata
- Task: R1 — Multi-model connectors + routing MVP
- Discovery: Completed (see Key Discoveries for citations)
- Related docs: docs/tasks/ccp2-review.md, docs/OPS-GUIDE.md, docs/PROD-TESTS.md

## Desired End State
CCC loads provider definitions from `providers.yaml`, instantiates Anthropic/Z.AI/OpenAI/GLM/local adapters, exposes manual `/model` switching, and routes requests (with fallback) according to policy + config. `/readyz` reflects all upstreams, CLI/docs/tests cover the workflow, and a sample config ships under `configs/providers.example.yaml`.

### Key Discoveries
- docs/tasks/ccp2-review.md:74-99 — R1 deliverables, acceptance criteria, and touchpoints.
- services/go-anth-shim/cmd/ccp/main.go:200-268 — server bootstrap & lane selection currently rely on embedded policy and model substring only.
- services/go-anth-shim/cmd/ccp/main.go:610-706 — usage logging/backoff hooks ready for new lanes/fallback data.
- services/go-anth-shim/cmd/ccp/policy.go:12-134 — embedded policy defaults and provider metadata.
- docs/OPS-GUIDE.md:36-115 — operator SOP lacks provider catalog guidance/manual model switch steps.
- docs/PROD-TESTS.md:8-19 — acceptance gates need provider-routing checks.
- bin/cc:102-200 — CLI helper currently missing `/model` switching or provider diagnostics.

## What We're NOT Doing
- Implementing R2 pipeline roles, TUI/event bus, or context-discipline work (R3/R4).
- Altering license enforcement or existing `/healthz`/log rotation logic beyond new provider wiring.
- Auto-provisioning credentials (still environment-based).

## Implementation Approach
1. Introduce a typed loader for `providers.yaml` (YAML/JSON) with precedence: project (`./configs/providers.yaml`), user (`~/.config/ccp/providers.yaml`), env override (`CCP_PROVIDERS_FILE`). Ship an example config and tests.
2. Extend the shim to merge policy + provider catalog, instantiate HTTP clients per provider, add fallback, and update readiness metrics. Add OpenAI/GLM/local lanes while keeping Anth/Z.AI intact.
3. Enhance CLI/docs/tests: manual `/model` setter, `cc providers` inspector, acceptance steps for `/readyz`/catalog.
4. Update validation scripts and documentation, ensuring clean handoff for executor mode.

## Phase 1: Provider Config Loader & Sample
### Overview
Create YAML dependency, loader helpers, tests, and example config.

### Changes Required
1. **Add YAML dependency**  
   **File**: `services/go-anth-shim/go.mod`
   ```commands
   apply_patch <<'PATCH'
*** Begin Patch
*** Update File: services/go-anth-shim/go.mod
@@
 module github.com/local/ccp-shim
 
 go 1.21
+
+require gopkg.in/yaml.v3 v3.0.1
*** End Patch
PATCH
   GOPROXY=direct GOSUMDB=off go mod tidy
   ```

2. **Provider catalog implementation**  
   **File**: `services/go-anth-shim/cmd/ccp/providers_config.go`
   ```commands
   cat <<'EOF' > services/go-anth-shim/cmd/ccp/providers_config.go
package main

import (
    "errors"
    "fmt"
    "io/fs"
    "os"
    "path/filepath"
    "strings"

    yaml "gopkg.in/yaml.v3"
)

type ProviderRoute struct {
    Pattern   string  `yaml:"pattern" json:"pattern"`
    Provider  string  `yaml:"provider" json:"provider"`
    CostLimit *string `yaml:"cost_limit,omitempty" json:"cost_limit,omitempty"`
}

type ProviderEntry struct {
    KeyEnv   string            `yaml:"key_env" json:"key_env"`
    BaseURL  string            `yaml:"base_url" json:"base_url"`
    Via      string            `yaml:"via,omitempty" json:"via,omitempty"`
    ModelMap map[string]string `yaml:"model_map,omitempty" json:"model_map,omitempty"`
    Models   []string          `yaml:"models,omitempty" json:"models,omitempty"`
    Notes    string            `yaml:"notes,omitempty" json:"notes,omitempty"`
}

type ProviderCatalog struct {
    Providers map[string]ProviderEntry `yaml:"providers" json:"providers"`
    Routes    []ProviderRoute          `yaml:"routes" json:"routes"`
}

func (c *ProviderCatalog) ProviderNames() []string {
    names := make([]string, 0, len(c.Providers))
    for n := range c.Providers {
        names = append(names, n)
    }
    return names
}

func loadProviderCatalog(paths []string) (*ProviderCatalog, string, error) {
    for _, p := range paths {
        if p == "" {
            continue
        }
        data, err := os.ReadFile(p)
        if err != nil {
            if errors.Is(err, fs.ErrNotExist) {
                continue
            }
            return nil, "", fmt.Errorf("read providers config %s: %w", p, err)
        }
        catalog := &ProviderCatalog{}
        if err := yaml.Unmarshal(data, catalog); err != nil {
            return nil, "", fmt.Errorf("decode providers config %s: %w", p, err)
        }
        if err := validateCatalog(catalog); err != nil {
            return nil, "", fmt.Errorf("validate providers config %s: %w", p, err)
        }
        return catalog, p, nil
    }
    return &ProviderCatalog{Providers: map[string]ProviderEntry{}}, "", nil
}

func validateCatalog(c *ProviderCatalog) error {
    if c == nil {
        return errors.New("catalog missing")
    }
    if len(c.Providers) == 0 {
        return errors.New("providers map must not be empty")
    }
    for name, entry := range c.Providers {
        if strings.TrimSpace(name) == "" {
            return fmt.Errorf("provider key empty")
        }
        if entry.KeyEnv == "" {
            return fmt.Errorf("provider %s missing key_env", name)
        }
        if entry.BaseURL == "" {
            return fmt.Errorf("provider %s missing base_url", name)
        }
    }
    for _, route := range c.Routes {
        if route.Pattern == "" {
            return errors.New("route missing pattern")
        }
        if route.Provider == "" {
            return fmt.Errorf("route %s missing provider", route.Pattern)
        }
        if _, ok := c.Providers[route.Provider]; !ok {
            return fmt.Errorf("route %s references unknown provider %s", route.Pattern, route.Provider)
        }
    }
    return nil
}

func defaultProviderPaths(root string) []string {
    project := filepath.Join(root, "configs", "providers.yaml")
    home, _ := os.UserHomeDir()
    user := ""
    if home != "" {
        user = filepath.Join(home, ".config", "ccp", "providers.yaml")
    }
    env := os.Getenv("CCP_PROVIDERS_FILE")
    if env != "" {
        return []string{env, project, user}
    }
    return []string{project, user}
}
EOF
   ```

3. **Catalog tests**  
   **File**: `services/go-anth-shim/cmd/ccp/main_extra_test.go`
   ```commands
   apply_patch <<'PATCH'
*** Begin Patch
*** Update File: services/go-anth-shim/cmd/ccp/main_extra_test.go
@@
 func TestInvalidJSON_Returns400(t *testing.T) {
@@
 }
+
+// TODO (executor): add TestLoadProviderCatalogPrecedence verifying project/user/env precedence once loader is wired.
*** End Patch
PATCH
   ```

4. **Example config**  
   **File**: `configs/providers.example.yaml`
   ```commands
   cat <<'FILE' > configs/providers.example.yaml
providers:
  anthropic:
    key_env: ANTHROPIC_AUTH_TOKEN
    base_url: https://api.anthropic.com
  zai:
    key_env: ZAI_API_KEY
    base_url: https://api.z.ai/api/anthropic
    notes: "Anthropic-compatible Haiku lane"
  openai:
    key_env: OPENAI_API_KEY
    base_url: https://api.openai.com/v1
    model_map:
      gpt-5-pro: gpt-5.0-pro
  glm:
    key_env: ZHIPU_API_KEY
    via: openrouter
    base_url: https://openrouter.ai/api
    model_map:
      glm-4-6: glm-4-6
  local:
    via: ollama
    base_url: http://127.0.0.1:11434
    models: [codellama, qwen2.5-coder]

routes:
  - pattern: claude-haiku-4*
    provider: zai
  - pattern: gpt-5*
    provider: openai
  - pattern: glm*
    provider: glm
  - pattern: local/*
    provider: local
FILE
   ```

## Phase 2: Shim Provider Integration & Routing
### Overview
Load catalog during bootstrap, augment lane selection & fallback, update readiness metrics.

### Changes Required
1. **Server struct & repo root helper**  
   **File**: `services/go-anth-shim/cmd/ccp/main.go`
   ```commands
   apply_patch <<'PATCH'
*** Begin Patch
*** Update File: services/go-anth-shim/cmd/ccp/main.go
@@
 type server struct {
@@
     metrics         *metrics
     probeClient     *http.Client
     probeInterval   time.Duration
     readinessMu     sync.RWMutex
     readiness       map[string]readinessRecord
+    catalog         *ProviderCatalog
 }
+
+func repoRoot() string {
+    if root := os.Getenv("CCC_REPO_ROOT"); root != "" {
+        return root
+    }
+    wd, err := os.Getwd()
+    if err != nil {
+        return "."
+    }
+    return wd
+}
*** End Patch
PATCH
   ```

2. **Load catalog in bootstrap**  
   ```commands
   apply_patch <<'PATCH'
*** Begin Patch
*** Update File: services/go-anth-shim/cmd/ccp/main.go
@@
 func newServer(port int, pol *Policy, lic *license.Claims) *server {
+    catalog, catalogPath, err := loadProviderCatalog(defaultProviderPaths(repoRoot()))
+    if err != nil {
+        log.Printf("[providers] warning: %v", err)
+        catalog = &ProviderCatalog{Providers: map[string]ProviderEntry{}}
+    } else if catalogPath != "" {
+        log.Printf("[providers] loaded catalog %s (providers=%d routes=%d)", catalogPath, len(catalog.Providers), len(catalog.Routes))
+    }
@@
-    srv.policy = pol
+    srv.policy = pol
+    srv.catalog = catalog
*** End Patch
PATCH
   ```

3. **Route evaluation & fallback stub**  
   Update `decideLane` to consult catalog routes before policy and add TODO for `routeFallback` helper.
   ```commands
   apply_patch <<'PATCH'
*** Begin Patch
*** Update File: services/go-anth-shim/cmd/ccp/main.go
@@
 func (s *server) decideLane(model string) string {
@@
-    if s.policy != nil {
-        if lane, ok := s.policy.LaneForModel(model); ok {
-            lane = strings.ToLower(strings.TrimSpace(lane))
-            switch lane {
-            case "zai":
-                if s.zaiKey != "" {
-                    return "zai"
-                }
-            case "anth", "anthropic":
-                return "anthropic"
-            }
-        }
-    }
-    m := strings.ToLower(strings.TrimSpace(model))
-    if strings.Contains(m, "haiku") && s.zaiKey != "" {
-        return "zai"
-    }
-    return "anthropic"
+    normalized := strings.ToLower(strings.TrimSpace(model))
+    if s.catalog != nil {
+        for _, route := range s.catalog.Routes {
+            if matchPattern(strings.ToLower(route.Pattern), normalized) {
+                if _, ok := s.catalog.Providers[route.Provider]; ok {
+                    return route.Provider
+                }
+            }
+        }
+    }
+    if s.policy != nil {
+        if lane, ok := s.policy.LaneForModel(model); ok {
+            lane = strings.ToLower(strings.TrimSpace(lane))
+            if lane != "" {
+                return lane
+            }
+        }
+    }
+    if strings.Contains(normalized, "haiku") && s.zaiKey != "" {
+        return "zai"
+    }
+    return "anth"
 }
*** End Patch
PATCH
   ```
   *TODO (executor): implement `routeFallback(model, attempted string)` helper and invoke it when upstream errors occur, rewriting auth headers appropriately.*

4. **Readyz metrics** — extend readiness logic to iterate `catalog.ProviderNames()` and set gauges after probes succeed.

## Phase 3: CLI & Docs
### Overview
Expose manual model switching and provider inspection; document workflow.

### Changes Required
1. **CLI commands**  
   **File**: `bin/cc`
   ```commands
   apply_patch <<'PATCH'
*** Begin Patch
*** Update File: bin/cc
@@
   cc usage [--banner]       Show token usage meter (per-lane breakdown)
   cc partials [clean|cat]   List or view partial-output files
+  cc model <name>           Set default model (writes ~/.config/ccp/model)
+  cc providers              Dump merged providers catalog
@@
 cmd_bundle() { (cd "$ROOT_DIR" && make bundle); }
+
+cmd_model() {
+  local name="${1:-}"
+  if [[ -z "$name" ]]; then
+    echo "Usage: cc model <model-name>" >&2
+    return 1
+  fi
+  local cfg_dir="${XDG_CONFIG_HOME:-$HOME/.config}/ccp"
+  mkdir -p "$cfg_dir"
+  printf '%s\n' "$name" >"$cfg_dir/model"
+  echo "[model] default model set to $name"
+}
+
+cmd_providers() {
+  local override="${CCP_PROVIDERS_FILE:-}"
+  if [[ -n "$override" ]]; then
+    echo "[providers] CCP_PROVIDERS_FILE=$override"
+  fi
+  go run ./services/go-anth-shim/cmd/ccp --print-providers
+}
*** End Patch
PATCH
   ```
2. **Docs** — update OPS-GUIDE (provider catalog + model switch steps), PROD-TESTS (new acceptance), ONE-PAGER (multi-provider mention).

## Phase 4: Tests & Validation Harness
### Overview
Add fallback tests, CLI smoke coverage, docs updates.

### Changes Required
- Extend `services/go-anth-shim/cmd/ccp/main_test.go` with fallback test using mock upstream returning 429 then alternate provider.
- Update `scripts/tests/ccc-aliases-smoke.sh` to assert `ccc-on` prints banner and `cc providers` succeeds.
- Refresh `docs/PROD-TESTS.md` acceptance gates (`cc providers`, fallback chaos).

## Tests & Validation
- `cd services/go-anth-shim && GOPROXY=direct GOSUMDB=off go test ./...`
- `./bin/cc providers`
- `./bin/cc model gpt-5-pro && cat ~/.config/ccp/model`
- `curl -s http://127.0.0.1:8082/readyz | jq`
- `make summarize && make verify-routing`

## Rollback
- `git checkout -- services/go-anth-shim/go.mod go.sum`
- `git rm services/go-anth-shim/cmd/ccp/providers_config.go configs/providers.example.yaml`
- `git checkout -- services/go-anth-shim/cmd/ccp/main.go bin/cc docs/OPS-GUIDE.md docs/PROD-TESTS.md`
- Remove user config: `rm -f ~/.config/ccp/providers.yaml ~/.config/ccp/model`

## Handoff
- Document executed commands + validations in `docs/SESSION_HANDOFF.md`
- Check off R1 boxes in `docs/tasks/ccp2-review.md`
- Attach updated bundle/results once execution is complete
