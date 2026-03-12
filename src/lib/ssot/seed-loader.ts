import {
  createSsotReadRepository,
  resolveSsotDataSource,
  type SsotReadRepository,
  type SsotBuildSeedPayload,
} from './ssot-read-repository';

let cachedRepository: SsotReadRepository | null = null;
let cachedRepositorySource: ReturnType<typeof resolveSsotDataSource> | null = null;

export function getSsotReadRepository(): SsotReadRepository {
  const dataSource = resolveSsotDataSource();
  if (!cachedRepository || cachedRepositorySource !== dataSource) {
    cachedRepository = createSsotReadRepository(dataSource);
    cachedRepositorySource = dataSource;
  }
  return cachedRepository;
}

export async function loadSsotSeed(forceRefresh = false): Promise<SsotBuildSeedPayload> {
  return getSsotReadRepository().loadSeed({ forceRefresh });
}
