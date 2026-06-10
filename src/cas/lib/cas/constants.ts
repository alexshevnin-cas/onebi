/**
 * Domain constants for the real CAS mediation format, as returned by the SDK
 * config endpoint (`Scr/cas.php`) and stored on the server.
 *
 * Shape of one app's config:
 *   global  — { admob_app_id, …scalars, providers: [{ id, net, label, settings }] }
 *   country — { Location, <Format>: [provider indexes, waterfall order],
 *               <f>Ecpm: [eCPM per provider, index-aligned, -1 = excluded],
 *               priority: { "<providerIndex>": level } }
 *
 * The per-format order arrays (`Interstitial`, `Rewarded`, …) are *derived* by
 * the server: providers with eCPM ≠ -1, sorted by eCPM descending (priority
 * breaks ties). The source of truth is the eCPM arrays + priority.
 */

/** Ad formats. Each maps to a settings-key prefix, an eCPM array, an order key. */
export const AD_FORMATS = [
  "inter",
  "reward",
  "banner",
  "appopen",
  "native",
  "mrec",
] as const;
export type AdFormat = (typeof AD_FORMATS)[number];

export const PLATFORMS = ["android", "ios"] as const;
export type Platform = (typeof PLATFORMS)[number];

/** Numeric platform used by the cas.php request (`platform=0|1`). */
export const PLATFORM_NUM: Record<Platform, 0 | 1> = { android: 0, ios: 1 };
export const PLATFORM_FROM_NUM: Record<number, Platform> = { 0: "android", 1: "ios" };

/** eCPM array key in the country config, per format. */
export const ECPM_KEY: Record<AdFormat, string> = {
  inter: "iEcpm",
  reward: "rEcpm",
  banner: "bEcpm",
  appopen: "oEcpm",
  native: "nEcpm",
  mrec: "mEcpm",
};

/** Waterfall order array key in the country config, per format. */
export const ORDER_KEY: Record<AdFormat, string> = {
  inter: "Interstitial",
  reward: "Rewarded",
  banner: "Banner",
  appopen: "AppOpen",
  native: "Native",
  mrec: "MREC",
};

/** Human label per format. */
export const FORMAT_LABEL: Record<AdFormat, string> = {
  inter: "Interstitial",
  reward: "Rewarded",
  banner: "Banner",
  appopen: "App Open",
  native: "Native",
  mrec: "MREC",
};

/** Reverse: eCPM key → format. */
export const FORMAT_BY_ECPM_KEY: Record<string, AdFormat> = Object.fromEntries(
  (Object.entries(ECPM_KEY) as [AdFormat, string][]).map(([f, k]) => [k, f]),
) as Record<string, AdFormat>;

/** Sentinel eCPM meaning "this provider does not serve the format". */
export const ECPM_EXCLUDE = -1;

/**
 * Settings-key suffix for a bidding (RTB) unit id, per format prefix:
 * `<fmt>_rtb`. A provider is a *bidding* line if any format carries this.
 */
export const RTB_SUFFIX = "_rtb";

/**
 * Floor unit-id key suffixes are network-specific. Checked in this order when
 * extracting a provider's floor unit id for a format (`<fmt><suffix>`):
 *   _AdUnit       — AdMob / Google Ad Manager
 *   _Id           — AppLovin
 *   _PlacementID  — Vungle / Meta
 *   _unit         — Mintegral (paired with _placement)
 *   _placement    — Mintegral
 */
export const FLOOR_SUFFIXES = [
  "_AdUnit",
  "_Id",
  "_PlacementID",
  "_unit",
  "_placement",
] as const;

/** Global scalar fields we model explicitly (wire key → friendly key). */
export const GLOBAL_SCALARS: Record<string, string> = {
  admob_app_id: "admobAppId",
  applovin_app_id: "applovinAppId",
  collectAnalytics: "collectAnalytics",
  trackerCollect: "trackerCollect",
  privacyPref: "privacyPref",
  consentPlatform: "consentPlatform",
  banner_refresh: "bannerRefresh",
  appPublisherName: "appPublisherName",
  appPublisherId: "appPublisherId",
  allow_endless: "allowEndless",
  cancelNetLevel: "cancelNetLevel",
};

/** Inverse of GLOBAL_SCALARS (friendly key → wire key). */
export const GLOBAL_SCALARS_INV: Record<string, string> = Object.fromEntries(
  Object.entries(GLOBAL_SCALARS).map(([wire, friendly]) => [friendly, wire]),
);

export const MIN_BANNER_REFRESH_SEC = 5;
