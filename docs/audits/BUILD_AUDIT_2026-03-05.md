# SSOT_Build Audit Report
Date: 2026-03-05
Scope: `/home/evo/projects/SSOT_Build` with emphasis on current "Stable-Trainer" equivalent (`#/trainers`, `Trainers_Stables`, trainer/owner flows in `App.tsx`).

## Executive Summary
The build is a functional single-page Vite app with strong prototype coverage (horse intake, trainer/owner profile drafting, HLT issuance generation, investor update generation), but persistence and structure are still prototype-grade.

Current state is:
- UI + domain logic live mostly in one file (`App.tsx`, ~5k lines).
- Primary data source is static seed JSON (`/intake/v0.1/seed.json` copied into `/public/intake/v0.1/seed.json`).
- Runtime writes are browser-local (`localStorage`), not shared multi-user state.
- "Local save" for investor updates writes to a hardcoded path in a different repo via Vite middleware (works in local/preview server, not a production Vercel runtime as-is).

For today’s Supabase sprint, this codebase is a good base, but you should first normalize folder boundaries and schema ownership so trainer/owner rollout can be replicated safely.

## Current Architecture

### Runtime Components
- Frontend app: [App.tsx](/home/evo/projects/SSOT_Build/App.tsx)
- Entry points: [index.tsx](/home/evo/projects/SSOT_Build/index.tsx), [index.html](/home/evo/projects/SSOT_Build/index.html)
- Dev/preview middleware + proxies: [vite.config.ts](/home/evo/projects/SSOT_Build/vite.config.ts)
- Seed data loaded from: `/intake/v0.1/seed.json` at runtime URL `/intake/v0.1/seed.json` (served from `public`)

### Data Flow (As Implemented)
1. App boot:
- Attempt load from `localStorage` key `ssot_local_state_v1`.
- Fallback to fetch `/intake/v0.1/seed.json`.

2. Profile operations (horse/trainer/owner/governing):
- Create/edit in React state.
- Persist to localStorage only.
- No DB/API persistence.

3. HLT issuance:
- Wizard computes `LeaseRecord` + `DocumentRecord`.
- Downloads generated HTML immediately.
- Updates in-memory `seed` state (thus localStorage on next persist).

4. Investor updates:
- Download as HTML/DOCX/PDF client-side.
- Optional POST `/__save_investor_update` to write HTML file to:
  `/home/evo/projects/Evolution_Platform/public/updates/...`

### Production Constraint
- Routes like `/__save_investor_update`, `/__glm_profile`, `/__groq_profile`, `/__anthropic_profile` are wired in Vite middleware via `configureServer/configurePreviewServer`.
- These are not a deployed backend API by default; production hosting needs separate API routes/functions.

## Schema and Alignment

### Core Typed Domain in App
Declared in [App.tsx](/home/evo/projects/SSOT_Build/App.tsx):
- `HorseRecord`
- `LeaseRecord`
- `DocumentRecord`
- `TrainerRecord`
- `OwnerRecord`
- `GoverningBodyRecord`
- `IntakeRecord`
- `HLTRecord`

### Source Data Contract
Reference: [DATA_CONTRACT_v0.1.md](/home/evo/projects/SSOT_Build/intake/v0.1/DATA_CONTRACT_v0.1.md)
CSV set:
- [trainers.csv](/home/evo/projects/SSOT_Build/intake/v0.1/trainers.csv)
- [owners.csv](/home/evo/projects/SSOT_Build/intake/v0.1/owners.csv)
- [governing_bodies.csv](/home/evo/projects/SSOT_Build/intake/v0.1/governing_bodies.csv)
- [horses.csv](/home/evo/projects/SSOT_Build/intake/v0.1/horses.csv)
- [leases.csv](/home/evo/projects/SSOT_Build/intake/v0.1/leases.csv)
- [documents.csv](/home/evo/projects/SSOT_Build/intake/v0.1/documents.csv)
- [amendments.csv](/home/evo/projects/SSOT_Build/intake/v0.1/amendments.csv)
- [intake_queue.csv](/home/evo/projects/SSOT_Build/intake/v0.1/intake_queue.csv)

### Alignment Findings
1. Seed duplication risk:
- Two seed files exist:
  - [intake/v0.1/seed.json](/home/evo/projects/SSOT_Build/intake/v0.1/seed.json)
  - [public/intake/v0.1/seed.json](/home/evo/projects/SSOT_Build/public/intake/v0.1/seed.json)
