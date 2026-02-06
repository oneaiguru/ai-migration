# Deep Research Prompt — Validate ADRs & Alternatives (Licensing, Oct 2025)

## Objective
Validate our licensing ADRs (0001–0010) and surface credible alternatives with tradeoffs. Deliver a recommendation set that either confirms current decisions or proposes precise changes with migration notes.

## Time Window
Focus on Oct 2024–Oct 2025; prioritize Aug–Oct 2025.

## Must Cover
1) **Pack format & crypto**: Ed25519 canonical JSON vs JWS vs PASETO (libs, security posture, cross-platform UX).
2) **Device-code & loopback UX**: best-in-class CLI flows; port constraints; security considerations.
3) **Binding & offline**: device binding patterns; offline grace; revocation models without phone-home.
4) **Distribution**: macOS notarization, Windows codesign, Homebrew/winget; update channels.
5) **Billing**: Stripe vs LemonSqueezy vs Paddle (fees, webhooks, test mode, geo).
6) **Comparable tools**: Copilot, Cursor, Sourcegraph Cody/Amp, JetBrains AI, Zed agents, Claude Code licensing—what they publish, what users report.
7) **Legal/privacy**: data minimization norms for dev tools; regional constraints.

## Deliverables
- **ADR-by-ADR validation**: for each ADR, a “Confirm / Adjust / Replace” decision with linked evidence (≥2 sources/ADR).
- **Decision Tables**: side-by-side for pack format, billing provider, device binding policy.
- **Implementation Checklist**: per ADR, concrete steps and pitfalls.
- **Risk Register**: top 10 risks and mitigations.

## Output Rules
- English; include short quotes in original language if useful.
- ≥30 sources; ≥12 official docs; date every claim.
- Do not assume; if unknown, mark as unknown with “How to verify”.
- Cite links inline.

## Seed Queries (expand beyond)
- "CLI device code flow 2025", "Ed25519 license verification CLI example", "PASETO vs JWS for licensing", "Stripe webhook license issuance 2025", "macOS CLI notarization 2025", "Windows codesign winget 2025", "developer tool license pack offline verify", "Cursor/Sourcegraph license flow", "Zed agent license"
```

# services/go-anth-shim/internal/license/pack.go

```go
package license

// Data structures for the license pack.

type License struct {
	Schema   string   `json:"schema"`
	KID      string   `json:"kid"`
	Plan     string   `json:"plan"`
	Features []string `json:"features"`
	Exp      int64    `json:"exp"`              // epoch seconds UTC
	Device   string   `json:"device,omitempty"` // optional device binding
}

type Pack struct {
	License   License `json:"license"`
	Signature string  `json:"signature"`
}
```

# services/go-anth-shim/internal/license/verify.go

```go
package license

// Minimal verification API. Implemented without external deps beyond stdlib.

import (
	"crypto/ed25519"
	"encoding/base64"
	"encoding/json"
	"errors"
	"time"
)

var (
	ErrSigInvalid  = errors.New("license: signature invalid")
	ErrKeyUnknown  = errors.New("license: unknown kid")
	ErrExpired     = errors.New("license: expired")
	ErrSchema      = errors.New("license: bad schema")
	ErrCanon       = errors.New("license: canonicalization failed")
)

type PubKey struct {
	KID string
	Key ed25519.PublicKey
}

// VerifyBytes verifies a JSON pack string, returns License on success.
func VerifyBytes(pubkeys []PubKey, now time.Time, raw []byte) (License, error) {
	var p Pack
	if err := json.Unmarshal(raw, &p); err != nil {
		return License{}, err
	}
	if p.License.Schema != "ccp.license.v1" {
		return License{}, ErrSchema
	}
	// Pick key
	var pk ed25519.PublicKey
	for _, k := range pubkeys {
		if k.KID == p.License.KID {
			pk = k.Key
			break
		}
	}
	if pk == nil {
		return License{}, ErrKeyUnknown
	}
	// Canonicalize the inner license JSON
	canon, err := CanonicalizeJSON(p.License)
	if err != nil {
		return License{}, ErrCanon
	}
	sig, err := base64.StdEncoding.DecodeString(p.Signature)
	if err != nil {
		return License{}, ErrSigInvalid
	}
	if !ed25519.Verify(pk, canon, sig) {
		return License{}, ErrSigInvalid
	}
	if now.Unix() >= p.License.Exp {
		return License{}, ErrExpired
	}
	return p.License, nil
}
```

# services/go-anth-shim/internal/license/canonical.go

```go
package license

// CanonicalizeJSON produces a stable byte representation of the license object.
// MVP: marshal with stable map order by using a struct (already ordered).
// If we ever add maps, we must implement a key-sorted encoder.

import "encoding/json"

func CanonicalizeJSON(v any) ([]byte, error) {
	// Struct fields are serialized in field order by encoding/json,
	// which is stable for our struct. Avoid maps in the schema.
	return json.Marshal(v)
}
```

# services/go-anth-shim/internal/license/verify_test.go

```go
package license

