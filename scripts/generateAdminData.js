#!/usr/bin/env node
// Script to generate src/adminData.js from CSV data
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const csvPath = join(__dirname, '..', 'docs', '17107_2026_02_17.csv');
const outPath = join(__dirname, '..', 'src', 'adminData.js');

// Read CSV
const csv = readFileSync(csvPath, 'utf8');
const lines = csv.trim().split('\n').slice(1); // skip header
const pairs = lines.map(line => {
  const [bundleId, userId] = line.trim().split(',');
  return [bundleId, parseInt(userId, 10)];
});

console.log(`Parsed ${pairs.length} rows, ${new Set(pairs.map(p => p[1])).size} unique customers`);

// Build JS array literal
const rawDataLines = pairs.map(([b, u]) => `['${b}',${u}]`).join(',\n');

const output = `// Auto-generated from docs/17107_2026_02_17.csv
// ${pairs.length} apps, ${new Set(pairs.map(p => p[1])).size} customers

// --- Managers (same as before) ---
export const adminManagers = [
  { id: 'm1', name: 'Anton Smirnov', email: 'anton@cas.io', role: 'Senior AM' },
  { id: 'm2', name: 'Serhii Shcherbyna', email: 'serhii@cas.io', role: 'AM' },
  { id: 'm3', name: 'Rashid Sabirov', email: 'rashid@cas.io', role: 'AM' },
  { id: 'm4', name: 'Buha Maksym', email: 'maksym@cas.io', role: 'AM' },
  { id: 'm5', name: 'Dmytro Dubniak', email: 'dmytro@cas.io', role: 'AM' },
];

// --- Seeded RNG for deterministic fake data ---
function seededRng(seed) {
  let s = Math.abs(seed) || 1;
  return () => { s = (s * 16807 + 11) % 2147483647; return s / 2147483647; };
}

// --- Platform detection ---
function detectPlatform(bundleId) {
  return /^\\d+$/.test(bundleId) ? 'ios' : 'android';
}

// --- Customer name generation ---
const prefixes = ['Game','Pixel','Star','Hyper','Mega','Fun','Play','App','Nova','Cube','Rush','Idle','Tap','Epic','Rise','Zen','Go','Top','Neon','Sky','Vibe','Bolt','Flux','Core','Wave','Edge','Zap','Ace','Pro','Bit'];
const suffixes = ['Studio','Games','Labs','Media','Apps','Works','Craft','Tech','Soft','Dev','Play','World','Zone','Hub','Box','Forge','Logic','Verse','Code','Grid'];

function generateCustomerName(userId) {
  const rng = seededRng(userId * 31 + 7);
  const p = prefixes[Math.floor(rng() * prefixes.length)];
  const s = suffixes[Math.floor(rng() * suffixes.length)];
  return p + ' ' + s;
}

// --- Date generation ---
function generateDate(rng) {
  const start = new Date('2024-01-01').getTime();
  const end = new Date('2026-02-15').getTime();
  const d = new Date(start + rng() * (end - start));
  return d.toISOString().slice(0, 10);
}

// --- Raw CSV data ---
const rawPairs = [
${rawDataLines}
];

// --- Build customers map ---
const customersMap = new Map();
for (const [bundleId, userId] of rawPairs) {
  if (!customersMap.has(userId)) {
    const rng = seededRng(userId * 17 + 3);
    const mgrIndex = Math.floor(seededRng(userId * 13 + 5)() * 5);
    customersMap.set(userId, {
      id: userId,
      name: generateCustomerName(userId),
      managerId: 'm' + (mgrIndex + 1),
      bundles: [],
      onboardingDate: generateDate(rng),
    });
  }
  customersMap.get(userId).bundles.push(bundleId);
}

// --- Exports ---

// Backward-compatible customer array for Reports superadmin filters
export const adminCustomersInitial = Array.from(customersMap.values()).map(c => ({
  id: c.id,
  name: c.name,
  managerId: c.managerId,
  bundles: c.bundles,
  onboardingDate: c.onboardingDate,
}));

// Flat apps array for the card grid
export const adminApps = rawPairs.map(([bundleId, userId], index) => {
  const customer = customersMap.get(userId);
  const rng = seededRng(index * 7 + userId * 3 + 11);
  const r = rng();
  const status = r < 0.70 ? 'active' : r < 0.85 ? 'paused' : r < 0.95 ? 'pending' : 'review';
  return {
    bundleId,
    userId,
    customerName: customer.name,
    managerId: customer.managerId,
    platform: detectPlatform(bundleId),
    status,
    dateAdded: generateDate(seededRng(index * 11 + 13)),
  };
});
`;

writeFileSync(outPath, output, 'utf8');
console.log(`Generated ${outPath} (${(output.length / 1024).toFixed(1)} KB)`);
