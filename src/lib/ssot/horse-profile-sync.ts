import type { HorseRecord } from './ssot-read-repository';
import { buildHorseFirestoreDocPath } from './firestore-horse-stage-one';

export type HorseProfileSyncStatus = 'local' | 'firestore' | 'synced';

export type HorseProfileSyncRecord = {
  status: HorseProfileSyncStatus;
  firestore_doc_path: string;
  last_checked_at: string;
};

export function getHorseProfileSyncKey(
  horse: Pick<HorseRecord, 'microchip_number' | 'horse_id'>,
): string {
  return horse.microchip_number.trim() || horse.horse_id.trim();
}

export function resolveHorseProfileSyncRecord(
  horse: Pick<HorseRecord, 'microchip_number' | 'horse_id'>,
  syncState: Record<string, HorseProfileSyncRecord>,
): HorseProfileSyncRecord {
  const key = getHorseProfileSyncKey(horse);
  const existing = syncState[key];
  if (existing) {
    return {
      ...existing,
      firestore_doc_path: existing.firestore_doc_path || buildHorseFirestoreDocPath(horse),
    };
  }

  return {
    status: 'local',
    firestore_doc_path: buildHorseFirestoreDocPath(horse),
    last_checked_at: '',
  };
}

export function horseProfileSyncLabel(status: HorseProfileSyncStatus): string {
  if (status === 'firestore') return 'Firestore';
  if (status === 'synced') return 'Synced';
  return 'Local';
}

export function horseProfileSyncBadgeClass(status: HorseProfileSyncStatus): string {
  if (status === 'firestore') return 'border-blue-200 bg-blue-50 text-blue-700';
  if (status === 'synced') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  return 'border-amber-200 bg-amber-50 text-amber-700';
}
