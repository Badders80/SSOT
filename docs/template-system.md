# Template System — SOP

**System:** SSOT Evolution Stables  
**Module:** Documents > Templates  
**Version:** 1.0  
**Last updated:** 2026-03-14

---

## 1. What the Template System Does

The Template System is the document-generation engine for the SSOT platform. It transforms structured horse and trainer data stored in the SSOT into polished, consistently formatted offering documents — without manual copy-pasting or reformatting.

**Core problem it solves:**  
Every DS Listing Document for a new horse shares the same 8-section structure, the same boilerplate copy, and the same fields — but with different horse-specific values. Previously, each document was produced by duplicating a previous one and editing it by hand, which introduces inconsistency and error.

**What the template system provides instead:**
- A **schema-based template** that defines every section, field, and content classification up front
- A **wizard UI** that walks through each section, auto-fills data where possible, and collects only the genuinely unique inputs
- A **generate step** that assembles all data into a `.docx` output ready for review and publication

---

## 2. How Templates Are Structured

Each template is a JSON schema (`data/templates/<slug>.json`) with the following hierarchy:

```
TemplateSchema
  └── sections[]
        └── fields[]
              ├── key         — unique identifier
              ├── label       — display name
              ├── type        — text | textarea | number | date | url | dropdown | boolean | array
              ├── classification — STATIC | REUSABLE | INPUT | DERIVED
              ├── autoFillSource — where the value comes from (if not INPUT)
              └── required
```

### Field Classifications

| Classification | Meaning | Example |
|---|---|---|
| **STATIC** | Same in every document. Comes from `data/templates/boilerplate.json`. Never edited per-horse. | Tokinvest intro paragraph, "Why Tokenise" body, earnings sentence |
| **REUSABLE** | Specific to an entity (trainer, sire, dam) but shared across multiple horses. Stored in entity JSON files. Reviewed and approved once, then reused. | Trainer bio, sire description, dam description |
| **INPUT** | Unique to this horse/offering. Must be written or confirmed manually for each document. | Narrative headline, narrative body, horse-specific introduction |
| **DERIVED** | Calculated automatically from other fields. Never entered manually. | Detail summary, search terms, offering title, horse display string |

Understanding these classifications determines what appears as an editable field in the wizard vs. what is auto-filled or shown as read-only.

---

## 3. Two Paths to Create Templates

### Path A — Wizard (Recommended for existing document types)

1. Navigate to **Documents > Templates** and click **+ Create New Template**
2. Choose **Wizard — Analyse completed documents**
3. Upload 2–5 completed example documents of the same type (e.g., previous DS Listing Documents)
4. The wizard analyses the documents to:
   - Identify repeating section headings and paragraph structures
   - Classify fields by detecting which content changes horse-to-horse vs. stays constant
   - Suggest field labels, types, and classifications
5. Review and confirm the auto-detected schema
6. Save — the template becomes available in the Templates list

**Best for:** Any document type where you already have completed examples to learn from. The wizard captures institutional knowledge baked into existing documents.

### Path B — Manual Builder

1. Navigate to **Documents > Templates** and click **+ Create New Template**
2. Choose **Manual — Build from scratch**
3. Use the section and field builder to:
   - Add sections and give each an ID and title
   - Add fields to each section, specifying label, type, classification, and autoFillSource
4. Save the draft schema
5. Test by running the Use Template wizard against a horse

**Best for:** New document types with no prior examples — e.g., a new regulatory disclosure format or a novel report type.

---

## 4. How to Use a Template (Generating a Document)

Using the **DS Listing Document** template as the reference example:

### Step 1 — Select Horse
- Choose a horse from the SSOT dropdown, or enter a loveracing.nz URL for a future fetch
- The system auto-fills: horse name, country code, foaling date, sex, colour, sire, dam, microchip, breeding URL
- The trainer is auto-matched from the horse's `trainer_id` and previewed
- SSOT-derived values (horse display string, microchip, breeding URL) are shown as read-only

### Step 2 — Narrative Content
- The static Tokinvest intro paragraph is shown as read-only — it does not need editing
- The user writes the **horse-specific introduction** paragraph (INPUT)
- The user writes the **narrative headline and body** (INPUT)
- Sire and dam descriptions are pre-filled from saved entity profiles if available (REUSABLE)
- Trainer bio is pre-filled from saved trainer profile if available (REUSABLE)
- The earnings sentence is shown as read-only boilerplate (STATIC)

