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
3. **Commercial lease terms added**  
   Lease percentages, token structure, pricing, and issuance terms are layered onto that identity record.
4. **Derived HLT outputs**  
   HLT records, investor updates, and downstream documents are generated from the combined canonical record.

This build exists to reduce document drift by deriving outputs from one canonical source set instead of manually re-entering horse and lease details in multiple places.

## Current Prototype State

- This is a local-first prototype, not yet a production multi-user system.
- Canonical repo data currently lives in `intake/v0.1/seed.json`.
- Runtime edits are layered on top of the latest seed snapshot via browser localStorage (`ssot_local_state_v1`).
- Generated outputs can be downloaded client-side and investor updates can be saved locally during the build phase.

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
- `docs/audits/REPO_CLEANUP_BASELINE_2026-03-11.md`: cleanup, archive, and production-readiness baseline.
- Older docs in `docs/audits/` and `docs/architecture/` should be treated as historical context where they conflict with code.

## Current Working Capabilities

- Seed snapshot loads from `/intake/v0.1/seed.json` via the public synced copy.
- Horse identity links connect to live breeding pages and performance profiles.
- The app supports local-first editing of horses, trainers, owners, leases, documents, intake, and archive state.
- Investor updates can be downloaded as HTML, DOCX, or PDF, and can also be saved locally through the Vite middleware flow.

## Current Limitations

- Multi-user persistence is not enabled yet.
- Uploaded images still use temporary browser object URLs rather than durable saved asset paths.
- The core app logic still lives primarily in `App.tsx`, even though route-level chunking is now in place.
- Some historical seed metadata still carries pre-workspace absolute paths and needs cleanup.

## Near-Term Next Steps

- Finalize the current archive/deletion set so collaborators can clearly distinguish active app files from historical material.
- Continue breaking up `App.tsx` into smaller feature modules.
- Replace temporary `URL.createObjectURL(...)` image handling with durable saved asset paths for horses, trainers, and owners.
- Normalize the remaining legacy `evo` wrapper and helper scripts that still point at pre-workspace `/home/evo/_scripts` paths.
- Do one smoke pass in a fresh browser profile so localStorage does not carry over old demo edits before broader external review.
