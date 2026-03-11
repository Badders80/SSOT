# Repo Cleanup Baseline
Date: 2026-03-11

## Purpose
This document captures what appears to be active, what appears to be historical, and what should be archived or removed to make the build cleaner and more production-ready.

## Current Repo State
The repo is already mid-cleanup.
Observed signals:
- `git status` shows many tracked deletions across old horse documents, source spreadsheets, intake CSVs, and `Old_Pitch_Deck_Builder/`.
- `dist/` and `node_modules/` are local/generated and already ignored.
- dead-weight `public/assets/signiture.png` has been removed.
- the empty `Horses/` directory has been removed from the active surface.

This baseline assumes the current cleanup direction is intentional and should be formalized rather than reversed.

## Keep In Active Build
These areas appear to be part of the current working app and should stay in the active project surface:
- `App.tsx`
- `index.tsx`
- `index.html`
- `index.css`
- `package.json`
- `vite.config.ts`
- `scripts/sync-seed.mjs`
- `intake/v0.1/seed.json`
- `public/intake/v0.1/seed.json`
- `public/horse-images/*`
- `data/generated/hlt/.gitkeep`
- `data/generated/investor_updates/.gitkeep`
- `README.md`
- current docs under `docs/`

## Safe To Archive Or Remove From Active Surface
### Historical source docs and media
These appear to be source evidence or historical working files, not active application code:
- horse-specific document folders formerly under `Horses/Horse_*`
- standalone generated HLT HTML files under `Horses/`
- root reference files such as old briefs, specs, spreadsheets, and exported documents

Recommendation:
- move them to an external archive or to `docs/archive/` or `archive/` outside the active app surface,
- do not keep them mixed with app code.

### `Old_Pitch_Deck_Builder/`
This looks like a separate legacy app with its own package/config surface. Its remaining value is its UI direction, but that styling has already been absorbed into the live app shell (`index.css`, sidebar/nav/card system, blue/slate palette, and Manrope-based presentation).
Recommendation:
- archive it outside the main build repo once any remaining reference screenshots or notes are captured,
- do not keep it in the active build surface.

### Windows `:Zone.Identifier` artifacts
These are not useful source files and should not remain in the repo.
Recommendation:
- remove them wherever they still exist.

### Local build outputs
These should never be treated as source-of-truth project content:
- `dist/`
- `node_modules/`

Recommendation:
- keep ignored,
- exclude from cleanup discussions except when reclaiming disk space locally.

## Needs Decision Before Archiving
### `public/assets/signiture.png`
Decision: remove it.
Reason:
- it is untracked, unused, and currently dead weight.

### Empty `Horses/` directory
Decision: remove it.
Reason:
- it no longer has an active role in the build surface.

### Historical audit doc set
Current state:
- useful context remains in older docs,
- but some references point to deleted CSVs, deleted contracts, and old repo paths.

Recommendation:
- mark old docs as historical, or
- move them under `docs/archive/` once the new live docs exist.

## Production-Ready Target Structure
Recommended target layout:

```text
SSOT_Build/
  src/
    domain/
    features/
    ui/
    routes/
    lib/
  public/
    horse-images/
    intake/
  data/
    intake/
      v0.1/
    generated/
      hlt/
      investor_updates/
  docs/
    architecture/
    contracts/
    decisions/
    backlog/
    archive/
  scripts/
  services/
    api/
```

Why this helps:
- `src/` separates active frontend code from repo root clutter.
- `data/intake/` makes the canonical source area explicit.
- `data/generated/` keeps outputs separate from source.
- `docs/archive/` gives historical materials a home without making them look active.
- `services/api/` creates a landing zone for production replacements for Vite middleware.

## Cleanup Phases
### Phase 1: Clarify live system
- keep only live app code, seed, public runtime assets, scripts, and current docs in the active surface
- publish a current build map and current contract doc

### Phase 2: Remove ambiguity
- archive legacy horse evidence files and old deck-builder code
- remove `:Zone.Identifier` files
- confirm the dead asset and empty directory removals in the next cleanup pass

### Phase 3: Make production structure explicit
- move app code into `src/`
- move broken local middleware responsibilities toward deployable API functions
- move historical docs into `docs/archive/`
- leave the repo root with only app entrypoints, config, docs, data, and scripts

## Immediate Follow-Up List
1. Add a dedicated current data contract doc derived from `seed.json`.
2. Decide the document-path policy before fixing path strings.
3. Archive or delete `Old_Pitch_Deck_Builder/` rather than leaving it half-removed.
4. Archive remaining historical source material away from the active app surface.
5. Keep build-phase canonical data in git for now, but design a guarded dashboard snapshot/save flow instead of a raw browser-triggered git commit.
