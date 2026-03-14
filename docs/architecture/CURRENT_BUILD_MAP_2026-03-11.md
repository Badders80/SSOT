# Current Build Map
Date: 2026-03-11

## Purpose
This document is the first-pass map of the live SSOT_Build logic as it exists in the current repo snapshot. It is intended to separate:
- active runtime rules,
- historical/stale documentation,
- cleanup and production-readiness work that should happen next.

## Rule Hierarchy (Current Truth Order)
When documents disagree, use this order:

1. `package.json`
Defines which scripts actually run for development and build.

2. `scripts/sync-seed.mjs`
Defines how canonical intake data is copied into the runtime-served public seed.

3. `intake/v0.1/seed.json`
Current canonical domain payload for trainers, owners, horses, leases, documents, intake queue, amendments, and metadata.

4. `App.tsx`
Defines the live application schema, routing, persistence, generated-document logic, and UI business rules.

5. `vite.config.ts`
Defines local-only middleware, investor update file writes, profile proxy endpoints, and dev server wiring.

6. `README.md`
Operator-oriented summary. Useful, but secondary to executable code.

7. Older docs in `docs/audits/` and `docs/architecture/`
Useful context only. Some assumptions are already stale after the March 2026 cleanup/migration work.

## Active Runtime Components
Current active app surface:
- `App.tsx`: single-file React app containing types, workflows, helpers, and page rendering.
- `index.tsx`: React entrypoint.
- `index.html` and `index.css`: app shell and styling.
- `public/intake/v0.1/seed.json`: runtime-served seed snapshot.
- `public/horse-images/*`: seeded horse imagery used by the UI.
- `scripts/sync-seed.mjs`: canonical seed sync step.
- `vite.config.ts`: local middleware and dev/preview runtime behavior.

## Runtime Rules
### Build and startup rules
- `npm run dev` executes `npm run sync:seed` before starting Vite.
- `npm run build` executes `npm run sync:seed` before building.
- `npm run preview` does not sync; it serves the already-built output.
- The dev server binds to `127.0.0.1:3000`.

Source references:
- `package.json`
- `scripts/sync-seed.mjs`
- `vite.config.ts`

### Canonical data rule
- `intake/v0.1/seed.json` is the current canonical source inside this repo.
- `public/intake/v0.1/seed.json` is a generated runtime copy.
- The sync script validates the canonical seed as JSON before copying it.

Implication:
- Manual edits should happen in `intake/v0.1/seed.json`, not in `public/intake/v0.1/seed.json`.

### Client boot and persistence rules
On boot, the app:
1. Parses the hash route.
2. Attempts to load persisted state from browser `localStorage` key `ssot_local_state_v1`.
3. Fetches `/intake/v0.1/seed.json` with `cache: 'no-store'`.
4. Uses the latest fetched seed when available.
5. Falls back to persisted seed if fetch fails and persisted data exists.

After boot, the app persists the working state back into `localStorage` whenever the in-memory seed or custom/edit state changes.

Implication:
- This is local-first, browser-scoped persistence.
- It is not multi-user and not server-authoritative.

### Routing rules
Routing is hash-based and implemented in `App.tsx`.
Current top-level surfaces include:
- `#/dashboard`
- `#/horses`
- `#/horse/:id`
- `#/trainers`
- `#/owners`
- `#/governing-bodies`
- `#/leases`
- `#/documents/templates`
- `#/documents/generated`
- `#/compliance/*`
- `#/intake`

### HLT generation rules
The HLT workflow:
- derives token naming and issuance details in the client,
- downloads a generated HTML document locally,
- appends a new `LeaseRecord` and `DocumentRecord` into in-memory state,
- relies on `localStorage` persistence to retain that new data.

Important nuance:
- HLT generation does not write the generated termsheet into the repo filesystem.
- The generated `DocumentRecord.file_path` is treated as a target path label, not proof that a file was written there.

### Investor update rules
Investor updates can be:
- downloaded client-side as HTML, DOCX, or PDF, or
- saved locally as HTML by POSTing to `/__save_investor_update`.

The save endpoint:
- is available through Vite middleware in dev and preview,
- only accepts loopback/local requests,
- writes to `SSOT_UPDATES_ROOT_ABS` when defined,
- otherwise writes to `data/generated/investor_updates/`.

