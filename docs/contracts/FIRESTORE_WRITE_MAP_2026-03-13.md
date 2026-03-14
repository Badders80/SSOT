# Firestore Write Map
Date: 2026-03-13
Status: ACTIVE

## Purpose

Map the current `SSOT_Build` local save actions to the future Firestore write surfaces so implementation can replace browser-local overlays without changing the modular contract.

## Implementation Order

1. Lock the `SSOT_Build` module contract and write boundaries.
2. Define the narrow shared Firestore rules for canonical authoring and downstream consumption.
3. Replace `localStorage` and in-memory local overlays in `SSOT_Build` with repository writes behind the same module boundaries.
4. Update downstream consumers such as `Evolution_Platform` to read the published SSOT surface instead of authoring it.

This means:

- local build contract first
- shared Firestore usage rules second
- project implementation third
- downstream adoption last

## Shared Firestore Rules

- Canonical writes originate in `SSOT_Build` only.
- Each repository section writes to its own canonical collection.
- HLT is derived and must not create missing repository entities.
- HLT creation is blocked unless one identity-qualified `horse`, one qualified `trainer/stable`, one qualified `owner`, one qualified `governing body`, and one complete lease terms record are selected.
- Horse identity truth must remain distinct from the horse's current linked trainer, owner, and governing-body associations.
- Downstream apps consume canonical and derived records but do not author them.
- Hidden defaults, silent fallbacks, and cross-module mirroring should not be preserved as Firestore rules unless explicitly promoted into the contract.

## Canonical Write Surfaces

### Horses

Current local actions:

- `handleAddHorse` prepares the candidate record and review state.
- `saveHorseProfile` creates the new horse record in local custom state.
- `saveHorseUpdate` edits an existing horse in local edit state.

Future Firestore surface:

- `horses/{microchip_number}`

Notes:

- Image handling and asset-path metadata should remain adjunct metadata, not part of the identity rule itself.
- The horse module is the canonical home for Loveracing-derived identity fields.
- Stage one writes horse identity only, not HLT associations.
- Current trainer, owner, and governing-body references may later live on the horse record as explicit current/default links for HLT readiness, but they must not be treated as horse identity truth.
- Repository extraction should expose identity qualification separately from current association readiness so HLT depends on module qualification rather than raw field coupling.

Stage-one document contract:

- `microchip_number`
- `horse_name`
- `stud_book_id`
- `country_code`
- `foaling_year`
- `foaling_date`
- `sex`
- `colour`
- `sire_name`
- `dam_name`
- `pedigree_url`
- `horse_performance_url`
- `identity_status`
- `source.system`
- `source.verified_at`
- `source.last_checked_at`

Current-to-target field mapping for stage one:

- current local `horse_id` is a legacy internal record ID and must not be copied directly into `stud_book_id`
- derive `stud_book_id` from the Loveracing / Stud Book source evidence, preferably from the `breeding_url` / `pedigree_url` path segment
- current `breeding_url` -> `pedigree_url`
- current `performance_profile_url` -> `horse_performance_url`
- current `sire` -> `sire_name`
- current `dam` -> `dam_name`

Stage-one exclusion rule:

- Do not write `current_associations` in the initial horse registration pass unless they are explicitly being managed.
- Do not write media, uploaded image blobs, or asset payloads into the horse document.

### Trainers / Stables

Current local actions:

- `buildTrainerDraft` prepares enrichment review state.
- `saveTrainerProfile` creates the trainer/stable record in local custom state.
- `saveTrainerUpdate` edits an existing trainer/stable record in local edit state.

Future Firestore surface:

- `trainers/{trainerId}`

### Owners

Current local actions:

- `buildOwnerDraft` prepares enrichment review state.
- `saveOwnerProfile` creates the owner record in local custom state.
- `saveOwnerUpdate` edits an existing owner record in local edit state.

Future Firestore surface:

- `owners/{ownerId}`

Important current coupling to remove or formalize:

- The app currently mirrors owner `OWN-002` from trainer `TRN-002` in UI composition. That should not silently become a Firestore rule.

