export type ProfileImageEntityType = 'horse' | 'trainer' | 'owner';

export type ProfileImageSourceKind =
  | 'seeded_static'
  | 'remote_url'
  | 'browser_temp'
  | 'unknown';

export type ProfileImageAssetReference = {
  entity_type: ProfileImageEntityType;
  entity_key: string;
  storage_path: string;
  source_kind: ProfileImageSourceKind;
  original_file_name: string;
};

function sanitizePathSegment(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'unknown';
}

function sanitizeFileName(value: string): string {
  return value
    .trim()
    .replace(/[^A-Za-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'profile-image.png';
}

export function resolveProfileImageSourceKind(imageSrc: string): ProfileImageSourceKind {
  const value = imageSrc.trim();
  if (!value) return 'unknown';
  if (value.startsWith('blob:')) return 'browser_temp';
  if (value.startsWith('http://') || value.startsWith('https://')) return 'remote_url';
  if (value.startsWith('/')) return 'seeded_static';
  return 'unknown';
}

export function profileImageSourceKindLabel(kind: ProfileImageSourceKind): string {
  if (kind === 'browser_temp') return 'Temporary browser upload';
  if (kind === 'remote_url') return 'Remote URL';
  if (kind === 'seeded_static') return 'Seeded static file';
  return 'Unknown';
}

export function buildProfileImageStoragePath(options: {
  entityType: ProfileImageEntityType;
  entityKey: string;
  fileName: string;
}): string {
  const entityFolder = `${options.entityType}s`;
  return `ssot/${entityFolder}/${sanitizePathSegment(options.entityKey)}/profile/${sanitizeFileName(options.fileName)}`;
}
