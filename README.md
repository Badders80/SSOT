# SSOT Mission Control Prototype

SSOT dashboard prototype for Evolution Mission Control.

## Run

```bash
cd /home/evo/workspace/projects/SSOT_Build
npm install
npm run dev
```

Open `http://localhost:3000`.

## Working Docs

- `docs/architecture/CURRENT_BUILD_MAP_2026-03-11.md`: live rule map for the current build.
- `docs/audits/REPO_CLEANUP_BASELINE_2026-03-11.md`: cleanup, archive, and production-readiness baseline.
- Older docs in `docs/audits/` and `docs/architecture/` should be treated as historical context where they conflict with code.

## Internal Structure (Current)

- `App.tsx`: main UI and domain workflows.
- `intake/v0.1/`: canonical intake data contract + seed source.
- `public/intake/v0.1/seed.json`: runtime-served seed snapshot (auto-synced).
- `data/generated/investor_updates/`: local save target for investor update HTML.
- `docs/audits/`: audit and architecture reports.

## Data Source Rule

`intake/v0.1/seed.json` is canonical.

`npm run dev` and `npm run build` now run `npm run sync:seed` first, copying canonical seed into:

- `public/intake/v0.1/seed.json`

Manual command:

```bash
npm run sync:seed
```

## Local Persistence (By Design For Now)

- Multi-user persistence is not enabled yet.
- Runtime edits are stored in browser localStorage (`ssot_local_state_v1`) on top of the latest seed snapshot.
- Investor update "Save locally" writes server-side files using local Vite middleware.

## Generated Update Path

Default local write root:

- `/home/evo/workspace/projects/SSOT_Build/data/generated/investor_updates`

Override with env var:

- `SSOT_UPDATES_ROOT_ABS=/absolute/path`

## Live Wiring Enabled

- Seed snapshot loads from `/intake/v0.1/seed.json` (public copy).
- Horse names link to live breeding pages.
- Performance links open live profile pages.
- Intake queue source URLs are clickable.

## Next Steps

- Finalize the current archive/deletion set so collaborators can clearly distinguish active app files from historical material.
- Continue breaking up `App.tsx` into smaller feature modules now that route-level chunking is in place.
- Replace temporary `URL.createObjectURL(...)` image handling with durable saved asset paths for horses, trainers, and owners.
- Normalize the remaining legacy `evo` wrapper and helper scripts that still point at pre-workspace `/home/evo/_scripts` paths.
- Before external review, do one smoke pass in a fresh browser profile so localStorage does not carry over old demo edits.
