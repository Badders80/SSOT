/**
 * Canonical schema for DS Listing Document generation.
 *
 * Field classification:
 *   STATIC    — identical across every listing (boilerplate)
 *   REUSABLE  — shared across horses (trainers, sires, dams)
 *   INPUT     — per-horse identity data from SSOT
 *   DERIVED   — computed at generation time from INPUT + REUSABLE fields
 */

// ─── INPUT: Core horse identity (from SSOT HorseRecord) ────────────────────

export type HorseSex = 'Filly' | 'Colt' | 'Gelding' | 'Mare' | 'Stallion' | 'Rig';

export interface HorseIdentity {
  horse_id: string;
  horse_name: string;
  country_code: string;       // e.g. "NZ"
  foaling_date: string;       // ISO "YYYY-MM-DD"
  sex: HorseSex;
  colour: string;             // e.g. "Bay"
  microchip_number: string;
  nztr_life_number: string;
  breeding_url: string;       // loveracing.nz pedigree page
  performance_profile_url: string;
  horse_status: string;
  identity_status: string;
}

// ─── INPUT: Pedigree references ─────────────────────────────────────

export interface PedigreeRef {
  sire_name: string;          // e.g. "Satono Aladdin (JPN)"
  dam_name: string;           // e.g. "Canuhandleajandal (NZ)"
  sire_slug: string;          // e.g. "satono-aladdin" → lookup in data/sires/
  dam_slug: string;           // e.g. "canuhandleajandal" → lookup in data/dams/
}

// ─── REUSABLE: Sire / Dam profiles (data/sires/*.json, data/dams/*.json) ───

export interface SireProfile {
  slug: string;
  display_name: string;       // "Satono Aladdin (JPN)"
  sire_line: string;          // "Deep Impact (JPN)"
  dam_line: string;           // "Magic Storm (USA) by Storm Cat"
  description: string;        // Full narrative paragraph for listing
  stud: string;               // "Rich Hill Stud, Matamata"
  service_fee?: string;       // "$45,000 + GST"
  notable_progeny: string[];  // ["Pennyweka (Gr.1)", ...]
  race_record_summary: string;// "8 wins inc. Gr.1 Yasuda Kinen"
}

export interface DamProfile {
  slug: string;
  display_name: string;       // "Canuhandleajandal (NZ)"
  sire_of_dam: string;        // "Per Incanto (USA)"
  description: string;        // Full narrative paragraph for listing
  breeding_record?: string;   // e.g. "Dam of 3 foals..."
}

// ─── REUSABLE: Trainer profile (data/trainers/*.json) ───────────────────

export interface TrainerProfile {
  trainer_id: string;
  trainer_name: string;       // "Lance O'Sullivan & Andrew Scott"
  stable_name: string;        // "Wexford Stables"
  contact_name: string;
  location: string;           // "Matamata, New Zealand"
  full_address: string;       // Full stable address for propertyLocation
  bio: string;                // Full narrative paragraph for trainer section
  notable_wins: string[];     // ["Gr.1 NZ Oaks (Ohope Wins)", ...]
  website: string;
  social_links: {
    x_url?: string;
    instagram_url?: string;
    facebook_url?: string;
  };
}

// ─── INPUT: Offering / lease metadata ───────────────────────────────

export interface OfferingMeta {
  lease_id: string;
  start_date: string;
  end_date: string;
  duration_months: number;
  percent_leased: number;
  token_count: number;
  percent_per_token: number;
  token_price_nzd: number;
  total_issuance_value_nzd: number;
  investor_share_percent: number;  // e.g. 75
  owner_share_percent: number;     // e.g. 25
  platform_fee_percent?: number;
  earnings_distribution: string;   // "75% pro-rata quarterly" — standard language
}

// ─── INPUT: Racing record ───────────────────────────────────────

export interface RaceEntry {
  date: string;
  course: string;
  race_name?: string;
  distance?: string;
  position?: string;
  jockey?: string;
  trainer?: string;
  replay_url?: string;
}

// ─── INPUT: Horse-specific narrative fields ─────────────────────────

export interface HorseNarrative {
  tagline: string;            // e.g. "Bred for Speed, Built to Win"
  intro_paragraph: string;    // Section 2, block 1
  about_paragraph: string;    // Section 2, block 4 narrative
  current_status: string;     // e.g. "2YO Education & Trials"
}

// ─── COMPOSITE: Full listing data (combines all above) ──────────────────

export interface ListingData {
  identity: HorseIdentity;
  pedigree: PedigreeRef;
  sire_profile: SireProfile;
  dam_profile: DamProfile;
  trainer: TrainerProfile;
  offering: OfferingMeta;
  races: RaceEntry[];
  narrative: HorseNarrative;
}

// ─── DERIVED: Generated fields (computed by the generator) ──────────────

export interface DerivedFields {
  offeringTitle: string;       // "I Stole A Manolo (NZ)"
  previewDetails: string;      // "I Stole A Manolo (NZ), two-year old Filly"
  horseType: string;           // "Bay Filly"
  horseDOB: string;            // "DD/MM/YYYY"
  ageDescription: string;      // "two-year-old"
  raceDescription: string;     // "Current Status: 2YO Education & Trials"
  numberOfRunners: number;
  searchTerms: string;         // auto-generated CSV
  detailSummary: {
    location: string;
    trainer: string;
    duration: string;
    sire: string;
    dam: string;
    microchip: string;
  };
  assetType: 'Horse';
}

