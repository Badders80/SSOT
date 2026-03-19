# ADR-001: Local-First Template Library And Promotion Workflow

- Status: Accepted
- Date: 2026-03-19

## Context

`SSOT_Build` is still a local-first working prototype. Canonical repo data lives in `intake/v0.1/seed.json`, runtime edits are layered via browser localStorage, and the Firestore-backed repository is not implemented yet.

At the same time, the build now needs a durable place for:

- raw historical documents and source files
- reusable clauses and disclosure language
- versioned canonical templates for the template wizard
- canonical supporting assets
- a clear path from ad hoc local material into repo-backed product truth

The current template families in scope are:

- HLT Issuance Term Sheet
- Product Disclosure Statement
- Syndicate Agreement
- VARA Whitepaper
- DS Data Fields
- Investor Updates

## Decision

We will keep template authoring local-first and git-backed for this phase.

Firestore is not the next authoring surface for templates, old documents, or supporting assets. Firestore can become a later publish or sync surface after the canonical repository structure, wizard contracts, and promotion flow are stable.

## Repository Model

We will separate working intake from canonical repository data.

```text
intake/
  ad_hoc/
    documents/
      <template_id>/
    comms/
      <template_id>/
    assets/
      horses/
      trainers/
      owners/
      templates/

data/
  templates/
    documents/
      <template_id>/
        v1/
          manifest.json
          schema.json
          blocks/
    comms/
      <template_id>/
        v1/
          manifest.json
          schema.json
          blocks/
  library/
    clauses/
    disclosures/
    examples/
    snippets/
    research/
  assets/
    horses/
    trainers/
    owners/
    templates/
    shared/
  generated/
```

## Content Rules

- `intake/ad_hoc/` stores raw local imports, notes, extracts, and incomplete source material.
- `data/templates/` stores versioned canonical template definitions that the wizard can trust.
- `data/library/` stores curated knowledge fragments promoted out of old documents, including reusable clauses, examples, and reference snippets.
- `data/assets/` stores canonical assets that have been reviewed and accepted into the build.
- `data/generated/` stores outputs only. Generated files are not canonical input data.

## Promotion Workflow

Each imported item should move through an explicit lifecycle:

1. `ad_hoc`
2. `reviewed`
3. `canonical`
4. `archived`

Recommended UI labels:

- Asset-level action: `Promote to Canonical`
- Dashboard action: `Prepare Snapshot`
- Secondary dashboard action after validation: `Save Seed Changes`

We should not use a destructive-looking red `Commit` button for this workflow. Promotion is a review and validation step, not a delete or dangerous action.

## Manifest Expectations

Each canonical template version should carry:

- template identity
- category
- version
- source intake path
- canonical path
- output path if one exists
- current lifecycle status

Each schema file should separate:

- static blocks
- reusable blocks
- input fields
