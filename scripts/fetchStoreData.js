#!/usr/bin/env node
// Fetches real store data (name, icon, publisher) for ~100 apps
// iOS: iTunes Lookup API (batch), Android: google-play-scraper
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import gplay from 'google-play-scraper';

const __dirname = dirname(fileURLToPath(import.meta.url));
const csvPath = join(__dirname, '..', 'docs', '17107_2026_02_17.csv');
const outPath = join(__dirname, '..', 'src', 'storeData.js');

// Read CSV
const csv = readFileSync(csvPath, 'utf8');
const lines = csv.trim().split('\n').slice(1);
const pairs = lines.map(line => {
  const [bundleId, userId] = line.trim().split(',');
  return [bundleId, parseInt(userId, 10)];
});

const isIos = (id) => /^\d+$/.test(id);
const iosBundles = [...new Set(pairs.filter(([b]) => isIos(b)).map(([b]) => b))];
const androidBundles = [...new Set(pairs.filter(([b]) => !isIos(b)).map(([b]) => b))];

console.log(`Total: ${iosBundles.length} unique iOS, ${androidBundles.length} unique Android`);

// Pick more to account for dead apps (~40% fail rate)
const iosToFetch = iosBundles.slice(0, 100);
const androidToFetch = androidBundles.slice(0, 120);

const storeData = {}; // bundleId -> { appName, publisher, iconUrl, storeUrl }

// --- Fetch iOS via iTunes Lookup API (batch up to 200) ---
async function fetchIos(ids) {
  const url = `https://itunes.apple.com/lookup?id=${ids.join(',')}`;
  console.log(`Fetching ${ids.length} iOS apps...`);
  const resp = await fetch(url);
  const json = await resp.json();
  for (const r of (json.results || [])) {
    const appId = String(r.trackId);
    storeData[appId] = {
      appName: r.trackName || '',
      publisher: r.artistName || r.sellerName || '',
      iconUrl: (r.artworkUrl100 || r.artworkUrl60 || '').replace('100x100', '128x128'),
      storeUrl: r.trackViewUrl || `https://apps.apple.com/app/id${appId}`,
    };
  }
  console.log(`  Got ${json.resultCount} iOS results`);
}

// --- Fetch Android via google-play-scraper ---
async function fetchAndroid(ids) {
  console.log(`Fetching ${ids.length} Android apps...`);
  let ok = 0, fail = 0;
  for (const id of ids) {
    try {
      const app = await gplay.app({ appId: id, lang: 'en', country: 'us' });
      storeData[id] = {
        appName: app.title || '',
        publisher: app.developer || '',
        iconUrl: app.icon || '',
        storeUrl: app.url || `https://play.google.com/store/apps/details?id=${id}`,
      };
      ok++;
      process.stdout.write(`  Android: ${ok + fail}/${ids.length} (${ok} ok, ${fail} fail)\r`);
    } catch (e) {
      fail++;
      process.stdout.write(`  Android: ${ok + fail}/${ids.length} (${ok} ok, ${fail} fail)\r`);
    }
    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 200));
  }
  console.log(`\n  Android done: ${ok} ok, ${fail} fail`);
}

async function main() {
  await fetchIos(iosToFetch);
  await fetchAndroid(androidToFetch);

  const count = Object.keys(storeData).length;
  console.log(`\nTotal enriched: ${count} apps`);

  // Write as JS module
  const output = `// Auto-generated store data for ${count} apps
// Maps bundleId -> { appName, publisher, iconUrl, storeUrl }
export const storeData = ${JSON.stringify(storeData, null, 2)};
`;

  writeFileSync(outPath, output, 'utf8');
  console.log(`Written to ${outPath} (${(output.length / 1024).toFixed(1)} KB)`);
}

main().catch(e => { console.error(e); process.exit(1); });
