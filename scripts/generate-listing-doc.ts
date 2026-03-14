#!/usr/bin/env npx tsx
/**
 * DS Listing Document Generator
 * ─────────────────────────────
 * Generates a fully populated Tokinvest DS Data Fields document (.docx)
 * from SSOT horse data + reusable profiles + static boilerplate.
 *
 * Usage:
 *   npx tsx scripts/generate-listing-doc.ts <horse-slug>
 *   npx tsx scripts/generate-listing-doc.ts i-stole-a-manolo
 *
 * Output:
 *   output/<horse-slug>-DS-listing.docx
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  LevelFormat,
  Table,
  TableRow,
  TableCell,
  BorderStyle,
  WidthType,
  ShadingType,
} from 'docx';

// ─── Paths ────────────────────────────────────────────────────────────────

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const OUTPUT_DIR = path.join(ROOT, 'output');

// ─── Helpers ──────────────────────────────────────────────────────────────

function loadJson<T>(filePath: string): T {
  const full = path.resolve(DATA_DIR, filePath);
  if (!fs.existsSync(full)) {
    throw new Error(`File not found: ${full}`);
  }
  return JSON.parse(fs.readFileSync(full, 'utf-8')) as T;
}

function missing(field: string): string {
  return `[MISSING: ${field}]`;
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function formatDateDMY(isoDate: string): string {
  if (!isoDate) return missing('horseDOB');
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return missing('horseDOB');
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function calcAge(foalingDate: string, referenceDate: Date = new Date()): number {
  const dob = new Date(foalingDate);
  // In NZ racing, age is determined by season (1 August birthday)
  const seasonYear = referenceDate.getMonth() >= 7 // August onwards
    ? referenceDate.getFullYear()
    : referenceDate.getFullYear() - 1;
  return seasonYear - dob.getFullYear();
}

function ageDescription(foalingDate: string): string {
  const age = calcAge(foalingDate);
  const map: Record<number, string> = {
    0: 'yearling',
    1: 'yearling',
    2: 'two-year-old',
    3: 'three-year-old',
    4: 'four-year-old',
    5: 'five-year-old',
    6: 'six-year-old',
  };
  return map[age] || `${age}-year-old`;
}

function generateSearchTerms(data: {
  horseName: string;
  trainerName: string;
  stableName: string;
  sireName: string;
  damName: string;
  location: string;
  colour: string;
  sex: string;
}): string {
  const terms = [
    data.horseName,
    data.trainerName,
    data.stableName,
    data.sireName.replace(/\s*\(.*?\)/g, ''),
    data.damName.replace(/\s*\(.*?\)/g, ''),
    data.location,
    data.colour,
    data.sex,
    'Evolution Stables',
    'Tokinvest',
    'racehorse',
    'tokenisation',
    'horse racing',
    'New Zealand',
    'thoroughbred',
  ];
  return terms.filter(Boolean).join(', ');
}

function getRacingSeason(dateStr: string): string {
  if (!dateStr) return missing('raceDate');
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = d.getMonth();
  // NZ racing season: August to July
  if (month >= 7) {
    return `${year}/${year + 1} Season`;
  }
  return `${year - 1}/${year} Season`;
}

// ─── Data loading ─────────────────────────────────────────────────────────

interface HorseData {
  identity: {
    horse_id: string;
    horse_name: string;
    country_code: string;
    foaling_date: string;
    sex: string;
    colour: string;
    microchip_number: string;
    nztr_life_number: string;
    breeding_url: string;
    performance_profile_url: string;
    horse_status: string;
    identity_status: string;
  };
  pedigree: {
    sire_name: string;
    dam_name: string;
    sire_slug: string;
    dam_slug: string;
  };
  trainer_slug: string;
  offering: {
    lease_id: string;
    start_date: string;
    end_date: string;
    duration_months: number;
    percent_leased: number;
    token_count: number;
    percent_per_token: number;
    token_price_nzd: number;
    total_issuance_value_nzd: number;
    investor_share_percent: number;
    owner_share_percent: number;
    earnings_distribution: string;
  };
  races: Array<{
    date: string;
    course: string;
    race_name?: string;
    distance?: string;
    position?: string;
    jockey?: string;
    trainer?: string;
    replay_url?: string;
  }>;
  narrative: {
    tagline: string;
    intro_paragraph: string;
    about_paragraph: string;
    current_status: string;
  };
}

interface TrainerData {
  trainer_id: string;
  trainer_name: string;
  stable_name: string;
  contact_name: string;
  location: string;
  full_address: string;
  bio: string;
  notable_wins: string[];
  website: string;
}

interface SireData {
  slug: string;
  display_name: string;
  description: string;
  race_record_summary: string;
  notable_progeny: string[];
}

interface DamData {
  slug: string;
  display_name: string;
  description: string;
  breeding_record?: string;
}

interface Boilerplate {
  why_tokenise_heading: string;
  why_tokenise_body: string;
  intro_template: string;
  earnings_language: string;
  pedigree_intro: string;
  pedigree_intro_body: string;
  asset_type: string;
  promoted_default: string;
}

function loadAllData(horseSlug: string) {
  console.log(`Loading horse data: data/horses/${horseSlug}.json`);
  const horse = loadJson<HorseData>(`horses/${horseSlug}.json`);

  console.log(`Loading trainer: data/trainers/${horse.trainer_slug}.json`);
  const trainer = loadJson<TrainerData>(`trainers/${horse.trainer_slug}.json`);

  console.log(`Loading sire: data/sires/${horse.pedigree.sire_slug}.json`);
  const sire = loadJson<SireData>(`sires/${horse.pedigree.sire_slug}.json`);

  console.log(`Loading dam: data/dams/${horse.pedigree.dam_slug}.json`);
  const dam = loadJson<DamData>(`dams/${horse.pedigree.dam_slug}.json`);

  console.log(`Loading boilerplate: data/templates/boilerplate.json`);
  const boilerplate = loadJson<Boilerplate>('templates/boilerplate.json');

  return { horse, trainer, sire, dam, boilerplate };
}

// ─── Document builder ─────────────────────────────────────────────────────

function buildDocument(
  horse: HorseData,
  trainer: TrainerData,
  sire: SireData,
  dam: DamData,
  boilerplate: Boilerplate,
): Document {
  const h = horse.identity;
  const n = horse.narrative;
  const o = horse.offering;
  const p = horse.pedigree;

  // Derived fields
  const offeringTitle = `${h.horse_name} (${h.country_code})`;
  const ageName = ageDescription(h.foaling_date);
  const previewDetails = `${offeringTitle}, ${ageName} ${h.sex}`;
  const horseColour = `${h.colour} ${h.sex}`;
  const horseDOB = formatDateDMY(h.foaling_date);
  const raceCount = horse.races.length;
  const lastRace = horse.races[raceCount - 1];
  const raceResult = lastRace?.position || 'N/A';
  const jockey = lastRace?.jockey || 'TBD';
  const raceCourse = lastRace?.course || trainer.location;
  const raceReplayURL = lastRace?.replay_url || '';
  const raceDate = getRacingSeason(o.start_date);

  const searchTerms = generateSearchTerms({
    horseName: h.horse_name,
    trainerName: trainer.trainer_name,
    stableName: trainer.stable_name,
    sireName: p.sire_name,
    damName: p.dam_name,
    location: trainer.location,
    colour: h.colour,
    sex: h.sex,
  });

  const pedigreeIntroBody = boilerplate.pedigree_intro_body.replace(
    /\{horseName\}/g,
    h.horse_name,
  );

  const racingRecordSummary =
    raceCount > 0
      ? `${raceCount} start${raceCount > 1 ? 's' : ''}`
      : 'Unraced — in preparation';

  const thinBorder = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' };
  const cellBorders = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };
  const bulletRef = 'ds-bullets';

  const doc = new Document({
    numbering: {
      config: [{
        reference: bulletRef,
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: '\u2022', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      }],
    },
    styles: {
      default: { document: { run: { font: 'Calibri', size: 22 } } },
      paragraphStyles: [
        { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 32, bold: true, font: 'Calibri', color: '1A1A2E' },
          paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
        { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 26, bold: true, font: 'Calibri', color: '2D3A4A' },
          paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 } },
        { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 24, bold: true, font: 'Calibri', color: '3D4F5F' },
          paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 2 } },
      ],
    },
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      children: [
        // SECTION 1: OFFERING HEADER
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: 'SECTION 1: OFFERING HEADER', bold: true })] }),
        new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: 'offeringTitle: ', bold: true }), new TextRun(offeringTitle)] }),
        new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: 'previewDetails: ', bold: true }), new TextRun(previewDetails)] }),

        // SECTION 2: FULL DETAILS
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: 'SECTION 2: FULL DETAILS (Marketing Copy)', bold: true })] }),

        // Block 1: Intro
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: `\u{1F539} ${h.horse_name}: Evolution Stables Next Offering` })] }),
        new Paragraph({ spacing: { after: 200 }, children: [new TextRun(n.intro_paragraph || missing('narrative.intro_paragraph'))] }),

        // Block 2: Why Tokenise (STATIC)
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: `\u{1F539} ${boilerplate.why_tokenise_heading}` })] }),
        new Paragraph({ spacing: { after: 200 }, children: [new TextRun(boilerplate.why_tokenise_body)] }),

        // Block 3: About [Horse Name]
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: `\u{1F539} About ${h.horse_name}` })] }),
        ...[
          `Sex: ${h.sex || missing('sex')}`,
          `Age (DOB): ${ageName} (${horseDOB})`,
          `Sire: ${p.sire_name || missing('sire')}`,
          `Dam: ${p.dam_name || missing('dam')}`,
          `Trainer: ${trainer.trainer_name || missing('trainer')}`,
          `Location: ${trainer.location || missing('location')}`,
          `Racing Record: ${racingRecordSummary}`,
        ].map((text) => new Paragraph({ numbering: { reference: bulletRef, level: 0 }, spacing: { after: 40 }, children: [new TextRun(text)] })),
        new Paragraph({ spacing: { after: 120 }, children: [] }),

        // Block 4: Narrative
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: `\u{1F539} ${h.horse_name}: ${n.tagline || missing('tagline')}` })] }),
        new Paragraph({ spacing: { after: 200 }, children: [new TextRun(n.about_paragraph || missing('narrative.about_paragraph'))] }),

        // Block 5: Trainer Profile (REUSABLE)
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: `\u{1F539} Trainer Profile: ${trainer.trainer_name} \u2014 ${trainer.stable_name}` })] }),
        new Paragraph({ spacing: { after: 200 }, children: [new TextRun(trainer.bio || missing('trainer.bio'))] }),

        // SECTION 3: PEDIGREE BLOCK
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: 'SECTION 3: PEDIGREE BLOCK', bold: true })] }),
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: `\u{1F539} ${boilerplate.pedigree_intro}` })] }),
        new Paragraph({ spacing: { after: 200 }, children: [new TextRun(pedigreeIntroBody)] }),

        // The Sire
        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: `The Sire: ${sire.display_name || p.sire_name}`, bold: true })] }),
        new Paragraph({ spacing: { after: 200 }, children: [new TextRun(sire.description || missing('sire_profile.description'))] }),

        // The Dam
        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: `The Dam: ${dam.display_name || p.dam_name}`, bold: true })] }),
        new Paragraph({ spacing: { after: 200 }, children: [new TextRun(dam.description || missing('dam_profile.description'))] }),

        // SECTION 4: META KEYS
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: 'SECTION 4: META KEYS (Structured Data Fields)', bold: true })] }),
        new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: 'These are the structured data fields that populate the Tokinvest platform listing.', italics: true, color: '666666' })] }),

        buildMetaTable([
          ['promoted', boilerplate.promoted_default],
          ['horseRaceHistory', h.breeding_url || missing('breeding_url')],
          ['raceDescription', n.current_status || missing('current_status')],
          ['result', raceResult],
          ['numberOfRunners', String(raceCount)],
          ['trainer', trainer.trainer_name],
          ['jockey', jockey],
          ['raceCourse', raceCourse],
          ['raceDate', raceDate],
          ['raceReplayURL', raceReplayURL || ''],
          ['horseTrainer', trainer.trainer_name],
          ['horseType', h.sex],
          ['propertyLocation', trainer.full_address || missing('trainer.full_address')],
          ['searchTerms', searchTerms],
          ['horseColour', horseColour],
          ['horseDOB', horseDOB],
          ['assetType', boilerplate.asset_type],
        ], cellBorders),

        new Paragraph({ spacing: { before: 200, after: 80 }, children: [] }),

        // detailSummary sub-table
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: 'detailSummary' })] }),
        buildMetaTable([
          ['Location', trainer.location || missing('location')],
          ['Trainer', trainer.trainer_name || missing('trainer')],
          ['Duration', `${o.duration_months} months (${o.start_date} to ${o.end_date})`],
          ['Sire', p.sire_name || missing('sire')],
          ['Dam', p.dam_name || missing('dam')],
          ['Microchip', h.microchip_number || missing('microchip')],
        ], cellBorders),

        new Paragraph({ spacing: { before: 200, after: 80 }, children: [] }),

        // horsePedigree
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: 'horsePedigree' })] }),
        new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: `The Sire: ${sire.display_name}`, bold: true })] }),
        new Paragraph({ spacing: { after: 120 }, children: [new TextRun(sire.description || missing('sire_profile.description'))] }),
        new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: `The Dam: ${dam.display_name}`, bold: true })] }),
        new Paragraph({ spacing: { after: 200 }, children: [new TextRun(dam.description || missing('dam_profile.description'))] }),
      ],
    }],
  });

  return doc;
}

function buildMetaTable(
  rows: [string, string][],
  cellBorders: Record<string, { style: typeof BorderStyle.SINGLE; size: number; color: string }>,
): Table {
  const COL1 = 3200;
  const COL2 = 5826;
  const TABLE_WIDTH = COL1 + COL2;

  return new Table({
    width: { size: TABLE_WIDTH, type: WidthType.DXA },
    columnWidths: [COL1, COL2],
    rows: [
      new TableRow({
        children: [
          new TableCell({ borders: cellBorders, width: { size: COL1, type: WidthType.DXA }, shading: { fill: '2D3A4A', type: ShadingType.CLEAR }, margins: { top: 60, bottom: 60, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: 'Field', bold: true, color: 'FFFFFF', font: 'Calibri', size: 20 })] })] }),
          new TableCell({ borders: cellBorders, width: { size: COL2, type: WidthType.DXA }, shading: { fill: '2D3A4A', type: ShadingType.CLEAR }, margins: { top: 60, bottom: 60, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: 'Value', bold: true, color: 'FFFFFF', font: 'Calibri', size: 20 })] })] }),
        ],
      }),
      ...rows.map(([field, value], idx) =>
        new TableRow({
          children: [
            new TableCell({ borders: cellBorders, width: { size: COL1, type: WidthType.DXA }, shading: { fill: idx % 2 === 0 ? 'F5F5F5' : 'FFFFFF', type: ShadingType.CLEAR }, margins: { top: 40, bottom: 40, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: field, bold: true, font: 'Calibri', size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: COL2, type: WidthType.DXA }, shading: { fill: idx % 2 === 0 ? 'F5F5F5' : 'FFFFFF', type: ShadingType.CLEAR }, margins: { top: 40, bottom: 40, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: value, font: 'Calibri', size: 20 })] })] }),
          ],
        }),
      ),
    ],
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────

async function main() {
  const horseSlug = process.argv[2];
  if (!horseSlug) {
    console.error('Usage: npx tsx scripts/generate-listing-doc.ts <horse-slug>');
    console.error('Example: npx tsx scripts/generate-listing-doc.ts i-stole-a-manolo');
    process.exit(1);
  }

  console.log(`\n=== DS Listing Document Generator ===`);
  console.log(`Horse: ${horseSlug}\n`);

  try {
    const { horse, trainer, sire, dam, boilerplate } = loadAllData(horseSlug);
    console.log(`\nBuilding document for: ${horse.identity.horse_name}`);
    const doc = buildDocument(horse, trainer, sire, dam, boilerplate);

    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const outputPath = path.join(OUTPUT_DIR, `${horseSlug}-DS-listing.docx`);
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(outputPath, buffer);

    console.log(`\nDocument generated: ${outputPath}`);
    console.log(`File size: ${(buffer.length / 1024).toFixed(1)} KB`);

    const gaps = findMissingFields(horse, trainer, sire, dam);
    if (gaps.length > 0) {
      console.log(`\n\u26a0 Missing fields (${gaps.length}):`);
      gaps.forEach((g) => console.log(`  - ${g}`));
    } else {
      console.log(`\n\u2713 All required fields populated.`);
    }
  } catch (err: any) {
    console.error(`\nError: ${err.message}`);
    process.exit(1);
  }
}

function findMissingFields(horse: HorseData, trainer: TrainerData, sire: SireData, dam: DamData): string[] {
  const gaps: string[] = [];
  const check = (val: any, name: string) => { if (!val || val === '') gaps.push(name); };

  check(horse.identity.horse_name, 'identity.horse_name');
  check(horse.identity.foaling_date, 'identity.foaling_date');
  check(horse.identity.sex, 'identity.sex');
  check(horse.identity.colour, 'identity.colour');
  check(horse.identity.microchip_number, 'identity.microchip_number');
  check(horse.identity.breeding_url, 'identity.breeding_url');
  check(horse.pedigree.sire_name, 'pedigree.sire_name');
  check(horse.pedigree.dam_name, 'pedigree.dam_name');
  check(horse.narrative.tagline, 'narrative.tagline');
  check(horse.narrative.intro_paragraph, 'narrative.intro_paragraph');
  check(horse.narrative.about_paragraph, 'narrative.about_paragraph');
  check(horse.narrative.current_status, 'narrative.current_status');
  check(trainer.trainer_name, 'trainer.trainer_name');
  check(trainer.bio, 'trainer.bio');
  check(trainer.location, 'trainer.location');
  check(trainer.full_address, 'trainer.full_address');
  check(sire.description, 'sire_profile.description');
  check(dam.description, 'dam_profile.description');
  check(horse.offering.duration_months, 'offering.duration_months');
  check(horse.offering.investor_share_percent, 'offering.investor_share_percent');

  return gaps;
}

main();
