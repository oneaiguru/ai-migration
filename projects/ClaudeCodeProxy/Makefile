.PHONY: mitm sub zai logs versions setup start-sub start-zai soak burst parallel chaos bench-sonnet bench-haiku summarize verify-routing repo-map repo-map-md apply-policy tee-on tee-off clean-logs longrun longrun-model-only bundle sub-env install-local two-up quota productize-check doctor go-shim-build go-shim-run go-shim-lite-build go-shim-lite-run go-sse-probe go-json-bench go-test check-licenses

LOG_ROOT := $(if $(CCP_LOGS_DIR),$(CCP_LOGS_DIR),$(CURDIR)/logs)
RESULTS_ROOT := $(if $(CCP_RESULTS_DIR),$(CCP_RESULTS_DIR),$(CURDIR)/results)
LOG_FILE := $(LOG_ROOT)/usage.jsonl

setup:
	bash scripts/setup-workdirs.sh

mitm:
	bash scripts/run-mitm.sh

sub:
	bash scripts/start-sub.sh

zai:
	bash scripts/start-zai.sh

start-sub:
	bash scripts/start-sub.sh

start-zai:
	bash scripts/start-zai.sh

logs:
	@mkdir -p $(LOG_ROOT) && (test -f $(LOG_FILE) || touch $(LOG_FILE)) && tail -f $(LOG_FILE)

versions:
	bash scripts/print-versions.sh

soak:
	bash scripts/soak.sh 60

burst:
	bash scripts/burst.sh 20

parallel:
	bash scripts/parallel-subagents.sh 4

chaos:
	bash scripts/chaos-restart-mitm.sh $${MITM_PORT:-8080} 30

bench-sonnet:
	bash scripts/latency-bench.sh sonnet 10

bench-haiku:
	bash scripts/latency-bench.sh haiku 10

summarize:
	@mkdir -p $(RESULTS_ROOT)
	node scripts/summarize-usage.js $(LOG_FILE) | tee $(RESULTS_ROOT)/METRICS.json

verify-routing:
	node scripts/verify-routing.js $(LOG_FILE)

repo-map:
	@mkdir -p $(RESULTS_ROOT)
	bash scripts/repo-map.sh > $(RESULTS_ROOT)/REPO_FILES.jsonl

repo-map-md:
	node scripts/repo-map-md.js $(RESULTS_ROOT)/REPO_FILES.jsonl $(RESULTS_ROOT)/REPO_SUMMARIES.jsonl > $(RESULTS_ROOT)/REPO_MAP.md

longrun:
	bash scripts/longrun-mixed.sh 120

longrun-model-only:
	bash scripts/longrun-model-only.sh 240

bundle:
	bash scripts/review-bundle.sh

sub-env:
	@echo "Run: source scripts/sub-env.sh 8082"

install-local:
	bash scripts/install-local.sh

two-up:
	bin/cc two-up

check-licenses:
	bash scripts/check-licenses.sh

quota:
	bin/cc quota

productize-check:
	bin/cc productize-check

doctor:
	bin/cc doctor

go-shim-build:
	@echo "[go] building ccp..."
	@mkdir -p services/go-anth-shim/bin
	cd services/go-anth-shim && GO111MODULE=on go build -o bin/ccp ./cmd/ccp

go-shim-run:
	ZAI_API_KEY=$${ZAI_API_KEY} ./services/go-anth-shim/bin/ccp serve --port $${PORT:-8082}

go-shim-lite-build:
	@echo "[go] building ccp-lite..."
	@mkdir -p services/go-anth-shim/bin
	cd services/go-anth-shim && GO111MODULE=on go build -o bin/ccp-lite ./cmd/ccp-lite

go-shim-lite-run:
	ZAI_API_KEY=$${ZAI_API_KEY} ./services/go-anth-shim/bin/ccp-lite --port $${PORT:-8082}

go-sse-probe:
	python3 scripts/perf/sse_probe.py

go-json-bench:
	bash scripts/perf/json_bench.sh 10

go-test:
	cd services/go-anth-shim && go test ./cmd/ccp -run . -count=1

