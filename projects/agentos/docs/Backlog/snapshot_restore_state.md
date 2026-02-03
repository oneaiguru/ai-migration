# Snapshot/Restore State

## 🎯 Why Now
Protect live data from E2E tests; enable rapid resets.

## 🔗 Contracts
- Depends: data/week0/live
- Emits: snapshots under data/snapshots/<date>

## 🧭 Diagram (ASCII)

+--------+     save     +-----------+
| live   | -----------> | snapshot  |
+--------+              +-----------+
     ^                       |
     |     restore          v
+--------+ <------------- +-----------+
| tests  |                | snapshot  |
+--------+                +-----------+

## ✅ Acceptance
- Round‑trip restores checksums; docs show usage.

## ⏱ Token Budget
~6K

## 🛠 Steps
1) state_snapshot.sh (save/restore)
2) README snippet + progress log
