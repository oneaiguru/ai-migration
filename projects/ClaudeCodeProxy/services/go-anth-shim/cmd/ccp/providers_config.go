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
	KeyEnv     string            `yaml:"key_env" json:"key_env"`
	BaseURL    string            `yaml:"base_url" json:"base_url"`
	HeaderMode string            `yaml:"header_mode,omitempty" json:"header_mode,omitempty"`
	ScopedEnv  map[string]string `yaml:"scoped_env,omitempty" json:"scoped_env,omitempty"`
	Via        string            `yaml:"via,omitempty" json:"via,omitempty"`
	ModelMap   map[string]string `yaml:"model_map,omitempty" json:"model_map,omitempty"`
	Models     []string          `yaml:"models,omitempty" json:"models,omitempty"`
	Notes      string            `yaml:"notes,omitempty" json:"notes,omitempty"`
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
		if entry.KeyEnv == "" && len(entry.ScopedEnv) == 0 {
			return fmt.Errorf("provider %s missing key_env or scoped_env", name)
		}
		if entry.BaseURL == "" {
			return fmt.Errorf("provider %s missing base_url", name)
		}
		entry.HeaderMode = strings.ToLower(strings.TrimSpace(entry.HeaderMode))
		if entry.HeaderMode != "" && entry.HeaderMode != "authorization" && entry.HeaderMode != "x-api-key" {
			return fmt.Errorf("provider %s header_mode must be authorization or x-api-key", name)
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
		return []string{env, user, project}
	}
	return []string{user, project}
}