.PHONY: test-aliases
test-aliases:
	bash scripts/tests/ccc-aliases-smoke.sh

.PHONY: prune-results
prune-results:
	bash scripts/prune-results.sh --pattern 'METRICS*.json' --keep $${RESULTS_MAX_FILES:-10}

.PHONY: repro-py repro-go repro-go-quick overnight-go
repro-py:
	bash scripts/repro-py-mitm.sh 8082

repro-go:
	bash scripts/repro-go-shim.sh 8082

repro-go-quick:
	bash scripts/repro-go-shim-quick.sh 8082

overnight-go:
	MAX_MINUTES=$${MAX_MINUTES:-15} bash scripts/overnight-go-shim.sh 8082

.PHONY: go-proxy go-env logs-rotate
go-proxy:
	bash scripts/run-go-shim.sh $${PORT:-8082}

go-env:
	@echo "Run: source scripts/go-env.sh $${PORT:-8082}"

logs-rotate:
	bash scripts/logs-rotate.sh

.PHONY: smoke-license
smoke-license:
	bash scripts/smoke-license.sh

apply-policy:
	bash scripts/policy-run.sh inbox/tasks/33-ROUTING-POLICY.json

tee-on:
	ENABLE_BODY_TEE=1 bash scripts/tee-body-samples.sh start

tee-off:
	ENABLE_BODY_TEE=0 bash scripts/tee-body-samples.sh stop

clean-logs:
	bash scripts/clean-logs.sh
.PHONY: release-notes
release-notes:
	@bash -c 'LAST=$$(git describe --tags --abbrev=0 2>/dev/null || echo ""); \
	if [ -z "$$LAST" ]; then echo "[notes] No tags found; showing full history"; git log --pretty=format:"* %h %s"; \
	else echo "[notes] Since $$LAST:"; git log $$LAST..HEAD --pretty=format:"* %h %s"; fi'

# --- Local CI helpers (no GitHub) ---
.PHONY: ci-fw0 ci-fw1 ci-fw2 ci-fw3 ci-all

# FW0: build + unit tests
ci-fw0:
	cd services/go-anth-shim && go test ./... -count=1

# FW1: community pass-through smoke (Anth-only)
ci-fw1:
	FORCE_HAIKU_TO_ZAI=0 scripts/uat/run_sonnet_anth.sh 8082

# FW2: licensed Z.ai smoke (requires ZAI_API_KEY in .env)
ci-fw2:
	scripts/dev/dev-license-activate.sh
	source logs/dev-license/exports.sh && scripts/uat/run_haiku_zai.sh 8082

# FW3: mixed routing (licensed) — Haiku→Z.ai then Sonnet→Anth
ci-fw3:
	source logs/dev-license/exports.sh && scripts/uat/run_haiku_sonnet.sh 8082

# Run everything (FW0→FW3)
ci-all: ci-fw0 ci-fw1 ci-fw2 ci-fw3

# Local sanity: build + tests + run/health + stop
.PHONY: sanity
sanity:
	@echo "[sanity] build"
	cd services/go-anth-shim && GO111MODULE=on go build -o bin/ccp ./cmd/ccp
	@echo "[sanity] test"
	cd services/go-anth-shim && go test ./... -count=1
	@echo "[sanity] run on :9099"
	pkill -f 'services/go-anth-shim/bin/ccp.*:9099' >/dev/null 2>&1 || true
	ZAI_API_KEY=$${ZAI_API_KEY:-} ./services/go-anth-shim/bin/ccp serve --port 9099 > /tmp/ccp_sanity.out 2>&1 & echo $$! > /tmp/ccp_sanity.pid
	sleep 1
	@echo "[sanity] health"
	curl -sSf http://127.0.0.1:9099/healthz >/dev/null
	@echo "[sanity] ready"
	curl -sSf http://127.0.0.1:9099/readyz >/dev/null
	@echo "[sanity] stop"
	-kill $$(cat /tmp/ccp_sanity.pid) >/dev/null 2>&1 || true
	@echo "[sanity] OK"
