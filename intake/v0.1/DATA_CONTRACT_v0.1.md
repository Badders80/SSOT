# Data Contract v0.1

Scope: SSOT_Build sandbox intake for a working portal prototype.
Path: /home/evo/projects/SSOT_Build/intake/v0.1

## Files

- trainers.csv
- owners.csv
- governing_bodies.csv
- horses.csv
- leases.csv
- documents.csv
- amendments.csv
- intake_queue.csv

## Rules

1. breeding_url format: https://loveracing.nz/Breeding/<id>/<slug>.aspx
2. performance_profile_url must be a Loveracing URL.
3. IDs are immutable (TRN-001, OWN-001, HRS-001, LSE-001, etc).
4. Dates use ISO format: YYYY-MM-DD.
5. Money and percentages are numeric only (no $ or % signs).
6. profile_origin values: seed | custom.
7. lease_status values: draft | proposed | active | completed.
8. entity_type values: company | trust | individual.
9. identity_status values: verified | needs_review.
10. Conflicts (example microchip mismatch) must be logged in source_notes and set identity_status=needs_review.

## Source Priority

1. Horse identity and base facts: Loveracing breeding page + performance profile page link.
2. Commercial and lease terms: PDS + Syndicate Agreement.
3. Token/VA framing: Whitepaper.

## Notes

- "Add New Profile" in UI writes profile_origin=custom.
- Existing profiles loaded from seed files write profile_origin=seed.
