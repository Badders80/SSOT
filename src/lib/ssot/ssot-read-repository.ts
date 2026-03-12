import { createFirestoreSsotReadRepository } from './firestore-ssot-read-repository';
import { createLocalSsotReadRepository } from './local-ssot-read-repository';

export type HorseRecord = {
  horse_id: string;
  horse_name: string;
  country_code: string;
  foaling_date: string;
  sex: string;
  colour: string;
  sire: string;
  dam: string;
  nztr_life_number: string;
  microchip_number: string;
  trainer_id: string;
  owner_id: string;
  governing_body_code: string;
  breeding_url: string;
  performance_profile_url: string;
  horse_status: string;
  identity_status: string;
  source_primary: string;
  source_last_verified_at: string;
  source_notes: string;
};

export type LeaseRecord = {
  lease_id: string;
  horse_id: string;
  start_date: string;
  end_date: string;
  duration_months: string;
  percent_leased: string;
  token_count: string;
  percent_per_token: string;
  monthly_lease_price_nzd: string;
  annual_lease_price_nzd: string;
  price_per_one_percent_nzd: string;
  token_price_nzd: string;
  total_issuance_value_nzd: string;
  investor_share_percent: string;
  owner_share_percent: string;
  platform_fee_percent: string;
  lease_status: string;
  created_at: string;
  notes: string;
};

export type IntakeRecord = {
  intake_id: string;
  breeding_url: string;
  parse_status: string;
  parsed_horse_name: string;
};

export type DocumentRecord = {
  document_id: string;
  lease_id?: string;
  horse_id: string;
  document_type: string;
  document_version: string;
  document_date: string;
  source_reference: string;
  file_path: string;
  is_current: string;
  notes: string;
};

export type TrainerRecord = {
  trainer_id: string;
  trainer_name: string;
  stable_name: string;
  contact_name: string;
  phone: string;
  email: string;
  website: string;
  profile_status: string;
  notes: string;
  ai_profile?: string;
  social_links?: string[];
};

export type OwnerRecord = {
  owner_id: string;
  owner_name: string;
  entity_type: string;
  contact_name: string;
  phone: string;
  email: string;
  website: string;
  profile_status: string;
  notes: string;
  ai_profile?: string;
  social_links?: string[];
};

export type GoverningBodyRecord = {
  governing_body_code: string;
  governing_body_name: string;
  website: string;
  status: string;
  notes?: string;
};

export type SsotBuildSeedPayload = {
  horses: HorseRecord[];
  leases: LeaseRecord[];
  intakeQueue: IntakeRecord[];
  documents: DocumentRecord[];
  trainers: TrainerRecord[];
  owners: OwnerRecord[];
  governingBodies: GoverningBodyRecord[];
  _meta: {
    generatedAt: string;
    loadedFrom?: string;
  };
};

export type SsotDataSource = 'local' | 'firestore';

export type LoadSsotSeedOptions = {
  forceRefresh?: boolean;
  signal?: AbortSignal;
};

export interface SsotReadRepository {
  readonly source: SsotDataSource;
  loadSeed(options?: LoadSsotSeedOptions): Promise<SsotBuildSeedPayload>;
}

const DEFAULT_SSOT_DATA_SOURCE: SsotDataSource = 'local';

export function resolveSsotDataSource(
  value: string | undefined = import.meta.env.VITE_SSOT_DATA_SOURCE,
): SsotDataSource {
  return value === 'firestore' ? 'firestore' : DEFAULT_SSOT_DATA_SOURCE;
}

export function createSsotReadRepository(
  dataSource: SsotDataSource = resolveSsotDataSource(),
): SsotReadRepository {
  switch (dataSource) {
    case 'firestore':
      return createFirestoreSsotReadRepository();
    case 'local':
    default:
      return createLocalSsotReadRepository();
  }
}
