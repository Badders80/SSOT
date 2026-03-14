import type { HorseRecord } from './ssot-read-repository';

export const HORSE_FIRESTORE_STAGE_ONE_COLLECTION = 'horses';

export type FirestoreHorseIdentitySource = {
  system: string;
  verified_at: string;
  last_checked_at: string;
};

export type FirestoreHorseIdentityRecord = {
  microchip_number: string;
  horse_name: string;
  country_code: string;
  foaling_year: number | null;
  foaling_date: string;
  sex: string;
  colour: string;
  sire_name: string;
  dam_name: string;
  stud_book_id: string;
  nztr_life_number: string;
  pedigree_url: string;
  horse_performance_url: string;
  identity_status: string;
  source: FirestoreHorseIdentitySource;
};

export type FirestoreHorseIdentityDocument = {
  doc_id: string;
  data: FirestoreHorseIdentityRecord;
};

export type FirestoreHorseIdentityOptions = {
  sourceSystem?: string;
  verifiedAt?: string;
  lastCheckedAt?: string;
};

function normalizeValue(value: string | undefined): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeSourceSystem(value: string): string {
  const normalized = normalizeValue(value);
  if (normalized === 'loveracing_breeding') {
    return 'loveracing_nz';
  }
  return normalized || 'loveracing_nz';
}

function deriveFoalingYear(foalingDate: string): number | null {
  const yearText = normalizeValue(foalingDate).slice(0, 4);
  if (!/^\d{4}$/.test(yearText)) {
    return null;
  }

  const year = Number(yearText);
  return Number.isFinite(year) ? year : null;
}

function appendPedigreeAnchor(url: string): string {
  const normalized = normalizeValue(url);
  if (!normalized) {
    return '';
  }
  if (normalized.includes('#')) {
    return normalized;
  }
  return `${normalized}#bm-pedigree`;
}

function deriveStudBookId(horse: HorseRecord): string {
  const pedigreeUrl = normalizeValue(horse.breeding_url);
  const match = pedigreeUrl.match(/\/Breeding\/([^/]+)\//i);
  if (match?.[1]) {
    return match[1];
  }

  return normalizeValue(horse.horse_id);
}

export function buildHorseFirestoreDocId(horse: Pick<HorseRecord, 'microchip_number'>): string {
  return normalizeValue(horse.microchip_number);
}

export function buildHorseFirestoreDocPath(horse: Pick<HorseRecord, 'microchip_number'>): string {
  return `${HORSE_FIRESTORE_STAGE_ONE_COLLECTION}/${buildHorseFirestoreDocId(horse)}`;
}

export function mapHorseRecordToFirestoreHorseIdentity(
  horse: HorseRecord,
  options: FirestoreHorseIdentityOptions = {},
): FirestoreHorseIdentityRecord {
  const verifiedAt = normalizeValue(options.verifiedAt) || normalizeValue(horse.source_last_verified_at);
  const lastCheckedAt = normalizeValue(options.lastCheckedAt) || verifiedAt;

  return {
    microchip_number: buildHorseFirestoreDocId(horse),
    horse_name: normalizeValue(horse.horse_name),
    country_code: normalizeValue(horse.country_code),
    foaling_year: deriveFoalingYear(horse.foaling_date),
    foaling_date: normalizeValue(horse.foaling_date),
    sex: normalizeValue(horse.sex),
    colour: normalizeValue(horse.colour),
    sire_name: normalizeValue(horse.sire),
    dam_name: normalizeValue(horse.dam),
    stud_book_id: deriveStudBookId(horse),
    nztr_life_number: normalizeValue(horse.nztr_life_number),
    pedigree_url: appendPedigreeAnchor(horse.breeding_url),
    horse_performance_url: normalizeValue(horse.performance_profile_url),
    identity_status: normalizeValue(horse.identity_status),
    source: {
      system: normalizeSourceSystem(options.sourceSystem ?? horse.source_primary),
      verified_at: verifiedAt,
      last_checked_at: lastCheckedAt,
    },
  };
}

export function mapHorseRecordToFirestoreHorseIdentityDocument(
  horse: HorseRecord,
  options: FirestoreHorseIdentityOptions = {},
): FirestoreHorseIdentityDocument {
  return {
    doc_id: buildHorseFirestoreDocId(horse),
    data: mapHorseRecordToFirestoreHorseIdentity(horse, options),
  };
}
