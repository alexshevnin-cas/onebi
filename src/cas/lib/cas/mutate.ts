/**
 * Pure mutations over an `AppConfig` that keep the index-alignment invariant
 * intact: every country group's eCPM arrays stay the same length as
 * `global.providers`, and priority / order indexes are remapped when a provider
 * is removed. Each function returns a new `AppConfig` (no in-place mutation).
 */

import { AD_FORMATS, type AdFormat } from "./constants";
import { newCountry } from "./factory";
import { floorFromLabel, providerFormats, providerKind, servedFormats, unitFor } from "./provider";
import type { AppConfig, CountryConfig, Provider } from "./types";

/** Map over every A/B group of every country. */
function mapGroups(
  app: AppConfig,
  fn: (g: CountryConfig) => CountryConfig,
): Record<string, CountryConfig[]> {
  const out: Record<string, CountryConfig[]> = {};
  for (const [iso, groups] of Object.entries(app.countries)) out[iso] = groups.map(fn);
  return out;
}

// ───────────────────────────── Providers ─────────────────────────────

/**
 * Append a provider (line). Every group's existing eCPM arrays grow by one
 * trailing slot so they stay index-aligned — `-1` (excluded) by default, or the
 * given `floor` for the formats this line actually serves. Appending at the end
 * means priority / order indexes never shift.
 */
export function addProvider(app: AppConfig, provider: Provider, floor?: number): AppConfig {
  const providers = [...app.global.providers, provider];
  const served = new Set(providerFormats(provider));
  const countries = mapGroups(app, (g) => {
    const ecpm: Partial<Record<AdFormat, number[]>> = {};
    for (const [fmt, arr] of Object.entries(g.ecpm) as [AdFormat, number[]][]) {
      const cell = floor != null && served.has(fmt) ? floor : -1;
      ecpm[fmt] = [...arr, cell];
    }
    return { ...g, ecpm };
  });
  return { ...app, global: { ...app.global, providers }, countries };
}

/**
 * Remove the provider at `index`. Every group's eCPM arrays drop that slot, and
 * priority keys / order arrays are remapped (entries at `index` dropped,
 * higher indexes shifted down by one).
 */
export function removeProvider(app: AppConfig, index: number): AppConfig {
  const providers = app.global.providers.filter((_, i) => i !== index);
  const remap = (i: number) => (i > index ? i - 1 : i);

  const countries = mapGroups(app, (g) => {
    const ecpm: Partial<Record<AdFormat, number[]>> = {};
    for (const [fmt, arr] of Object.entries(g.ecpm) as [AdFormat, number[]][]) {
      ecpm[fmt] = arr.filter((_, i) => i !== index);
    }

    let order: CountryConfig["order"];
    if (g.order) {
      order = {};
      for (const [fmt, arr] of Object.entries(g.order) as [AdFormat, number[]][]) {
        order[fmt] = arr.filter((i) => i !== index).map(remap);
      }
    }

    let priority: CountryConfig["priority"];
    if (g.priority) {
      priority = {};
      for (const [k, v] of Object.entries(g.priority)) {
        const i = Number(k);
        if (i === index) continue;
        priority[String(remap(i))] = v;
      }
    }

    return { ...g, ecpm, order, priority };
  });

  return { ...app, global: { ...app.global, providers }, countries };
}

/** Replace the provider at `index`. */
export function setProvider(app: AppConfig, index: number, provider: Provider): AppConfig {
  const providers = app.global.providers.map((p, i) => (i === index ? provider : p));
  return { ...app, global: { ...app.global, providers } };
}

/**
 * Sort rank for a line: `Core`-labelled lines pin to the very top (0), then all
 * bidding lines (1), then floor lines (2). Within floors we order by decoded
 * price (handled by the comparator).
 */
export function lineRank(p: Provider): 0 | 1 | 2 {
  if ((p.label ?? "").trim().toLowerCase() === "core") return 0;
  return providerKind(p) === "bidding" ? 1 : 2;
}

/**
 * Reorder the provider list into the canonical mediation order — Core first,
 * then bidding, then floors by decoded floor price (high → low) — and realign
 * every group's eCPM arrays + priority indexes to match. Preserved `order`
 * arrays are dropped so they recompute on save.
 */
export function sortProviders(app: AppConfig): AppConfig {
  const providers = app.global.providers;
  // Decorate-sort original indexes; stable on original index for ties.
  const perm = providers.map((_, i) => i).sort((a, b) => {
    const pa = providers[a];
    const pb = providers[b];
    const ra = lineRank(pa);
    const rb = lineRank(pb);
    if (ra !== rb) return ra - rb;
    if (ra === 2) {
      const fa = floorFromLabel(pa.label) ?? -Infinity;
      const fb = floorFromLabel(pb.label) ?? -Infinity;
      if (fa !== fb) return fb - fa; // higher floor first
    }
    return a - b; // stable
  });

  // old index → new index
  const newIndexOf = new Array<number>(providers.length);
  perm.forEach((oldIdx, newIdx) => (newIndexOf[oldIdx] = newIdx));

  const sortedProviders = perm.map((i) => providers[i]);

  const countries = mapGroups(app, (g) => {
    const ecpm: Partial<Record<AdFormat, number[]>> = {};
    for (const [fmt, arr] of Object.entries(g.ecpm) as [AdFormat, number[]][]) {
      ecpm[fmt] = perm.map((i) => arr[i]);
    }
    let priority: CountryConfig["priority"];
    if (g.priority) {
      priority = {};
      for (const [k, v] of Object.entries(g.priority)) {
        const ni = newIndexOf[Number(k)];
        if (ni != null) priority[String(ni)] = v;
      }
    }
    return { ...g, ecpm, order: undefined, priority };
  });

  return { ...app, global: { ...app.global, providers: sortedProviders }, countries };
}

