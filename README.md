# SSOT Mission Control Prototype

SSOT dashboard prototype for Evolution Mission Control.

## Run

```bash
cd /home/evo/projects/SSOT_Build
npm install
npm run dev
```

Open `http://localhost:3000`.

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
- Runtime edits are stored in browser localStorage (`ssot_local_state_v1`).
- Investor update "Save locally" writes server-side files using local Vite middleware.

## Generated Update Path

Default local write root:

- `/home/evo/projects/SSOT_Build/data/generated/investor_updates`

Override with env var:

- `SSOT_UPDATES_ROOT_ABS=/absolute/path`

## Live Wiring Enabled

- Seed snapshot loads from `/intake/v0.1/seed.json` (public copy).
- Horse names link to live breeding pages.
- Performance links open live profile pages.
- Intake queue source URLs are clickable.