### Governing Bodies

Current local actions:

- `handleAddGoverningBody` prepares review state.
- `saveGoverningBodyProfile` creates the governing-body record in local custom state.
- `saveGoverningUpdate` edits an existing governing-body record in local edit state.

Future Firestore surface:

- `governing_bodies/{governingBodyCode}`

Important current coupling to remove or formalize:

- The app currently injects `NZTR` and `DRC` defaults when absent. That should be explicit seed/bootstrap behavior, not hidden runtime logic.

### Lease Commercial Terms

Current local actions:

- `generateAndSaveHlt` currently assembles an HLT outcome and then writes the resulting commercial lease record into `seed.leases`.

Future Firestore surface:

- `lease_terms/{leaseId}`

Notes:

- Lease commercial terms are canonical.
- HLT generation may create or confirm a lease terms record when the HLT is formally confirmed, but that write must still target the lease module, not bypass it.
- Lease qualification is a separate precondition; HLT must not be used to smuggle incomplete lease inputs past module validation.

## Derived Write Surfaces

### HLT Records

Current local actions:

- `generateAndSaveHlt` builds the HLT preview, downloads the generated HTML, and writes a `LeaseRecord` plus `DocumentRecord` into local in-memory state.

Future Firestore surface:

- `hlt_records/{hltId}`

Recommended stored content:

- selected source IDs
- source snapshot at generation time
- derived commercial values
- generation metadata
- document metadata references

### Document Metadata

Current local actions:

- `generateAndSaveHlt` appends a generated HLT document entry into `seed.documents`.
- Investor updates can be saved locally via `/__save_investor_update`, but they are not canonical source records.

Future Firestore surface:

- `documents/{documentId}`

Recommended scope:

- metadata for generated HLT outputs and other downstream documents
- no attempt to treat generated files themselves as canonical horse or lease state

### Archive / Removal State

Current local actions:

- `confirmRemoveTarget` removes records from local custom or edit state and writes archive metadata into `archivedRecords`.
- `restoreArchivedRecord` restores from local archive metadata.

Future Firestore surface:

- preferred: soft-delete or archive metadata on the canonical collection
- optional: dedicated `archives` collection if the archive needs separate operational handling

Recommended rule:

- avoid hard deletes by default
- archive and restore should preserve identity and auditability

## Current Local-Only Storage To Replace

- browser `localStorage` payload under `ssot_local_state_v1`
- `customHorses`
- `customTrainers`
- `customOwners`
- `customGoverningBodies`
- `horseEdits`
- `trainerEdits`
- `ownerEdits`
- `governingEdits`
- local in-memory HLT lease/document appends

## Current Non-Canonical Or Local-Only Outputs

These should remain outside the canonical write path unless explicitly promoted later:

- investor update local HTML saves
- downloaded HLT HTML / DOCX / PDF files
- temporary browser object URLs for uploaded images
- review modal state and enrichment draft state

## Suggested Implementation Sequence In Code

1. Add repository interfaces for `horses`, `trainers`, `owners`, `governing_bodies`, `lease_terms`, and `hlt_records`.
2. Add module qualification helpers so `horse` identity qualification, current association readiness, and lease qualification are explicit code paths rather than implicit UI behavior.
3. Replace each `save*` action in `SSOT_Build` with a repository write for its own module.
4. Replace archive/remove flows with soft-archive repository operations.
5. Change HLT generation so it reads selected qualified module records, writes canonical lease terms, writes a derived `hlt_record`, and appends document metadata through explicit repositories.
6. Remove the `localStorage` overlay as the source of truth once repository parity is verified.

## Context Chain
<- inherits from: /home/evo/workspace/AGENTS.md
-> related contract: /home/evo/workspace/projects/SSOT_Build/docs/contracts/CURRENT_DATA_CONTRACT_2026-03-13.md
-> related runtime map: /home/evo/workspace/projects/SSOT_Build/docs/architecture/CURRENT_BUILD_MAP_2026-03-11.md
-> conventions: /home/evo/workspace/DNA/ops/CONVENTIONS.md
