# Current Data Contract
Date: 2026-03-13
Status: ACTIVE

## Purpose

Define the stable modular contract for `SSOT_Build` so future Firestore implementation follows domain boundaries instead of current UI quirks.

## Canonical Rule

- `SSOT_Build` is the origin for canonical horse, repository, and lease-commercial data.
- `Evolution_Platform` consumes published SSOT data and should not author canonical horse or lease records.
- The upstream factual horse identity source is the official Loveracing / Stud Book registration page or equivalent governing-body evidence.
- The horse microchip is the primary real-world identity anchor.
- Current trainer, owner, and governing-body selections are linked association state used for HLT readiness, not part of the horse's intrinsic identity truth.
- HLT is a derived outcome, never the origin.

## Core Assembly Rule

`Qualified Horse + Qualified Trainer/Stable + Qualified Owner + Qualified Governing Body + Complete Lease Commercial Terms = HLT`

Implications:

- One record from each repository section must be selected before HLT can be created.
- If a required record does not exist yet, it must be created in its repository section before HLT assembly continues.
- HLT generation must not silently create missing repository entities.

## Modular Boundaries

### 1. Horses

Responsibility:

- Hold the canonical horse identity layer sourced from Loveracing / Stud Book evidence.
- Allow current linked association references later for HLT readiness without redefining horse identity around them.

Stage-one Firestore identity surface:

- `horses/{microchip_number}`

Stage-one required identity fields:

- `microchip_number`
- `horse_name`
- `stud_book_id`
- `pedigree_url`
- `horse_performance_url`
- `identity_status`
- `source.system`

Stage-one core factual fields:

- `horse_name`
- `country_code`
- `foaling_year`
- `foaling_date`
- `sex`
- `colour`
- `sire_name`
- `dam_name`
- `stud_book_id`
- `microchip_number`
- `pedigree_url`
- `horse_performance_url`
- `identity_status`
- `source`

Stage-one provenance fields:

- `source.system`
- `source.verified_at`
- `source.last_checked_at`

Later association fields:

- `current_associations.trainer_id`
- `current_associations.owner_id`
- `current_associations.governing_body_code`

Identity qualification:

- A horse record is identity-qualified when it has a valid identity anchor and source evidence:
  - non-empty `microchip_number`
  - non-empty `horse_name`
  - non-empty `stud_book_id`
  - non-empty `pedigree_url`
  - non-empty `horse_performance_url`
  - explicit `identity_status`

Horse-side HLT readiness:

- The selected horse is HLT-ready only when:
  - the horse record is identity-qualified
  - one trainer/stable is explicitly linked
  - one owner is explicitly linked
  - one governing body is explicitly linked

Important rule:

- Stage one does not require any trainer, owner, or governing-body link to register the horse.
- Trainer, owner, and governing-body links may be stored later on the horse record as the current/default associations, but they must be treated as mutable linked state, not as the horse's intrinsic identity truth.
- Stage one horse registration should not pull media or asset blobs into the Firestore horse document. Media arrives later through a separate asset flow.

### 2. Trainers / Stables

Responsibility:

- Hold the trainer and stable record used by downstream commercial and disclosure outputs.

Typical fields:

- `trainer_id`
- `trainer_name`
- `stable_name`
- `contact_name`
- `phone`
- `email`
- `website`
- `profile_status`
- `notes`

Qualification for HLT:

- A trainer/stable record is HLT-qualified when it has:
  - non-empty `trainer_id`
  - non-empty `trainer_name`
  - non-empty `stable_name`

### 3. Owners

Responsibility:

- Hold the legal or commercial owner / lessor record referenced by the lease structure.

Typical fields:

- `owner_id`
- `owner_name`
- `entity_type`
- `contact_name`
- `phone`
- `email`
- `website`
- `profile_status`
- `notes`

Qualification for HLT:

