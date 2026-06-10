/** Factories for building empty config building blocks. */

import { AD_FORMATS, type AdFormat, type Platform } from "./constants";
import type { AppConfig, CountryConfig, GlobalConfig } from "./types";

/** An empty eCPM map sized to the provider count (all -1 = excluded). */
export function emptyEcpm(
  providerCount: number,
  formats: readonly AdFormat[] = AD_FORMATS,
): Partial<Record<AdFormat, number[]>> {
  const ecpm: Partial<Record<AdFormat, number[]>> = {};
  for (const fmt of formats) ecpm[fmt] = new Array(providerCount).fill(-1);
  return ecpm;
}

export function newCountry(
  location: string,
  providerCount: number,
  formats: readonly AdFormat[] = AD_FORMATS,
): CountryConfig {
  return { location: location.toUpperCase(), ecpm: emptyEcpm(providerCount, formats) };
}

export function newGlobal(): GlobalConfig {
  return { providers: [] };
}

export function newApp(bundle: string, platform: Platform): AppConfig {
  return { bundle, platform, global: newGlobal(), countries: {} };
}
