/**
 * Helpers for reading a provider's network-specific `settings` blob: detect
 * bidding vs floor, and pull the ad-unit id for a given format. Unit-id keys
 * vary by network (`inter_rtb`, `inter_AdUnit`, `inter_Id`, `inter_PlacementID`,
 * `inter_unit`…), so these centralize the lookup.
 */

import { AD_FORMATS, FLOOR_SUFFIXES, RTB_SUFFIX, type AdFormat } from "./constants";
import type { Provider } from "./types";

export type ProviderKind = "bidding" | "floor";

/** The unit id a provider uses for a format, and whether it's bidding/floor. */
export function unitFor(
  provider: Provider,
  fmt: AdFormat,
): { kind: ProviderKind; unit: string } | null {
  const s = provider.settings ?? {};
  const rtb = s[fmt + RTB_SUFFIX];
  if (typeof rtb === "string" && rtb) return { kind: "bidding", unit: rtb };
  for (const suf of FLOOR_SUFFIXES) {
    const v = s[fmt + suf];
    if (typeof v === "string" && v) return { kind: "floor", unit: v };
  }
  return null;
}

/**
 * A provider is "bidding" if any format carries an RTB unit, or it is served
 * through a mediation adapter (`mediation: max | cas`), or its label marks it as
 * a bid line (ends in "Bid"). Otherwise it is a fixed-floor waterfall line.
 */
export function providerKind(provider: Provider): ProviderKind {
  for (const fmt of AD_FORMATS) {
    if (typeof provider.settings?.[fmt + RTB_SUFFIX] === "string") return "bidding";
  }
  const med = providerMediation(provider);
  if (med === "max" || med === "cas") return "bidding";
  if (/bid$/i.test((provider.label ?? "").trim())) return "bidding";
  return "floor";
}

/** Formats a provider serves (has a unit id for). */
export function providerFormats(provider: Provider): AdFormat[] {
  return AD_FORMATS.filter((fmt) => unitFor(provider, fmt) != null);
}

/** The `mediation` tag of a provider, if any ("max" | "cas"). */
export function providerMediation(provider: Provider): string | undefined {
  const m = provider.settings?.mediation;
  return typeof m === "string" ? m : undefined;
}

/**
 * Decode the floor eCPM that a tier label encodes. Floor lines carry their
 * price in the label, optionally behind an alpha/numeric tag and with leading
 * zeros: `27.00`→27, `03.50`→3.5, `x2.50`→2.5, `ra10.30`→10.3, `ad03.00`→3,
 * `ax05.70`→5.7. We take the **last** number in the label (and accept a comma
 * decimal), so a digit-bearing prefix like `v733_8.25`→8.25 doesn't shadow the
 * price. Labels with no number (`MaxBid`, `CasBid`, `Core`, `Default`) → null.
 */
export function floorFromLabel(label?: string): number | null {
  if (!label) return null;
  const nums = label.replace(/,/g, ".").match(/\d+(?:\.\d+)?/g);
  if (!nums || nums.length === 0) return null;
  const n = Number.parseFloat(nums[nums.length - 1]);
  return Number.isFinite(n) ? n : null;
}

/** Union of all formats served by at least one provider, in canonical order. */
export function servedFormats(providers: Provider[]): AdFormat[] {
  return AD_FORMATS.filter((fmt) => providers.some((p) => unitFor(p, fmt) != null));
}

/**
 * Which mediation lane a line belongs to, for the nested Core·MAX → CAS view:
 *   - `max`        : MAX bidding (AppLovin), `mediation: max`
 *   - `cas-bid`    : CAS bidding (`mediation: cas`, or bidding with no marker)
 *   - `waterfall`  : CAS waterfall floor tiers
 * Both `cas-bid` and `waterfall` are the CAS "mini-Core" nested inside MAX/Core.
 */
export type MediationLane = "max" | "cas-bid" | "waterfall";

export function mediationLane(provider: Provider): MediationLane {
  if (providerKind(provider) === "bidding") {
    return providerMediation(provider) === "max" ? "max" : "cas-bid";
  }
  return "waterfall";
}