import (
	"crypto/ed25519"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"testing"
	"time"
)

func TestVerifyBytes_OK(t *testing.T) {
	pub, priv, _ := ed25519.GenerateKey(rand.Reader)
	lic := License{Schema:"ccp.license.v1", KID:"k1", Plan:"trial", Features:[]string{"zai_offload"}, Exp: time.Now().Add(1*time.Hour).Unix()}
	canon, _ := CanonicalizeJSON(lic)
	sig := ed25519.Sign(priv, canon)
	p := Pack{License: lic, Signature: base64.StdEncoding.EncodeToString(sig)}
	raw, _ := json.Marshal(p)

	got, err := VerifyBytes([]PubKey{{KID:"k1", Key:pub}}, time.Now(), raw)
	if err != nil {
		t.Fatalf("verify failed: %v", err)
	}
	if got.Plan != "trial" {
		t.Fatalf("unexpected plan: %s", got.Plan)
	}
}

func TestVerifyBytes_BadSig(t *testing.T) {
	pub, _, _ := ed25519.GenerateKey(rand.Reader)
	lic := License{Schema:"ccp.license.v1", KID:"k1", Plan:"trial", Features:[]string{"zai_offload"}, Exp: time.Now().Add(1*time.Hour).Unix()}
	p := Pack{License: lic, Signature: "AAAA"}
	raw, _ := json.Marshal(p)
	_, err := VerifyBytes([]PubKey{{KID:"k1", Key:pub}}, time.Now(), raw)
	if err == nil {
		t.Fatal("expected error")
	}
}
```

# services/go-anth-shim/cmd/licissuer/routes.go

```go
package main

import (
	"encoding/json"
	"net/http"
	"time"
)

type IssueReq struct {
	InviteCode string `json:"invite_code"`
	Email      string `json:"email"`
	Device     string `json:"device"`
}

type IssueResp struct {
	License     json.RawMessage `json:"license"`
	Signature   string          `json:"signature"`
	LicensePack string          `json:"license_pack"`
	KID         string          `json:"kid"`
	Plan        string          `json:"plan"`
	Features    []string        `json:"features"`
	Exp         int64           `json:"exp"`
}

type DeviceBeginReq struct {
	InviteCode  string `json:"invite_code"`
	Email       string `json:"email"`
	Device      string `json:"device"`
	RedirectURL string `json:"redirect_url"`
}
type DeviceBeginResp struct {
	UserCode    string `json:"user_code"`
	PollToken   string `json:"poll_token"`
	AuthorizeURL string `json:"authorize_url"`
	Interval    int    `json:"interval"`
	ExpiresIn   int    `json:"expires_in"`
}

type DevicePollReq struct {
	PollToken string `json:"poll_token"`
}
type DevicePollResp struct {
	Status      string `json:"status"` // pending|ok|expired|not_found
	LicensePack string `json:"license_pack,omitempty"`
}

func handleIssue(w http.ResponseWriter, r *http.Request) {
	// TODO: validate invite; mint license; sign; respond.
	w.Header().Set("content-type","application/json")
	w.WriteHeader(http.StatusNotImplemented)
	w.Write([]byte(`{"error":"not_implemented"}`))
}

func handleDeviceBegin(w http.ResponseWriter, r *http.Request) {
	// TODO: generate user_code + poll_token; persist; return authorize_url.
	w.Header().Set("content-type","application/json")
	json.NewEncoder(w).Encode(DeviceBeginResp{
		UserCode: "AB-CD-EF-GH",
		PollToken: "dev-token",
		AuthorizeURL: "https://example.com/activate?code=AB-CD-EF-GH",
		Interval: 2,
		ExpiresIn: 300,
	})
}

func handleDevicePoll(w http.ResponseWriter, r *http.Request) {
	// TODO: return pending until an issued license_pack is stored for this poll token.
	_ = r
	w.Header().Set("content-type","application/json")
	json.NewEncoder(w).Encode(DevicePollResp{Status:"pending"})
}

func registerRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/v1/license/issue", handleIssue)
	mux.HandleFunc("/v1/device/begin", handleDeviceBegin)
	mux.HandleFunc("/v1/device/poll", handleDevicePoll)
	_ = time.Now // silence unused imports if stubs
}
```

# services/go-anth-shim/cmd/licissuer/storage.go

```go
package main

// Minimal JSON-file persistence stubs for invites and device codes

type InviteCfg struct {
	Plan            string   `json:"plan"`
	Features        []string `json:"features"`
	TTLDays         int      `json:"ttl_days"`
	MaxRedemptions  int      `json:"max_redemptions"`
	ExpiresAt       string   `json:"expires_at"`
	Redeemed        int      `json:"redeemed"`
}

type DeviceState struct {
	UserCode   string `json:"user_code"`
	PollToken  string `json:"poll_token"`
	LicensePack string `json:"license_pack,omitempty"`
	ExpireAt   int64  `json:"expire_at"`
}
