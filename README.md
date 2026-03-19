# SSOT Build

Working prototype for the Single Source of Truth that defines a horse, its lease structure, and the downstream HLT document set.

## What This Build Is

This repo is the working prototype for the Single Source of Truth used to define a horse, its commercial lease terms, and the downstream documents derived from that record. The goal is to reduce drift across HLT outputs by anchoring every lease to one canonical record instead of repeating horse identity details across disconnected files.

## Source of Truth Concept

The SSOT starts with Stud Book identity data. The Stud Book establishes the factual horse record, and the microchip acts as the durable unique identifier that ties that record together. Once the identity layer is resolved, commercial lease terms are added to the same canonical record. Together, those two layers become the SSOT from which derived HLT outputs and downstream documents are generated.

![Stud Book identity layer](docs/assets/stud-book-i-stole-a-manolo-crop.png)

_Illustrative Stud Book identity layer. Fields such as foaling date, pedigree, life number, and microchip form the canonical horse identity base. The live source example used in this build is the Loveracing Stud Book page for [I Stole A Manolo (NZ) 2023](https://loveracing.nz/Breeding/451442/I-Stole-A-Manolo-NZ-2023.aspx)._

## How the SSOT Works

1. **Stud Book identity data**  
   Verified horse identity starts upstream in the Stud Book or equivalent source evidence.
2. **Microchip-anchored canonical record**  
   The microchip is used as the unique identifier that anchors the horse identity record.
3. **Current linked associations selected**  
   Trainer / stable, owner, and governing body are linked explicitly for HLT readiness, but they are not the horse's intrinsic identity.
4. **Commercial lease terms added**  
   Lease percentages, token structure, pricing, and issuance terms are layered onto the selected source records.
5. **Derived HLT outputs**  
   HLT records, investor updates, and downstream documents are generated from the combined canonical record.

This build exists to reduce document drift by deriving outputs from one canonical source set instead of manually re-entering horse and lease details in multiple places.

## Current Prototype State

- This is a local-first prototype, not yet a production multi-user system.
- Canonical repo data currently lives in `intake/v0.1/seed.json`.
- Runtime edits are layered on top of the latest seed snapshot via browser localStorage (`ssot_local_state_v1`).
- Generated outputs can be downloaded client-side and investor updates can be saved locally during the build phase.

## Template Library Structure

The template and document workflow is now explicitly local-first:

- raw imports and working material live under `intake/ad_hoc/`
- versioned canonical template definitions live under `data/templates/`
- curated reusable knowledge lives under `data/library/`
- canonical supporting assets live under `data/assets/`
- generated outputs stay under `data/generated/`

Current in-scope template families:

- HLT Issuance Term Sheet
- Product Disclosure Statement
- Syndicate Agreement
- VARA Whitepaper
- DS Data Fields
- Investor Updates

## Firestore Stage One

The first Firestore write surface should be horse identity only:

- `horses/{microchip_number}`

Stage one is for core horse metadata derived from Loveracing / Stud Book evidence:

- microchip
- Stud Book record ID
- horse name
- pedigree link
- horse performance link
- core factual horse fields
- verification / source metadata

Trainer / stable, owner, governing body, lease terms, HLT records, and media assets come later as separate modules.

## Firestore Walkthrough

If you want to follow the first two horses through the Firestore workflow without wiring the full browser adapter yet, use the prepared stage-one path:

1. Start from the current local horse records in `intake/v0.1/seed.json`.
2. Normalize them into the stage-one Firestore shape with `src/lib/ssot/firestore-horse-stage-one.ts`.
3. Use the prepared console payload in `data/firestore/stage-one/horses.prudentia-first-gear.json`.
4. Create or update Firestore docs under:
   - `horses/985125000126713`
   - `horses/985125000126462`

Important notes:

- The existing local `horse_id` values such as `HRS-001` and `HRS-002` are legacy internal IDs. They are not the Firestore doc IDs and they are not the Stud Book IDs.
- `stud_book_id` should be derived from the Loveracing / Stud Book source evidence. In the current helper, it is extracted from the Stud Book URL path.
- Stage one is identity only. Do not write `current_associations`, lease terms, HLT records, or media into these horse docs yet.

Manual console flow:

1. Open Firestore Database for the target Google project.
2. Create a collection named `horses` if it does not exist yet.
3. Open `data/firestore/stage-one/horses.prudentia-first-gear.json`.
4. For each entry in `documents`:
   - use `doc_id` as the Firestore document ID
   - paste the matching `data` object into the document body
5. Save the two horse docs and stop there for stage one.

Automated write once Firestore exists:

```bash
cd /home/evo/workspace/projects/SSOT_Build
python3 scripts/write_stage_one_horses_to_firestore.py
```

That script writes the prepared payload in `data/firestore/stage-one/horses.prudentia-first-gear.json` into the live `horses` collection using ADC.

This gives you a clean first milestone:

- horse identity truth is in Firestore
- microchip is the document key
- Stud Book / Loveracing evidence is preserved
- association and commercial layers remain separate until their own modules are ready

## Horse Sync Status

The app now keeps a tiny local-first horse sync state so the repository surface can stay unchanged while Firestore is coming online.

- `local`: the horse record only exists in the local repository surface or has not been confirmed against Firestore yet
- `firestore`: the horse identity record exists in Firestore, but local parity has not been confirmed yet
- `synced`: local stage-one horse identity and Firestore stage-one horse identity have both been checked

For now this status is intentionally manual and local-first. The current build still does not have a validated browser-side Firestore read/write adapter, so the status layer is there to support the transition without removing local fallback content.

## Profile Images

Profile images should not be stored in Firestore documents.

The intended model is:

- Firestore stores profile-image metadata only
- Cloud Storage stores the actual file blob
- storage object paths should use a stable entity key, for example:
  - `ssot/horses/{microchip_number}/profile/{file_name}`
  - `ssot/trainers/{trainer_id}/profile/{file_name}`
  - `ssot/owners/{owner_id}/profile/{file_name}`

The current horse detail view now exposes the planned Cloud Storage path so image migration can be staged after horse identity sync is proven.

## Quick Start

```bash
cd /home/evo/workspace/projects/SSOT_Build
npm install
npm run dev
```

Open `http://localhost:3000`.

## Canonical Data Rule

`intake/v0.1/seed.json` is the canonical record inside this repo.

`npm run dev` and `npm run build` run `npm run sync:seed` first, copying the canonical seed into:

- `public/intake/v0.1/seed.json`

Manual command:

```bash
npm run sync:seed
```

Manual edits should be made in `intake/v0.1/seed.json`, not in the public runtime copy.

## Collaborator-Facing Repo Surface

The main repo page should stay focused on the active build surface:

- `README.md`
- `package.json`
- `package-lock.json`
- `vite.config.ts`
- `tsconfig.json`
- `index.html`
- `index.tsx`
- `index.css`
- `App.tsx`
- `src/`
- `public/`
- `intake/`
- `scripts/`
- `docs/`

Historical specs, archived builders, generated output, and Windows metadata files should stay out of the live repo surface.

## Working Docs

- `docs/architecture/CURRENT_BUILD_MAP_2026-03-11.md`: live rule map for the current build.
- `docs/contracts/CURRENT_DATA_CONTRACT_2026-03-13.md`: active modular SSOT contract separating horse identity truth from current HLT associations, lease terms, and derived HLT assembly.
- `docs/contracts/FIRESTORE_WRITE_MAP_2026-03-13.md`: current-to-target mapping from local save actions to canonical and derived Firestore write surfaces, aligned to the modular qualification model.
- `docs/decisions/ADR-001-local-first-template-library.md`: local-first repository structure and promotion workflow for template intake, canonical template versions, curated knowledge, and assets.
- `docs/audits/REPO_CLEANUP_BASELINE_2026-03-11.md`: cleanup, archive, and production-readiness baseline.
- Older docs in `docs/audits/` and `docs/architecture/` should be treated as historical context where they conflict with code.

## Current Working Capabilities

- Seed snapshot loads from `/intake/v0.1/seed.json` via the public synced copy.
- Horse identity links connect to live breeding pages and performance profiles.
- The app supports local-first editing of horses, trainers, owners, leases, documents, intake, and archive state.
- Investor updates can be downloaded as HTML, DOCX, or PDF, and can also be saved locally through the Vite middleware flow.
- Stage-one Firestore horse payloads can now be derived from the current local horse shape via `src/lib/ssot/firestore-horse-stage-one.ts`.

## Current Limitations

- Multi-user persistence is not enabled yet.
- Uploaded images still use temporary browser object URLs rather than durable saved asset paths.
- The core app logic still lives primarily in `App.tsx`, even though route-level chunking is now in place.
- The horse sync state is still manual until a validated Firestore read/write adapter exists.
- Some historical seed metadata still carries pre-workspace absolute paths and needs cleanup.

## Near-Term Next Steps

- Wire Firestore into the live `SSOT_Build` horse surface: replace the manual sync badge with a real Firestore-backed read check and prove parity against the local horse records.
- Finalize the current archive/deletion set so collaborators can clearly distinguish active app files from historical material.
- Continue breaking up `App.tsx` into smaller feature modules.
- Replace temporary `URL.createObjectURL(...)` image handling with durable saved asset paths for horses, trainers, and owners.
- Keep the local horse fallback in place until the browser-side Firestore adapter is wired and parity is proven against the live `horses` collection.
- Normalize the remaining legacy `evo` wrapper and helper scripts that still point at pre-workspace `/home/evo/_scripts` paths.
- Do one smoke pass in a fresh browser profile so localStorage does not carry over old demo edits before broader external review.

## Technical Backlog

### [Infrastructure] Implement Repository Seam for SSOT Data
**Project:** `Evolution_Platform` (Next.js) & `Evolution_Studio` (Python)
**Phase:** 1 (Cloud Integration)
**Status:** Backlog

**Context:** The canonical SSOT data currently lives in `projects/SSOT_Build/intake/v0.1/seed.json`. As we migrate the 4-layer architecture toward Google Cloud Firestore (Native Mode), we should create a repository seam before changing storage. That keeps local development working, avoids breaking current route consumers, and gives both local-file and Firestore-backed implementations the same contract.

**Action Items (Next.js):**
- [ ] Refactor `src/lib/ssot/seed-loader.ts` so direct file system reads sit behind a repository boundary.
- [ ] Define a strict `SsotRepository` or `SsotReadRepository` TypeScript interface that matches the current SSOT read surface.
- [ ] Build `LocalSsotRepository` (implements interface, reads `seed.json` via `SSOT_SEED_PATH` when provided).
- [ ] Build `FirestoreSsotRepository` (implements interface, reads from Google Cloud Firestore Native Mode).
- [ ] Add `SSOT_DATA_SOURCE=local|firestore` to `Evolution_Platform/.env.example` and the unified env vault.
- [ ] Implement a factory function that returns the correct repository based on the env flag.
- [ ] Add parity tests that prove local and Firestore repositories return the same canonical `SsotSeed` shape.

**Action Items (Python / Evolution_Studio):**
- [ ] Replicate the repository pattern in the Python backend.
- [ ] Replace direct `db.sqlite3` or local-seed reads with the Python SSOT repository equivalent.
- [ ] Keep a local repository implementation available during migration so Studio can run without a hard GCP dependency.
