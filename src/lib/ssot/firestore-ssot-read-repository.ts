import type { SsotReadRepository } from './ssot-read-repository';

const FIRESTORE_NOT_READY_MESSAGE =
  'VITE_SSOT_DATA_SOURCE=firestore is configured, but the Firestore-backed SsotReadRepository is not implemented yet in SSOT_Build.';

export function createFirestoreSsotReadRepository(): SsotReadRepository {
  return {
    source: 'firestore',
    async loadSeed() {
      throw new Error(
        `${FIRESTORE_NOT_READY_MESSAGE} Keep the local snapshot path active until the browser-side Firestore adapter exists.`,
      );
    },
  };
}
