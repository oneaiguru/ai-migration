**Service:** `services/api-gateway/` (your existing)

**Purpose**

* Enterprise/API-key lane; development/benchmarking.
* Not used for subscription OAuth.

**Actions**

* Keep `/v1/messages` router.
* Harden error reporting and usage logging.
* Add lane labels (“anthropic”, “zai”).

---