- They differ currently (`cmp` indicates not identical), so drift risk is active.

2. CSV-to-Type projection loss:
- `trainers.csv` and `owners.csv` include `x_url`, `instagram_url`, `facebook_url`, `profile_origin`.
- `TrainerRecord`/`OwnerRecord` currently model `social_links?: string[]` and do not preserve per-network columns or `profile_origin` explicitly.

3. Document schema mismatch:
- `documents.csv` has fields like `source_system`, `checksum_sha256`.
- `DocumentRecord` in app does not model these fields.

4. Document path mismatch:
- `documents.csv` includes absolute paths such as `/home/evo/projects/SSOT_Build/Horse_First_Gear/...`.
- Actual files are under `/home/evo/projects/SSOT_Build/Horses/Horse_First_Gear/...`.
- Result: source file references can break if used directly.

5. Contract/status mismatch:
- Data contract says `identity_status` values are `verified | needs_review`.
- App can generate `manual` and `pending` values during Add Horse flow.

6. Hidden business rule in code:
- `OWN-002` owner record is auto-mirrored from `TRN-002` trainer fields in runtime logic.
- This should be explicit in schema/business rules, not implicit UI transform.

## Folder Structure Audit

### Observed Layout Risks
1. Mixed concerns at repo root:
- App code, raw docs, generated HTML, intake files, and legacy app all coexist at top level.

2. Legacy app nested with own dependencies:
- [Old_Pitch_Deck_Builder](/home/evo/projects/SSOT_Build/Old_Pitch_Deck_Builder) contains its own `node_modules` and `dist`.
- This increases repo weight and confusion.

3. Empty/unclear directories:
- [Trainers_Stables](/home/evo/projects/SSOT_Build/Trainers_Stables) and [Owners](/home/evo/projects/SSOT_Build/Owners) are currently empty.

4. Binary/source artifacts mixed:
- `:Zone.Identifier` artifacts are present across multiple files.

5. Hardcoded cross-repo write target:
- `EVOLUTION_UPDATES_ROOT` points outside this project in both app and Vite config.
- This couples builds and complicates deploy portability.

## Stable-Trainer Focus Findings
There is no dedicated `/repository/Stable-Trainer` code module yet.

Current trainer/owner base lives in:
- Trainer/owner data types + UI flow: [App.tsx](/home/evo/projects/SSOT_Build/App.tsx)
- Seed trainer/owner records: [public/intake/v0.1/seed.json](/home/evo/projects/SSOT_Build/public/intake/v0.1/seed.json)
- Intake source rows: [trainers.csv](/home/evo/projects/SSOT_Build/intake/v0.1/trainers.csv), [owners.csv](/home/evo/projects/SSOT_Build/intake/v0.1/owners.csv)

So for rollout, the practical “Stable-Trainer base” is the trainer/owner registry routes (`#/trainers`, `#/owners`) and related typed records.

## Recommended Internal Structure (Pre-Supabase)
Target structure:

```text
SSOT_Build/
  apps/
    web/                     # current Vite app (src, public, vite config)
  data/
    intake/
      v0.1/                  # canonical CSV + canonical seed only (single source)
    generated/
      hlt/
      investor_updates/
  content/
    horse_assets/
    legal_docs/
  services/
    api/                     # server functions or API routes for production
  supabase/
    migrations/
    seed/
    policies/
  docs/
    audits/
    architecture/
```

Minimum guardrails:
- Keep exactly one canonical `seed.json` source and generate public copy in build step.
- Move generated HTML/docs to `data/generated` (not mixed with source docs).
- Externalize path config (`EVOLUTION_UPDATES_ROOT`) to env.
- Split `App.tsx` into domain modules before Supabase wiring (models/services/views).

## Immediate Action List for Today’s Supabase Sprint
1. Freeze current schema contract in SQL terms (`horses`, `trainers`, `owners`, `leases`, `documents`, `intake_queue`, `governing_bodies`, `amendments`).
2. Create `supabase/migrations/001_init.sql` from current typed schema (including foreign keys).
3. Add `supabase/migrations/002_rls.sql` with role-based access for external submitters vs internal admins.
4. Replace local-only writes for trainer/owner additions with Supabase insert/update (keep local draft UX).
5. Move investor update save endpoint from Vite middleware to deployable API route (or Supabase Edge Function).

## Verification Notes
- Build test run passed: `npm run build`.
- Warning observed: one large JS chunk (>500 kB), expected from monolithic client app.
