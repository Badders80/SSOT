import fs from 'node:fs/promises';
import path from 'node:path';

const repoRoot = process.cwd();
const sourcePath = path.join(repoRoot, 'intake', 'v0.1', 'seed.json');
const targetPath = path.join(repoRoot, 'public', 'intake', 'v0.1', 'seed.json');

const run = async () => {
  const sourceRaw = await fs.readFile(sourcePath, 'utf8');
  JSON.parse(sourceRaw);

  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.writeFile(targetPath, sourceRaw, 'utf8');

  console.log(`synced seed: ${sourcePath} -> ${targetPath}`);
};

run().catch((error) => {
  console.error(`sync:seed failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
