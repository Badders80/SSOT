# DS Listing Document Generator

## Overview

CLI tool that generates fully populated Tokinvest DS Data Fields documents (.docx) from SSOT horse data.

This is the first template generator in the Evolution Stables document pipeline. It establishes the SOP (Standard Operating Procedure) for all future template generators.

## SOP: Template Generation Pattern

Every document template follows this workflow:

1. **Baseline Document** — Start with the canonical document structure (sections, fields, formatting)
2. **Field Audit** — Map every field in the document to its data source
3. **Classification** — Categorize each field as:
   - **STATIC** — Same content for every listing (boilerplate text, standard legal language)
   - **REUSABLE** — Shared across horses (trainer bios, sire profiles, dam profiles)
   - **INPUT** — Per-horse data from the SSOT (name, DOB, colour, microchip)
   - **DERIVED** — Computed at generation time from INPUT + REUSABLE fields (age, search terms, formatted dates)
4. **Schema Extension** — Add any new fields to `src/types/horse-listing.ts`
5. **Data Population** — Create/update JSON data files for all REUSABLE and INPUT sources
6. **Generator Script** — Build the CLI script in `scripts/`
7. **Test** — Run against real horse data, verify output matches baseline
8. **PR** — Commit to feature branch, open pull request

## Usage

```bash
npx tsx scripts/generate-listing-doc.ts <horse-slug>
```

### Example

```bash
npx tsx scripts/generate-listing-doc.ts i-stole-a-manolo
```

Output: `output/i-stole-a-manolo-DS-listing.docx`

## Data Architecture

### Per-Horse Data (`data/horses/<slug>.json`)
Contains all horse-specific fields: identity, pedigree references, offering metadata, race history, and narrative copy.

### Reusable Profiles
- `data/trainers/<slug>.json` — Trainer bios, stable info (shared across all horses at that trainer)
- `data/sires/<slug>.json` — Sire descriptions, race records, progeny (shared across all progeny)
- `data/dams/<slug>.json` — Dam descriptions, breeding records (shared across all progeny)

### Static Content
- `data/templates/boilerplate.json` — "Why Tokenise" section, earnings language, standard intro templates

### Schema
- `src/types/horse-listing.ts` — Canonical TypeScript types with field classification documentation

## Field Classification Reference

| Classification | Description | Where Stored | Example |
|---|---|---|---|
| STATIC | Identical every listing | `data/templates/boilerplate.json` | "Why Tokenise a Racehorse?" section |
| REUSABLE | Shared across horses | `data/trainers/`, `data/sires/`, `data/dams/` | Trainer bio, sire description |
| INPUT | Per-horse SSOT data | `data/horses/<slug>.json` | Horse name, DOB, colour, microchip |
| DERIVED | Computed at generation | Generated in script | Age description, search terms, formatted dates |

## Adding a New Horse

1. Create `data/horses/<horse-slug>.json` with all identity, pedigree, offering, and narrative fields
2. Ensure trainer profile exists in `data/trainers/<trainer-slug>.json`
3. Ensure sire profile exists in `data/sires/<sire-slug>.json`
4. Ensure dam profile exists in `data/dams/<dam-slug>.json`
5. Run: `npx tsx scripts/generate-listing-doc.ts <horse-slug>`
6. Review output in `output/<horse-slug>-DS-listing.docx`

## Missing Field Handling

If any required field is missing from the data files, the generator inserts `[MISSING: fieldname]` as a placeholder rather than failing. The gap report at the end of generation lists all missing fields.

## Dependencies

- `docx` ^9.6.0 — Word document generation
- `tsx` — TypeScript execution
- Node.js 18+
