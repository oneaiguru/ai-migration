# Site‑level Data Contract (ingest expectations)

## Registry (one row per площадка)
- site_id (string, stable), district (string), lat (float), lon (float)
- bin_count (int), bin_size_liters (float), bin_type (enum), land_use (enum/str)
- optional: address, commissioning_dt, decommissioning_dt

## Service history
- site_id, service_dt (YYYY-MM-DD), optional service_time
- emptied_flag (bool) — full empty vs partial
- collect_volume_m3 (float, optional)
- optional: route_id, vehicle_id, weighbridge_batch_id

## Quality
- Keys unique: (site_id, service_dt, optional service_time)
- No negative mass; date within source range
- If mass missing, we model in liters using bin_size×bin_count

---