### Step 3 — Details & Meta
- Confirm lease duration (default: 16 months)
- Confirm location (auto-filled from trainer's notes)
- Enter racing record
- Review or edit auto-generated search terms
- All derived meta fields (offering title, horse type, horse colour, DOB, asset type, detail summary) are shown as read-only calculated values

### Step 4 — Review & Generate
- Full read-only preview of every section and field
- Click **Generate & Download .docx** to produce the document
- Click **Save Draft** to save progress without generating

---

## 5. Reusable Entity Content

Certain content blocks are specific to an entity (trainer, sire, dam) but are shared across multiple horses. These are stored in entity JSON files and approved once before reuse.

### Entity Types

| Entity | File path | Key field |
|---|---|---|
| Trainers | `data/trainers/<slug>.json` | `bio` |
| Sires | `data/sires/<slug>.json` | `description` |
| Dams | `data/dams/<slug>.json` | `description` |

### Status Lifecycle

Each entity content block has a `status` field:
- **draft** — written but not yet reviewed
- **approved** — reviewed, signed off, and safe to reuse in documents
- **archived** — no longer used; preserved for historical reference

Only **approved** content is surfaced as auto-fill suggestions in the wizard. Draft content must be reviewed before it is used in a live document.

### Adding New Entity Content

When a horse introduces a new sire, dam, or trainer not yet in the SSOT:
1. The wizard shows an empty textarea with a placeholder prompt
2. The user writes the content from scratch during the wizard session
3. Upon generating, the content can be saved back as a new entity profile with `draft` status
4. A content reviewer promotes it to `approved` so future horses benefit from the reuse

### Why This Matters

Without entity content management, the same trainer bio or sire description would be rewritten or copy-pasted inconsistently across documents. With the entity system:
- Descriptions are written once, reviewed once, and used many times
- Any update to a trainer bio (e.g., new Group 1 win) can be made in one place
- Historical documents preserve the version that was in use at generation time

---

## 6. Data Source Mapping

Understanding where each piece of data originates determines what is automatic vs. manual in the wizard.

### From loveracing.nz (future integration)
- Horse name, country code, foaling date, sex, colour
- Sire and dam names
- Microchip / Life Number
- Breeding URL
- Race history URL

_Currently: entered manually into horse JSON files in `data/horses/`. The loveracing.nz Fetch button in Step 1 will automate this in a future update._

### From SSOT Horse Files (`data/horses/<slug>.json`)
- All identity fields (name, sex, colour, sire, dam, microchip, foaling date, breeding URL)
- `offering.leaseDurationMonths` and `offering.location`
- `racingRecord`
- `narrative.horse_intro`, `narrative.headline`, `narrative.body` (if pre-written)

These are the canonical source of truth. If a value exists in the horse file, it is auto-filled.

### From SSOT Trainer Files (`data/trainers/<slug>.json` — future)
- Trainer name, stable name, contact name
- Location (notes field, currently)
- Trainer bio (once entity content is approved)

### From SSOT Sire/Dam Files (`data/sires/<slug>.json`, `data/dams/<slug>.json`)
- Sire and dam description text (REUSABLE, once approved)

### From Boilerplate (`data/templates/boilerplate.json`)
- STATIC copy that never changes: Tokinvest intro paragraph, "Why Tokenise" body and bullets, earnings sentence, asset type, promoted flag

### Manual Input (entered fresh in the wizard)
- Horse-specific introduction paragraph (unique per horse)
- Narrative headline and body (unique per horse)
- Racing record (confirmed/updated at time of listing)
- Any sire/dam/trainer descriptions not yet in the entity system

### Derived / Calculated (never manually entered)
- `offeringTitle` = `{horse_name} ({country_code})`
- `previewDetails` = `{horse_name} ({country_code}), {foaling_year} {sex}`
- `horseColour` = `{colour} {sex}`
- `horseDOB` = `foaling_date` formatted as DD/MM/YYYY
- `searchTerms` = concatenation of horse name, sire, dam, trainer, stable, country, "thoroughbred", "racehorse", "tokenise", "investment"
- `detailSummary` = assembled from colour, sex, foaling year, sire, dam, trainer, location, lease duration, microchip
- `horsePedigree` = concatenation of sire and dam descriptions

---

## 7. The Static "Why Tokenise" Copy and Earnings Language Rules

### Why Tokenise a Racehorse? (STATIC — never edit per-horse)

This section is identical in every DS Listing Document. It is stored in `data/templates/boilerplate.json` under `why_tokenise_body` and `why_tokenise_bullets`.

**Current approved copy:**

> Until now, accessing the world of racehorse ownership has traditionally been expensive, complex, and out of reach. With Tokinvest, you can now access fractional ownership in a professionally trained racehorse, creating a dynamic, engaging way to diversify your portfolio and experience the thrill of the sport.

Bullets:
- Real-world-Asset: Linked to an active, racing thoroughbred
- Fractional ownership: Invest in a portion of the horse's lease rights
- Tradable: Tokens can be bought and sold on our regulated platform

**Rule:** This copy must not be modified in any individual document wizard. Changes to this section require a boilerplate update and a version bump on any templates that reference it.

### Earnings Language (STATIC — never edit per-horse)

The earnings sentence is defined in `boilerplate.json` under `earnings_sentence`:

> Investors receive a pro-rata share of 75% of eligible race earnings, distributed quarterly in accordance with the lease terms.

**Rules:**
1. The percentage (75%) is contractually fixed and may not be modified in individual documents
2. The distribution frequency ("quarterly") reflects the standard lease terms
3. Any change to either figure requires a formal legal review and must be updated in `boilerplate.json` — not edited inline
4. In the wizard UI, this sentence is displayed as read-only grey text immediately following the narrative body, making it clear it is not an input field

### Tokinvest Introduction (STATIC — never edit per-horse)

> Tokinvest is bringing the excitement of thoroughbred racing to a new generation of investors through digital-syndication, a tokenised model of ownership that provides simple access to the performance and potential of real-world racehorses.

**Rule:** This appears at the top of the Introduction section and is always shown before the horse-specific introduction paragraph. It is read-only in the wizard.

---

## Appendix: Current Template Inventory

| Template | Status | Category | Notes |
|---|---|---|---|
| DS Listing Document | Active v1.0 | Listing | Built from 3 example docs. 8 sections, 26 fields. |
| Product Disclosure Statement (PDS) | Placeholder | Compliance | Planned — no examples loaded yet |
| Syndicate Agreement | Placeholder | Legal | Planned — requires legal sign-off on fields |
| VARA Whitepaper | Placeholder | Compliance | Planned — awaiting VARA regulatory guidance |
| HLT Issuance Termsheet | Placeholder | Listing | Planned — to be extracted from HLT wizard outputs |

---

_This document covers the template system as implemented in Sprint 1 (March 2026). The loveracing.nz fetch, .docx generation, draft saving, and full entity content management are planned for Sprint 2._
