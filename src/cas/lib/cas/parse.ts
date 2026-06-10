/**
 * Parse the raw CAS config (as returned by cas.php / stored on the server) into
 * the editable `AppConfig`. Inverse: `serialize.ts`.
 */

import {
  AD_FORMATS,
  ECPM_KEY,
  GLOBAL_SCALARS,
  ORDER_KEY,
  PLATFORM_FROM_NUM,
  type AdFormat,
  type Platform,
} from "./constants";
import type {
  AppConfig,
  AppExtraConfig,
  AppInfo,
  CountryConfig,
  GlobalConfig,
  Provider,
} from "./types";

/** Parse a value that may be a JSON string or already-parsed object. */
function asJson<T>(value: unknown): T {
  return typeof value === "string" ? (JSON.parse(value) as T) : (value as T);
}

function parseProvider(raw: Record<string, unknown>): Provider {
  const settings = asJson<Record<string, string | number>>(raw.settings ?? "{}") ?? {};
  const p: Provider = {
    id: Number(raw.id),
    net: String(raw.net ?? ""),
    settings,
  };
  if (raw.label != null) p.label = String(raw.label);
  return p;
}

/** Parse the global config object (the `ALL` / app-config payload). */
export function parseGlobal(rawGlobal: Record<string, unknown>): GlobalConfig {
  const providersRaw = Array.isArray(rawGlobal.providers) ? rawGlobal.providers : [];
  const g: GlobalConfig = {
    providers: providersRaw.map((p) => parseProvider(p as Record<string, unknown>)),
  };

  const passthrough: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(rawGlobal)) {
    if (key === "providers") continue;
    const friendly = GLOBAL_SCALARS[key];
    if (friendly) {
      (g as unknown as Record<string, unknown>)[friendly] = value;
    } else {
      passthrough[key] = value;
    }
  }
  if (Object.keys(passthrough).length) g.passthrough = passthrough;
  return g;
}

/** Parse one country config object. `n` = provider count (for validation). */
export function parseCountry(raw: Record<string, unknown>): CountryConfig {
  const location = String(raw.Location ?? "").toUpperCase();
  const ecpm: Partial<Record<AdFormat, number[]>> = {};
  const order: Partial<Record<AdFormat, number[]>> = {};

  for (const fmt of AD_FORMATS) {
    const e = raw[ECPM_KEY[fmt]];
    if (Array.isArray(e)) ecpm[fmt] = e.map((v) => Number(v));
    const o = raw[ORDER_KEY[fmt]];
    if (Array.isArray(o)) order[fmt] = o.map((v) => Number(v));
  }

  const c: CountryConfig = { location, ecpm };
  if (Object.keys(order).length) c.order = order;
  if (raw.priority && typeof raw.priority === "object") {
    c.priority = raw.priority as Record<string, number>;
  }
  if (raw.abTestWeight != null) c.abTestWeight = Number(raw.abTestWeight);
  if (raw.waterfallName != null) c.waterfallName = String(raw.waterfallName);
  return c;
}

/**
 * Parse one country payload, which may be a single config object or an array of
 * A/B-test groups. Always returns an array of groups (length 1 = no A/B).
 */
export function parseCountryGroups(raw: unknown): CountryConfig[] {
  const list = Array.isArray(raw) ? raw : [raw];
  return list
    .filter((g): g is Record<string, unknown> => g != null && typeof g === "object")
    .map((g) => parseCountry(g));
}

/** Inputs gathered from the cas.php / admin export for one app. */
export interface CasResponseParts {
  bundle: string;
  platform: Platform | number;
  /** Global app config (with `providers`). */
  config: Record<string, unknown>;
  /** Per-country configs: each is an object with `Location`, or an array of
   * such objects for an A/B test. */
  countries: unknown[];
  /** Optional SDK info blob (for appName / reference). */
  info?: AppInfo;
  /** Optional per-network extra config. */
  extra?: AppExtraConfig;
}

/** Assemble a full `AppConfig` from the parts of a cas.php response. */
export function fromCasResponse(parts: CasResponseParts): AppConfig {
  const platform: Platform =
    typeof parts.platform === "number"
      ? (PLATFORM_FROM_NUM[parts.platform] ?? "android")
      : parts.platform;

  const global = parseGlobal(parts.config);
  if (parts.extra) global.extra = parts.extra;

  const countries: Record<string, CountryConfig[]> = {};
  for (const raw of parts.countries) {
    const groups = parseCountryGroups(raw);
    const location = groups[0]?.location;
    if (location) countries[location] = groups;
  }

  const app: AppConfig = { bundle: parts.bundle, platform, global, countries };
  if (parts.info) {
    app.info = parts.info;
    if (typeof parts.info.appName === "string") app.appName = parts.info.appName;
  }
  return app;
}
