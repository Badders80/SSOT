import type {
  DocumentRecord,
  GoverningBodyRecord,
  HorseRecord,
  IntakeRecord,
  LeaseRecord,
  LoadSsotSeedOptions,
  OwnerRecord,
  SsotBuildSeedPayload,
  SsotReadRepository,
  TrainerRecord,
} from './ssot-read-repository';

const DEFAULT_SEED_URL = '/intake/v0.1/seed.json';

const toArray = <T>(value: unknown): T[] => {
  return Array.isArray(value) ? (value as T[]) : [];
};

export function resolveLocalSsotSeedUrl(
  value: string | undefined = import.meta.env.VITE_SSOT_SEED_URL,
): string {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim();
  }
  return DEFAULT_SEED_URL;
}

export function normalizeSsotSeedPayload(
  raw: unknown,
  loadedFrom: string,
): SsotBuildSeedPayload {
  const value = (raw ?? {}) as Partial<SsotBuildSeedPayload>;
  return {
    horses: toArray<HorseRecord>(value.horses),
    leases: toArray<LeaseRecord>(value.leases),
    intakeQueue: toArray<IntakeRecord>(value.intakeQueue),
    documents: toArray<DocumentRecord>(value.documents),
    trainers: toArray<TrainerRecord>(value.trainers),
    owners: toArray<OwnerRecord>(value.owners),
    governingBodies: toArray<GoverningBodyRecord>(value.governingBodies),
    _meta: {
      generatedAt: value._meta?.generatedAt ?? '',
      ...(value._meta ?? {}),
      loadedFrom,
    },
  };
}

async function fetchSeedFromLocal(options: LoadSsotSeedOptions = {}): Promise<SsotBuildSeedPayload> {
  const seedUrl = resolveLocalSsotSeedUrl();
  const response = await fetch(seedUrl, {
    cache: 'no-store',
    signal: options.signal,
  });
  if (!response.ok) {
    throw new Error(`Failed to load seed.json (${response.status})`);
  }

  const json = (await response.json()) as unknown;
  return normalizeSsotSeedPayload(json, seedUrl);
}

export function createLocalSsotReadRepository(): SsotReadRepository {
  let cachedSeedPromise: Promise<SsotBuildSeedPayload> | null = null;

  return {
    source: 'local',
    async loadSeed(options: LoadSsotSeedOptions = {}) {
      if (options.forceRefresh || !cachedSeedPromise) {
        cachedSeedPromise = fetchSeedFromLocal(options);
      }

      try {
        return await cachedSeedPromise;
      } catch (error) {
        cachedSeedPromise = null;
        throw error;
      }
    },
  };
}
