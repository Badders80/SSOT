# Template Registry

This folder is the canonical, versioned home for template definitions that the template wizard can rely on.

Structure:

- `documents/` for legal and issuance templates
- `comms/` for communication templates
- `registry.json` as the top-level discovery surface

Each version folder should contain:

- `manifest.json` for identity and lifecycle metadata
- `schema.json` for the wizard-facing field contract
- `blocks/` for reusable canonical content fragments when they are promoted
