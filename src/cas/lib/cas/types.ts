/**
 * Types for the real CAS config (cas.php / server storage), raw-faithful so a
 * config round-trips losslessly.
 *
 * One app = global config (providers + scalars) + per-country configs. Each
 * provider keeps its network-specific `settings` blob verbatim; each country
 * keeps an eCPM array per format (index-aligned with providers) plus priority.
 */

import type { AdFormat, Platform } from "./constants";

/** One ad source line (a provider / placement). */
export interface Provider {
  /** CAS source code (the real discriminator; see networks.ts). */
  id: number;
  /** Network name, e.g. "AdMob", "Vungle". */
  net: string;
  /** Tier / variant label, e.g. "x2.50", "CasBid", "ra10.30". */
  label?: string;
  /**
   * Network-specific settings blob, parsed from the wire JSON string. Keys vary
   * by network: `inter_rtb` (bidding), `inter_AdUnit` / `inter_Id` /
   * `inter_PlacementID` (floor), plus credentials like `appId`, `AccountID`,
   * `mediation`, etc. Kept verbatim so nothing is lost on round-trip.
   */
  settings: Record<string, string | number>;
}

/** Per-network extra config (`{ config: [{ id, use_preload, … }] }`). */
export interface AppExtraConfig {
  config: Array<Record<string, number>>;
}

/** Global (country-agnostic) configuration for one app. */
export interface GlobalConfig {
  providers: Provider[];
  admobAppId?: string;
  applovinAppId?: string;
  collectAnalytics?: number;
  trackerCollect?: number;
  privacyPref?: number;
  consentPlatform?: number;
  bannerRefresh?: number;
  appPublisherName?: string;
  appPublisherId?: string;
  allowEndless?: number;
  cancelNetLevel?: number;
  /** Per-network extra config, if present. */
  extra?: AppExtraConfig;
  /** Any global scalar we don't model explicitly, preserved for round-trip. */
  passthrough?: Record<string, unknown>;
}

/**
 * Per-country configuration for a single A/B group.
 *
 * A country is modelled as an array of these (see `AppConfig.countries`): one
 * entry = no A/B test; several entries = an A/B test split by `abTestWeight`.
 */
export interface CountryConfig {
  /** ISO 3166-1 alpha-2 country code (uppercased), e.g. "US". */
  location: string;
  /**
   * eCPM per format: each array is index-aligned with `global.providers`
   * (length === providers.length). `-1` = provider excluded for the format.
   */
  ecpm: Partial<Record<AdFormat, number[]>>;
  /**
   * Server-derived waterfall order per format (provider indexes, eCPM-desc).
   * Preserved on import for fidelity; recomputed when eCPM changes.
   */
  order?: Partial<Record<AdFormat, number[]>>;
  /** Priority levels keyed by provider index (as a string, per wire). */
  priority?: Record<string, number>;
  /** A/B test traffic weight for this group (only set when >1 group). */
  abTestWeight?: number;
  /** Optional waterfall name for this group (A/B labelling). */
  waterfallName?: string;
}

/** Device/app info reported by the SDK (kept for reference, not edited). */
export type AppInfo = Record<string, unknown>;

/** The full config for a single app. */
export interface AppConfig {
  /** App bundle / package name. */
  bundle: string;
  platform: Platform;
  /** Display name from the SDK info, if known. */
  appName?: string;
  /** Raw SDK info blob, kept for reference. */
  info?: AppInfo;
  global: GlobalConfig;
  /**
   * Per-country configs, keyed by ISO2. Each value is an array of A/B groups:
   * one entry = no A/B test, several entries = an A/B split.
   */
  countries: Record<string, CountryConfig[]>;
  updatedAt?: number;
}

// ─────────────────────────── Wire shapes ───────────────────────────

/** A provider as it appears on the wire (settings is a JSON string). */
export interface WireProvider {
  id: number;
  net: string;
  label?: string;
  settings: string;
}

/** Global config as it appears on the wire. */
export interface WireGlobalConfig {
  providers: WireProvider[];
  [key: string]: unknown;
}

/** Country config as it appears on the wire. */
export interface WireCountryConfig {
  Location: string;
  priority?: Record<string, number>;
  abTestWeight?: number;
  waterfallName?: string;
  [key: string]: unknown;
}

/**
 * A country on the wire: a single config object, or an array of them for an
 * A/B test (each group carrying its own `abTestWeight` / `waterfallName`).
 */
export type WireCountry = WireCountryConfig | WireCountryConfig[];
