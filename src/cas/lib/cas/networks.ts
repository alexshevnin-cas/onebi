/**
 * Catalog of CAS ad sources, keyed by the real `id` (CAS source code) seen in
 * the live config. The same network *name* can map to several ids — e.g. `net`
 * "AdMob" is id 2 (AdMob direct) but also 41 / 54 / 58 (Google Ad Manager
 * reseller lines). So `id` is the real discriminator, not `net`.
 *
 * Reconciled from real DriveX config (2026-06-03). `bidding` marks sources that
 * appear with `*_rtb` units (in-app bidding) in practice.
 */

export interface CasSource {
  /** CAS source code (provider `id`). */
  id: number;
  /** Canonical network name (provider `net`). */
  net: string;
  /** Display name. */
  name: string;
  /** Seen doing in-app bidding (`*_rtb`). */
  bidding?: boolean;
}

export const CAS_SOURCES: CasSource[] = [
  { id: 2, net: "AdMob", name: "Google AdMob", bidding: true },
  { id: 4, net: "InMobi", name: "InMobi", bidding: true },
  { id: 7, net: "Chartboost", name: "Chartboost", bidding: true },
  { id: 8, net: "Unity", name: "Unity Ads", bidding: true },
  { id: 9, net: "Vungle", name: "Vungle (Liftoff)", bidding: true },
  { id: 10, net: "Facebook", name: "Meta Audience Network", bidding: true },
  { id: 11, net: "Kidoz", name: "Kidoz" },
  { id: 18, net: "IronSource", name: "Unity LevelPlay (ironSource)", bidding: true },
  { id: 19, net: "Yandex", name: "Yandex Ads", bidding: true },
  { id: 28, net: "Mintegral", name: "Mintegral", bidding: true },
  { id: 29, net: "AppLovin", name: "AppLovin" },
  { id: 30, net: "Pangle", name: "Pangle", bidding: true },
  { id: 38, net: "Bigo", name: "BigoAds", bidding: true },
  { id: 41, net: "AdMob", name: "Google Ad Manager (41)" },
  { id: 49, net: "CASExchange", name: "CAS Exchange", bidding: true },
  { id: 50, net: "Ogury", name: "Ogury", bidding: true },
  { id: 52, net: "YsoNetwork", name: "Yso Network", bidding: true },
  { id: 54, net: "AdMob", name: "Google Ad Manager (54)" },
  { id: 57, net: "Prado", name: "Prado" },
  { id: 58, net: "AdMob", name: "Google Ad Manager (58)" },
  { id: 62, net: "Maticoo", name: "Maticoo", bidding: true },
];

/** Known settings keys per source, split by line kind (from real DriveX data). */
export interface SourceFields {
  /** Settings keys for a bidding (RTB / adapter) line. */
  bidding?: string[];
  /** Settings keys for a floor (waterfall) line. */
  floor?: string[];
  /** Default `mediation` tag for a bidding line of this source. */
  bidMediation?: "max" | "cas";
}

/**
 * Per-source field templates so the "Add line" form can auto-fill the known
 * settings keys when you pick a network. Keys only — values are account-specific
 * and stay empty for you to fill. Reconciled from the real DriveX config.
 */
export const SOURCE_FIELDS: Record<number, SourceFields> = {
  2: { bidding: ["inter_rtb", "reward_rtb"], floor: ["inter_AdUnit", "reward_AdUnit"], bidMediation: "max" }, // AdMob
  4: { bidding: ["AccountID", "inter_rtb", "reward_rtb"], bidMediation: "cas" }, // InMobi
  7: { bidding: ["appId", "signature", "inter_rtb", "reward_rtb"], bidMediation: "max" }, // Chartboost
  8: { bidding: ["GameID", "inter_rtb", "reward_rtb"], bidMediation: "max" }, // Unity
  9: {
    bidding: ["ApplicationID", "AccountID", "inter_rtb", "reward_rtb"],
    floor: ["ApplicationID", "AccountID", "inter_PlacementID", "reward_PlacementID"],
    bidMediation: "cas",
  }, // Vungle
  10: { bidding: ["inter_PlacementID", "reward_PlacementID"], bidMediation: "max" }, // Meta
  11: { floor: ["AppID", "Token"] }, // Kidoz
  18: {
    bidding: ["appId", "inter_rtb", "inter_instance_id", "reward_rtb", "reward_instance_id"],
    bidMediation: "max",
  }, // IronSource
  19: { bidding: ["inter_rtb", "reward_rtb"], bidMediation: "max" }, // Yandex
  28: {
    bidding: ["appId", "apiKey", "inter_placement", "inter_unit", "reward_placement", "reward_unit"],
    bidMediation: "cas",
  }, // Mintegral
  29: { floor: ["inter_Id", "reward_Id"] }, // AppLovin
  30: { bidding: ["AppID", "AccountID", "inter_rtb", "reward_rtb"], bidMediation: "cas" }, // Pangle
  38: { bidding: ["appId", "inter_rtb", "reward_rtb"], bidMediation: "cas" }, // Bigo
  41: { floor: ["inter_AdUnit", "reward_AdUnit"] }, // AdMob / GAM
  49: { bidding: ["inter_rtb", "reward_rtb"] }, // CASExchange (no mediation marker)
  50: { bidding: ["AssetKey", "inter_rtb", "reward_rtb"], bidMediation: "max" }, // Ogury
  52: { bidding: ["inter_rtb", "reward_rtb"], bidMediation: "max" }, // YsoNetwork
  54: { floor: ["inter_AdUnit", "reward_AdUnit"] }, // AdMob / GAM
  57: { floor: ["AppID", "Token"] }, // Prado
  58: { floor: ["inter_AdUnit", "reward_AdUnit"] }, // AdMob / GAM
  62: { bidding: ["appId", "inter_rtb", "reward_rtb"], bidMediation: "cas" }, // Maticoo
};

/** Field template for a source, if known. */
export function sourceFields(id: number): SourceFields | undefined {
  return SOURCE_FIELDS[id];
}

const BY_ID = new Map(CAS_SOURCES.map((s) => [s.id, s]));

export function casSource(id: number): CasSource | undefined {
  return BY_ID.get(id);
}

/** Display name for a provider, falling back to its `net` / `id`. */
export function sourceName(id: number, net?: string): string {
  return BY_ID.get(id)?.name ?? net ?? `source ${id}`;
}

/** Whether a source code is known to support in-app bidding. */
export function sourceBids(id: number): boolean {
  return BY_ID.get(id)?.bidding ?? false;
}
