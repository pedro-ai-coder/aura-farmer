import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join, relative, extname } from 'node:path';

const root = process.cwd();
const base = join(root, 'public', 'assets');
const allowed = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.avif']);
const files = [];
async function walk(dir) {
  let entries;
  try { entries = await readdir(dir, { withFileTypes: true }); }
  catch (error) { if (error.code === 'ENOENT') return; throw error; }
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) await walk(full);
    else if (entry.isFile() && allowed.has(extname(entry.name).toLowerCase())) {
      const data = await readFile(full);
      files.push({ path: relative(root, full).replaceAll('\\', '/'), bytes: data.length, extension: extname(entry.name).toLowerCase(), sha256: createHash('sha256').update(data).digest('hex') });
    }
  }
}
await walk(base);
const groups = new Map();
for (const file of files) groups.set(file.sha256, [...(groups.get(file.sha256) ?? []), file.path]);
const duplicates = [...groups.values()].filter(paths => paths.length > 1);
const output = { generatedAt: new Date().toISOString(), assetCount: files.length, duplicateGroups: duplicates, files };
await mkdir(join(root, 'reports'), { recursive: true });
await writeFile(join(root, 'reports', 'asset-inventory.json'), JSON.stringify(output, null, 2) + '\n');
console.log(`Inventoried ${files.length} image assets; ${duplicates.length} byte-identical duplicate groups. See reports/asset-inventory.json`);
