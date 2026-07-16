import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = join(__dirname, '..', 'src', 'content', 'anime');
const API_BASE = 'https://api.bgm.tv/v0/subjects';

const dryRun = !process.argv.includes('--write');

async function main() {
  const files = readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.mdx') || f.endsWith('.md'));
  let updated = 0;
  let skipped = 0;

  for (const file of files) {
    const fp = join(CONTENT_DIR, file);
    let content = readFileSync(fp, 'utf-8');
    const bgmId = extractBgmId(content);
    if (!bgmId) { skipped++; continue; }

    console.log(`[${file}] bgmId=${bgmId}, fetching...`);
    let data;
    try {
      const res = await fetch(`${API_BASE}/${bgmId}`);
      if (!res.ok) { console.error(`  API error: ${res.status}`); continue; }
      data = await res.json();
    } catch (e) {
      console.error(`  fetch failed: ${e.message}`);
      continue;
    }

    const updates = {};
    if (data.date) updates.airDate = data.date;
    if (data.eps != null) updates.episodes = data.eps;
    if (data.images?.large) updates.cover = data.images.large.replace('http://', 'https://');
    if (data.name && !content.includes('titleJa:')) updates.titleJa = data.name;

    const tagGenres = data.tags
      ?.filter((t) => t.count > 0)
      .slice(0, 5)
      .map((t) => t.name);
    if (tagGenres && tagGenres.length > 0) updates.genre = tagGenres;

    if (Object.keys(updates).length === 0) {
      console.log('  no updates');
      continue;
    }

    let newContent = content;
    for (const [key, value] of Object.entries(updates)) {
      const regex = new RegExp(`^${key}:\\s*.+`, 'm');
      if (regex.test(newContent)) {
        if (Array.isArray(value)) {
          const arrYaml = value.map((v) => `  - "${v}"`).join('\n');
          newContent = newContent.replace(regex, `${key}:\n${arrYaml}`);
        } else {
          newContent = newContent.replace(regex, `${key}: "${String(value)}"`);
        }
      } else {
        const insertPos = newContent.indexOf('---', 3);
        if (Array.isArray(value)) {
          const arrYaml = value.map((v) => `  - "${v}"`).join('\n');
          newContent = newContent.slice(0, insertPos) + `${key}:\n${arrYaml}\n` + newContent.slice(insertPos);
        } else {
          newContent = newContent.slice(0, insertPos) + `${key}: "${String(value)}"\n` + newContent.slice(insertPos);
        }
      }
    }

    if (dryRun) {
      console.log(`  would update: ${Object.keys(updates).join(', ')}`);
    } else {
      writeFileSync(fp, newContent, 'utf-8');
      console.log(`  updated: ${Object.keys(updates).join(', ')}`);
      updated++;
    }
  }

  console.log(`\nDone. ${files.length} files, ${skipped} skipped (no bgmId), ${updated} updated${dryRun ? ' (dry-run, use --write to apply)' : ''}.`);
}

function extractBgmId(content) {
  const match = content.match(/^bgmId:\s*(\d+)/m);
  return match ? parseInt(match[1], 10) : null;
}

main().catch(console.error);