- An owner record is HLT-qualified when it has:
  - non-empty `owner_id`
  - non-empty `owner_name`
  - non-empty `entity_type`

### 4. Governing Bodies

Responsibility:

- Hold the regulatory and jurisdictional authority reference for the horse and lease context.

Typical fields:

- `governing_body_code`
- `governing_body_name`
- `website`
- `status`
- `notes`

Qualification for HLT:

- A governing body record is HLT-qualified when it has:
  - non-empty `governing_body_code`
  - non-empty `governing_body_name`
  - active or otherwise explicitly valid `status`

### 5. Lease Commercial Terms

Responsibility:

- Hold the commercial terms that are combined with the chosen repository entities to create the HLT outcome.

Typical fields:

- `lease_id`
- `horse_id`
- `start_date`
- `end_date`
- `duration_months`
- `percent_leased`
- `token_count`
- `percent_per_token`
- `token_price_nzd`
- `price_per_one_percent_nzd`
- `total_issuance_value_nzd`
- `investor_share_percent`
- `owner_share_percent`
- `platform_fee_percent`
- `lease_status`
- `notes`

Qualification for HLT:

- Lease commercial terms are HLT-complete when they have:
  - selected `horse_id`
  - valid start and end date or valid duration
  - valid leased percentage
  - valid token count
  - valid token price or equivalent pricing inputs
  - valid investor / owner split

## Derived Outputs

The following are derived outputs and must not be treated as canonical source records:

- HLT issuance records
- Tokinvest offering copy
- product / preview text blocks
- syndicate agreement drafts
- investor updates
- metadata bundles for publishing surfaces

These outputs may store snapshots of source values for auditability, but the canonical edit surface remains the five modules above.

## Evolution Rule

- The stable contract is the module boundary, not every individual leaf field.
- A module may gain or lose fields over time without forcing an HLT redesign, provided its qualification rule still holds.
- Each module should expose a normalized record plus its own qualification state.
- HLT should depend on module qualification state, selected record IDs, and required commercial terms, not on hidden field-by-field assumptions spread across the UI.
- Section-specific logic belongs inside its module.
- Cross-module fallback hacks, silent auto-injection, and hardcoded coupling should be removed or rewritten as explicit rules.

## Firestore Target Shape

Recommended logical collections:

- `horses`
- `trainers`
- `owners`
- `governing_bodies`
- `lease_terms`
- `hlt_records`

Recommended storage rule:

- The first five collections are canonical write surfaces.
- `horses` stores horse identity truth first and may later also store the current/default linked association references for HLT readiness.
- `hlt_records` is an assembly / derived collection referencing the selected source records plus a source snapshot for auditability.
- Generated documents should reference `hlt_record_id` or the related source IDs, not replace the canonical records.

## Current UI Ownership In SSOT_Build

- `Horses` owns horse identity records.
- `Trainers / Stables` owns trainer and stable records.
- `Owners` owns owner records.
- `Governing Bodies` owns governing-body records.
- `Leases` owns lease commercial terms.
- The HLT workflow is an assembly step and should only operate on already-created repository records plus lease terms.

## Implementation Guardrails

- Firestore writes for canonical horse and lease data should originate in `SSOT_Build`.
- `Evolution_Platform` should read from published SSOT data and derived outputs only.
- No HLT generation attempt should proceed unless:
  - one identity-qualified horse is selected
  - one qualified trainer/stable is selected
  - one qualified owner is selected
  - one qualified governing body is selected
  - one complete lease terms record is present
- Missing entities must be added through their repository sections before HLT generation.

## Context Chain
<- inherits from: /home/evo/workspace/AGENTS.md
-> related runtime map: /home/evo/workspace/projects/SSOT_Build/docs/architecture/CURRENT_BUILD_MAP_2026-03-11.md
-> canonical repo doc: /home/evo/workspace/projects/SSOT_Build/README.md
-> conventions: /home/evo/workspace/DNA/ops/CONVENTIONS.md