// ─── STATIC: Boilerplate content (data/templates/boilerplate.json) ────────

export interface BoilerplateContent {
  why_tokenise_heading: string;
  why_tokenise_body: string;
  intro_template: string;       // Template with {horseName} etc. placeholders
  earnings_language: string;    // "75% pro-rata quarterly distribution" verbatim
  pedigree_intro: string;       // "Built on Pedigree" intro line
}

// ─── CONFIG: Field classification for SOP documentation ─────────────────

export type FieldClassification = 'STATIC' | 'REUSABLE' | 'INPUT' | 'DERIVED';

export interface FieldMapping {
  doc_field: string;
  ssot_source: string;
  classification: FieldClassification;
  required: boolean;
  notes?: string;
}

export const DS_FIELD_MAPPINGS: FieldMapping[] = [
  // Section 1: Offering Header
  { doc_field: 'offeringTitle', ssot_source: 'identity.horse_name + identity.country_code', classification: 'DERIVED', required: true },
  { doc_field: 'previewDetails', ssot_source: 'identity.horse_name + derived.ageDescription + identity.sex', classification: 'DERIVED', required: true },

  // Section 2: Full Details
  { doc_field: 'introBlock', ssot_source: 'narrative.intro_paragraph', classification: 'INPUT', required: true, notes: 'Horse-specific marketing copy' },
  { doc_field: 'whyTokeniseBlock', ssot_source: 'boilerplate.why_tokenise_body', classification: 'STATIC', required: true },
  { doc_field: 'aboutBlock.sex', ssot_source: 'identity.sex', classification: 'INPUT', required: true },
  { doc_field: 'aboutBlock.dob', ssot_source: 'identity.foaling_date', classification: 'INPUT', required: true },
  { doc_field: 'aboutBlock.sire', ssot_source: 'pedigree.sire_name', classification: 'INPUT', required: true },
  { doc_field: 'aboutBlock.dam', ssot_source: 'pedigree.dam_name', classification: 'INPUT', required: true },
  { doc_field: 'aboutBlock.trainer', ssot_source: 'trainer.trainer_name', classification: 'REUSABLE', required: true },
  { doc_field: 'aboutBlock.location', ssot_source: 'trainer.location', classification: 'REUSABLE', required: true },
  { doc_field: 'narrativeBlock', ssot_source: 'narrative.about_paragraph', classification: 'INPUT', required: true },
  { doc_field: 'trainerProfile', ssot_source: 'trainer.bio', classification: 'REUSABLE', required: true },

  // Section 3: Pedigree
  { doc_field: 'pedigreeIntro', ssot_source: 'boilerplate.pedigree_intro', classification: 'STATIC', required: true },
  { doc_field: 'sireDescription', ssot_source: 'sire_profile.description', classification: 'REUSABLE', required: true },
  { doc_field: 'damDescription', ssot_source: 'dam_profile.description', classification: 'REUSABLE', required: true },

  // Section 4: Meta Keys
  { doc_field: 'promoted', ssot_source: 'hardcoded "Yes"', classification: 'STATIC', required: true },
  { doc_field: 'horseRaceHistory', ssot_source: 'identity.breeding_url', classification: 'INPUT', required: true },
  { doc_field: 'raceDescription', ssot_source: 'narrative.current_status', classification: 'INPUT', required: true },
  { doc_field: 'result', ssot_source: 'races[last].position or "N/A"', classification: 'DERIVED', required: false },
  { doc_field: 'numberOfRunners', ssot_source: 'races.length', classification: 'DERIVED', required: true },
  { doc_field: 'trainer', ssot_source: 'trainer.trainer_name', classification: 'REUSABLE', required: true },
  { doc_field: 'jockey', ssot_source: 'races[last].jockey or "TBD"', classification: 'DERIVED', required: false },
  { doc_field: 'raceCourse', ssot_source: 'trainer.location', classification: 'REUSABLE', required: true },
  { doc_field: 'raceDate', ssot_source: 'offering.start_date derived season', classification: 'DERIVED', required: true },
  { doc_field: 'raceReplayURL', ssot_source: 'races[last].replay_url or ""', classification: 'DERIVED', required: false },
  { doc_field: 'horseTrainer', ssot_source: 'trainer.trainer_name', classification: 'REUSABLE', required: true },
  { doc_field: 'horseType', ssot_source: 'identity.sex', classification: 'INPUT', required: true },
  { doc_field: 'horsePedigree', ssot_source: 'pedigree section (sire + dam descriptions)', classification: 'DERIVED', required: true },
  { doc_field: 'propertyLocation', ssot_source: 'trainer.full_address', classification: 'REUSABLE', required: true },
  { doc_field: 'searchTerms', ssot_source: 'auto-generated from name, trainer, sire, dam, location', classification: 'DERIVED', required: true },
  { doc_field: 'detailSummary', ssot_source: 'composite of location, trainer, duration, sire, dam, microchip', classification: 'DERIVED', required: true },
  { doc_field: 'horseColour', ssot_source: 'identity.colour + identity.sex', classification: 'DERIVED', required: true },
  { doc_field: 'horseDOB', ssot_source: 'identity.foaling_date reformatted DD/MM/YYYY', classification: 'DERIVED', required: true },
  { doc_field: 'assetType', ssot_source: 'hardcoded "Horse"', classification: 'STATIC', required: true },
];