// ───────────────────────────── Countries ─────────────────────────────

/**
 * Add a country (single group). eCPM arrays are sized to the provider count and
 * default to `-1`; floor lines are pre-filled from their label price where one
 * can be decoded (e.g. `ra10.30` → 10.3).
 */
export function addCountry(app: AppConfig, iso: string): AppConfig {
  const code = iso.trim().toUpperCase();
  if (!code || app.countries[code]) return app;
  const providers = app.global.providers;
  const formats = servedFormats(providers);
  const base = newCountry(code, providers.length, formats);
  const filled = fillFloorsFromLabels({ ...base }, providers, formats);
  return { ...app, countries: { ...app.countries, [code]: [filled] } };
}

export function removeCountry(app: AppConfig, iso: string): AppConfig {
  const countries = { ...app.countries };
  delete countries[iso];
  return { ...app, countries };
}

/**
 * Set every floor line's eCPM from its decoded label price, for the given
 * formats, where the line serves the format. Only overwrites `-1` cells unless
 * `force`. Bidding lines are left untouched.
 */
export function fillFloorsFromLabels(
  group: CountryConfig,
  providers: Provider[],
  formats: readonly AdFormat[] = AD_FORMATS,
  force = false,
): CountryConfig {
  const ecpm: Partial<Record<AdFormat, number[]>> = { ...group.ecpm };
  for (const fmt of formats) {
    const arr = (ecpm[fmt] ?? new Array(providers.length).fill(-1)).slice();
    providers.forEach((p, i) => {
      const u = unitFor(p, fmt);
      if (!u || u.kind !== "floor") return;
      const floor = floorFromLabel(p.label);
      if (floor == null) return;
      if (force || arr[i] === -1 || arr[i] == null) arr[i] = floor;
    });
    ecpm[fmt] = arr;
  }
  return { ...group, ecpm };
}

// ───────────────────────────── A/B groups ─────────────────────────────

/** Evenly split 100% weight across `n` groups (rounded, remainder on first). */
export function evenWeights(n: number): number[] {
  if (n <= 0) return [];
  const base = Math.floor(100 / n);
  const weights = new Array(n).fill(base);
  weights[0] += 100 - base * n;
  return weights;
}

/** Re-assign even A/B weights and default waterfall names across groups. */
function reweight(groups: CountryConfig[]): CountryConfig[] {
  if (groups.length === 1) {
    const { abTestWeight: _w, waterfallName: _n, ...rest } = groups[0];
    void _w;
    void _n;
    return [rest];
  }
  const weights = evenWeights(groups.length);
  return groups.map((g, i) => ({
    ...g,
    abTestWeight: weights[i],
    waterfallName: g.waterfallName ?? `Group ${String.fromCharCode(65 + i)}`,
  }));
}

/** Add an A/B group to a country by cloning its last group. */
export function addAbGroup(app: AppConfig, iso: string): AppConfig {
  const groups = app.countries[iso];
  if (!groups) return app;
  const clone: CountryConfig = {
    ...groups[groups.length - 1],
    ecpm: cloneEcpm(groups[groups.length - 1].ecpm),
    priority: groups[groups.length - 1].priority
      ? { ...groups[groups.length - 1].priority }
      : undefined,
    order: undefined,
    waterfallName: undefined,
  };
  const next = reweight([...groups, clone]);
  return { ...app, countries: { ...app.countries, [iso]: next } };
}

/** Remove the A/B group at `groupIndex`; re-evens the remaining weights. */
export function removeAbGroup(app: AppConfig, iso: string, groupIndex: number): AppConfig {
  const groups = app.countries[iso];
  if (!groups || groups.length <= 1) return app;
  const next = reweight(groups.filter((_, i) => i !== groupIndex));
  return { ...app, countries: { ...app.countries, [iso]: next } };
}

/** Replace the A/B group at `groupIndex`. */
export function setGroup(
  app: AppConfig,
  iso: string,
  groupIndex: number,
  group: CountryConfig,
): AppConfig {
  const groups = app.countries[iso];
  if (!groups) return app;
  const next = groups.map((g, i) => (i === groupIndex ? group : g));
  return { ...app, countries: { ...app.countries, [iso]: next } };
}

function cloneEcpm(
  ecpm: Partial<Record<AdFormat, number[]>>,
): Partial<Record<AdFormat, number[]>> {
  const out: Partial<Record<AdFormat, number[]>> = {};
  for (const [fmt, arr] of Object.entries(ecpm) as [AdFormat, number[]][]) {
    out[fmt] = [...arr];
  }
  return out;
}
