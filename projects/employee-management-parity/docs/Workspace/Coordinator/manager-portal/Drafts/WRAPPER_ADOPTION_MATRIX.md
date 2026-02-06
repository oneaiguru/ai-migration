# WRAPPER_ADOPTION_MATRIX – Manager Portal (Draft)

| Demo | Screen | Feature Slot | Recommended Wrapper | Props (units/clamps/toggles/targets) | CH Ref | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Manager Portal | Dashboard | Bar chart (Team coverage) | `BarChart` | Units: %; Clamp: 70–100 | CH5 §5.2 | src/pages/Dashboard.tsx:<line> |
| Manager Portal | Dashboard | KPI grid | `KpiCardGrid` | Targets per KPI | CH5 §5.3 | src/pages/Dashboard.tsx:<line> |
| Manager Portal | Approvals | Review dialog | `Dialog` | requireNoteOnReject=true | CH6 §6.7 | src/pages/Approvals.tsx:<line> |
