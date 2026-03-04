# Internal Structure Baseline (Pre-Supabase)
Date: 2026-03-05

## Goal
Keep current local-first behavior, but align folders and data ownership so Supabase migration can be incremental.

## Canonical Sources
- Canonical seed source: `intake/v0.1/seed.json`
- Runtime-served seed: `public/intake/v0.1/seed.json` (synced by `npm run sync:seed`)

## Generated Artifacts
- Investor update local saves: `data/generated/investor_updates/`
- HLT generated artifacts (planned): `data/generated/hlt/`

## Config Rule
- Do not hardcode external-repo write paths.
- Use `SSOT_UPDATES_ROOT_ABS` when a non-default write root is required.

## Next Refactor Milestones
1. Split `App.tsx` into `src/domain/*`, `src/features/*`, `src/ui/*`.
2. Move Vite middleware routes into deployable API routes/functions.
3. Add `supabase/migrations` with schema mirrored from current typed records.
4. Replace localStorage writes with repository + API writes behind feature toggles.
