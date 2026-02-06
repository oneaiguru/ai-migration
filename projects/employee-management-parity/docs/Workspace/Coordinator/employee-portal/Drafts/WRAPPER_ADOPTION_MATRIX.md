# Wrapper Adoption Matrix – WFM Employee Portal (Staging Draft)

| Screen | Feature Slot | Wrapper | Props (units/clamps/toggles/targets) | CH Ref | Evidence |
| --- | --- | --- | --- | --- | --- |
| Vacation Requests | Requests list | ReportTable | columns: type, period, days, submitted, status | CH6 §6.2 | src/pages/VacationRequests.tsx:201–236 |
| Vacation Requests | New Request modal | Dialog + FormField | required: type/start/end; textarea=reason; checkbox=isEmergency | CH6 §6.7 | src/pages/VacationRequests.tsx:276–383 |
| Vacation Requests | Filters | FilterGroup | tabs: all/pending/approved/rejected | CH6 §6.1 | src/pages/VacationRequests.tsx:169–185 |
| Profile | Profile form | FormField | fields: firstName,lastName,birthDate + emergency contact | Appendix 1 #3/#4 | src/pages/Profile.tsx:183–229, :247–294 |

Charts: none.

