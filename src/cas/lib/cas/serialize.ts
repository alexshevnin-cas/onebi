/**
 * Serialize the editable `AppConfig` back to the raw CAS wire shapes. Inverse:
 * `parse.ts`.
 *
 * The per-format waterfall order arrays (`Interstitial`, …) are *derived*: a
 * provider participates when its eCPM ≠ -1, ordered by eCPM descending with
 * priority breaking ties (matches the server). On import we also preserve the
 * original order arrays; `toCasCountry` re-emits the preserved order unless the
 * eCPM changed, in which case it recomputes.
 */

import {
  AD_FORMATS,
  ECPM_EXCLUDE,
  ECPM_KEY,
  GLOBAL_SCALARS_INV,
  ORDER_KEY,
  type AdFormat,
} from "./constants";
import type {
  AppConfig,
  CountryConfig,
  GlobalConfig,
  Provider,
  WireCountry,
  WireCountryConfig,
  WireGlobalConfig,
  WireProvider,
} from "./types";

export function toWireProvider(p: Provider): WireProvider {
  const wire: WireProvider = {
    id: p.id,
    net: p.net,
    settings: JSON.stringify(p.settings ?? {}),
  };
  if (p.label != null) wire.label = p.label;
  return wire;
}

export function toCasGlobal(g: GlobalConfig): WireGlobalConfig {
  const wire: WireGlobalConfig = { providers: g.providers.map(toWireProvider) };
  for (const [friendly, wireKey] of Object.entries(GLOBAL_SCALARS_INV)) {
    const v = (g as unknown as Record<string, unknown>)[friendly];
    if (v != null) wire[wireKey] = v;
  }
  if (g.extra) wire.extra = g.extra;
  if (g.passthrough) {
    for (const [k, v] of Object.entries(g.passthrough)) wire[k] = v;
  }
  return wire;
}

/**
 * Derive the waterfall order for a format: provider indexes with eCPM ≠ -1,
 * sorted by eCPM desc, ties broken by priority (present first) then index.
 */
export function deriveOrder(
  ecpm: number[],
  priority: Record<string, number> | undefined,
): number[] {
  const idx = ecpm
    .map((v, i) => i)
    .filter((i) => ecpm[i] !== ECPM_EXCLUDE);
  const prio = (i: number) => (priority && priority[String(i)] != null ? 1 : 0);
  return idx.sort((a, b) => {
    if (ecpm[b] !== ecpm[a]) return ecpm[b] - ecpm[a];
    if (prio(b) !== prio(a)) return prio(b) - prio(a);
    return a - b;
  });
}

/**
 * Serialize one A/B group to a wire country object. `ab` controls whether the
 * A/B fields (`abTestWeight` / `waterfallName`) are emitted — they belong only
 * on members of a multi-group array, not on a lone country.
 */
export function toCasCountry(country: CountryConfig, ab = false): WireCountryConfig {
  const wire: WireCountryConfig = { Location: country.location };
  for (const fmt of AD_FORMATS) {
    const arr = country.ecpm[fmt];
    if (!arr) continue;
    const preserved = country.order?.[fmt];
    const order = preserved ?? deriveOrder(arr, country.priority);
    wire[ORDER_KEY[fmt]] = order;
    wire[ECPM_KEY[fmt]] = arr;
  }
  if (country.priority && Object.keys(country.priority).length) {
    wire.priority = country.priority;
  }
  if (ab) {
    if (country.abTestWeight != null) wire.abTestWeight = country.abTestWeight;
    if (country.waterfallName != null) wire.waterfallName = country.waterfallName;
  }
  return wire;
}

/**
 * Serialize a country's A/B groups: a single object when there's one group, or
 * an array of objects (carrying A/B weights) for a real A/B test.
 */
export function toCasCountryGroups(groups: CountryConfig[]): WireCountry {
  if (groups.length === 1) return toCasCountry(groups[0]);
  return groups.map((g) => toCasCountry(g, true));
}

/** The full cas.php-style response: global + per-country, keyed by ISO2. */
export function toCasResponse(app: AppConfig): {
  global: WireGlobalConfig;
  countries: Record<string, WireCountry>;
} {
  const countries: Record<string, WireCountry> = {};
  for (const [iso, groups] of Object.entries(app.countries)) {
    countries[iso] = toCasCountryGroups(groups);
  }
  return { global: toCasGlobal(app.global), countries };
}

/** Recompute the order arrays for a country from its current eCPM + priority. */
export function recomputeOrder(country: CountryConfig): CountryConfig {
  const order: Partial<Record<AdFormat, number[]>> = {};
  for (const fmt of AD_FORMATS) {
    const arr = country.ecpm[fmt];
    if (arr) order[fmt] = deriveOrder(arr, country.priority);
  }
  return { ...country, order };
}