### AI/profile enrichment rules
Profile text generation and enrichment are currently mediated through Vite middleware endpoints such as:
- `/__glm_profile`
- `/__groq_profile`
- `/__anthropic_profile`
- `/__url_proxy`

These are local middleware endpoints, not production API routes.

## Current Schema State
### Seed is richer than app types
`seed.json` currently contains fields not modeled in the top-level TypeScript records.
Examples:
- trainers/owners: `x_url`, `instagram_url`, `facebook_url`, `profile_origin`
- documents: `source_system`, `checksum_sha256`
- intake queue: `submitted_at`, `submitted_by`, `parsed_nztr_life_number`, `parsed_microchip`, `parsed_performance_profile_url`, `parse_notes`
- metadata: `_meta.version`, `_meta.sourcePath`, `_meta.sourceFiles`

Implication:
- The live data contract is not fully captured by the `App.tsx` types.
- Refactors should align the app schema to the canonical seed before moving logic around.

### Seed path metadata is stale
`seed.json` still contains absolute paths under `/home/evo/projects/SSOT_Build/...`.
That includes document `file_path` values and `_meta.sourcePath`.

Implication:
- Some file references reflect the pre-workspace path layout.
- These should be normalized after the schema contract is frozen.

### Document link behavior is narrower than document data suggests
`docWebHref()` only treats these as openable links:
- `/horses/...`
- `http://...`
- `https://...`

Implication:
- Absolute filesystem paths stored in `seed.json` are currently displayed as text, not as working browser links.
- Path cleanup should be paired with an explicit decision: metadata-only paths or actual web-served document paths.

## Known Stale or Broken Assumptions
### Historical docs are partially stale
The existing audit doc references assets and CSV/data-contract files that are currently deleted from the worktree. It should be treated as historical context, not source of truth.

### Legacy UI value has already been preserved
The only meaningful remaining value in `Old_Pitch_Deck_Builder/` is its visual language. That value is already reflected in the live app through `index.css` and the current dashboard shell: the blue/slate palette, gradient background, `mission-grid`, `surface-card`, and `nav-item` patterns are active, and the app now uses `Manrope` as its primary UI font.

### Repo is mid-cleanup
Git status shows a substantial cleanup already underway, including removed horse source docs, old pitch-deck code, and legacy intake CSV/contract files.
This means some historical documentation describes structures that are intentionally being removed.

### Build-phase data can stay in git for now
Because the project is still in an active build-and-test phase, keeping canonical testing data in the repo is reasonable. The important constraint is to separate canonical seed data from generated outputs and to avoid accidental commits of noisy local artifacts.

Suggested workflow:
- keep canonical test data in `intake/v0.1/seed.json`,
- sync public runtime seed from that source,
- keep generated outputs under `data/generated/`,
- add a guarded dashboard action later for preparing a save/commit workflow.

Recommendation:
- prefer a `Prepare Snapshot` or `Save Seed Changes` dashboard action over a raw `Commit Changes` button,
- show validation status and the affected files before asking a human to finalize the git commit.

## Recommended Documentation Structure
To keep rules, logic, and cleanup work understandable, the repo should converge on this documentation layout:

```text
SSOT_Build/
  docs/
    architecture/
      CURRENT_BUILD_MAP.md         # live runtime and rule map
      TARGET_STRUCTURE.md          # intended production structure
    contracts/
      CURRENT_DATA_CONTRACT.md     # actual canonical seed schema
      FIELD_RULES.md               # statuses, IDs, naming rules, generated fields
    decisions/
      ADR-001-canonical-seed.md
      ADR-002-local-first-persistence.md
      ADR-003-document-path-policy.md
    backlog/
      PRODUCTION_READINESS.md
      CLEANUP_CHECKLIST.md
    archive/
      2026-03/
        historical-audits/
        old-specs/
```

Suggested ownership by document type:
- `architecture/`: how the system works now and where it is going.
- `contracts/`: the real schema and business rules.
- `decisions/`: why choices were made.
- `backlog/`: what still needs doing.
- `archive/`: old but retained context.

## Immediate Next Actions
1. Freeze the current data contract from `seed.json` into a dedicated contract doc.
2. Decide whether document paths are metadata, filesystem targets, or public URLs.
3. Normalize stale absolute paths after the path policy is agreed.
4. Remove or repair the broken `Content Studio` route.
5. Split `App.tsx` only after rules and schema are stable enough to preserve behavior during refactor.
