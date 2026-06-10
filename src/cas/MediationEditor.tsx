// Embeddable CAS mediation editor — extracted from the cas-configurator
// AppEditor. Controlled {app,onChange}; app selection, Save/Delete, Export and
// the Next.js/API plumbing are intentionally dropped. All `dark:` variants are
// kept so it renders in dark mode under a `.dark` ancestor (onebi is dark-only).

import { useState } from "react";
import {
  AD_FORMATS,
  ECPM_EXCLUDE,
  FORMAT_LABEL,
  type AdFormat,
} from "./lib/cas/constants";
import { CAS_SOURCES, sourceFields, sourceName } from "./lib/cas/networks";
import {
  floorFromLabel,
  mediationLane,
  providerKind,
  unitFor,
  type MediationLane,
} from "./lib/cas/provider";
import {
  addAbGroup,
  addCountry,
  addProvider,
  fillFloorsFromLabels,
  removeAbGroup,
  removeCountry,
  removeProvider,
  setGroup,
} from "./lib/cas/mutate";
import type { AppConfig, CountryConfig, Provider } from "./lib/cas/types";
import { Badge, Button, Field, Section, TextInput } from "./components/ui";

type Tab = "mediation" | "global";
const TABS: { id: Tab; label: string }[] = [
  { id: "mediation", label: "Mediation" },
  { id: "global", label: "Global" },
];

export function MediationEditor({
  app,
  onChange,
}: {
  app: AppConfig;
  onChange: (a: AppConfig) => void;
}) {
  const [tab, setTab] = useState<Tab>("mediation");

  const isos = Object.keys(app.countries).sort();
  const biddingCount = app.global.providers.filter(
    (p) => providerKind(p) === "bidding",
  ).length;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold">
            {app.appName ?? app.bundle} <Badge>{app.platform}</Badge>
          </h1>
          <p className="text-sm text-neutral-500">
            <span className="font-mono">{app.bundle}</span> ·{" "}
            {app.global.providers.length} providers ({biddingCount} bidding) ·{" "}
            {isos.length} countries
          </p>
        </div>
      </header>

      <nav className="flex gap-1 border-b border-neutral-200 dark:border-neutral-800">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition ${
              tab === t.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === "mediation" && <MediationTab app={app} onChange={onChange} />}
      {tab === "global" && <GlobalTab app={app} onChange={onChange} />}
    </div>
  );
}

// ───────────────────────────── Mediation ─────────────────────────────

function MediationTab({ app, onChange }: { app: AppConfig; onChange: (a: AppConfig) => void }) {
  const isos = Object.keys(app.countries).sort();
  const [iso, setIso] = useState<string>(isos[0] ?? "");
  const [groupIdx, setGroupIdx] = useState(0);
  const [addingLane, setAddingLane] = useState<MediationLane | null>(null);

  const groups = app.countries[iso];
  const gi = groups && groupIdx < groups.length ? groupIdx : 0;
  const group = groups?.[gi];

  const formats = group
    ? AD_FORMATS.filter((f) => Array.isArray(group.ecpm[f]))
    : [];

  function patchGroup(next: CountryConfig) {
    onChange(setGroup(app, iso, gi, next));
  }

  function setEcpm(fmt: AdFormat, index: number, value: number) {
    const arr = (group!.ecpm[fmt] ?? []).slice();
    arr[index] = value;
    // Drop the preserved order so it's recomputed from the new eCPM on save.
    const order = group!.order ? { ...group!.order, [fmt]: undefined } : undefined;
    patchGroup({ ...group!, ecpm: { ...group!.ecpm, [fmt]: arr }, order });
  }

  function togglePriority(index: number) {
    const priority = { ...(group!.priority ?? {}) };
    if (priority[String(index)] != null) delete priority[String(index)];
    else priority[String(index)] = 1;
    patchGroup({ ...group!, priority });
  }

  function fillLabels() {
    patchGroup(fillFloorsFromLabels(group!, app.global.providers, formats, false));
  }

  function onAddCountry() {
    const code = window.prompt("New country ISO2 code (e.g. PL):")?.trim();
    if (!code) return;
    if (!/^[A-Za-z]{2}$/.test(code)) {
      window.alert("Country code must be 2 letters, e.g. PL.");
      return;
    }
    const next = addCountry(app, code);
    onChange(next);
    setIso(code.toUpperCase());
    setGroupIdx(0);
  }

  function onRemoveCountry() {
    if (!iso) return;
    if (!confirm(`Remove country ${iso}?`)) return;
    const next = removeCountry(app, iso);
    onChange(next);
    const rest = Object.keys(next.countries).sort();
    setIso(rest[0] ?? "");
    setGroupIdx(0);
  }

  function onAddGroup() {
    onChange(addAbGroup(app, iso));
    setGroupIdx((groups?.length ?? 1));
  }

  function onRemoveGroup(index: number) {
    onChange(removeAbGroup(app, iso, index));
    setGroupIdx(0);
  }

  function onRemoveLine(index: number) {
    const p = app.global.providers[index];
    if (!confirm(`Remove line #${index} ${p.net}${p.label ? ` ${p.label}` : ""} from all countries?`)) return;
    onChange(removeProvider(app, index));
  }

  return (
    <Section
      title="Mediation"
      description="eCPM floor per provider × format, per country & A/B group. -1 (blank) excludes the provider. Floor labels (e.g. ra10.30) are decoded as the suggested price. Waterfall order is derived on save."
      action={
        <Button variant="secondary" onClick={onAddCountry}>
          ＋ Country
        </Button>
      }
    >
      {addingLane && (
        <AddLineForm
          lane={addingLane}
          existing={app.global.providers}
          onAdd={(p, floor) => {
            onChange(addProvider(app, p, floor));
            setAddingLane(null);
          }}
          onCancel={() => setAddingLane(null)}
        />
      )}

      {/* Country pills */}
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        {isos.map((c) => (
          <button
            key={c}
            onClick={() => {
              setIso(c);
              setGroupIdx(0);
            }}
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              c === iso
                ? "bg-blue-600 text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300"
            }`}
          >
            {c}
            {app.countries[c].length > 1 && (
              <span className="ml-1 text-xs opacity-70">×{app.countries[c].length}</span>
            )}
          </button>
        ))}
        {isos.length === 0 && (
          <p className="text-sm text-neutral-400">No countries yet — add one.</p>
        )}
      </div>

      {!group ? (
        <p className="text-sm text-neutral-400">No country selected.</p>
      ) : (
        <>
          {/* A/B group bar */}
          <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-2 dark:border-neutral-800 dark:bg-neutral-950/40">
            {groups!.length > 1 &&
              groups!.map((g, i) => (
                <button
                  key={i}
                  onClick={() => setGroupIdx(i)}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    i === gi
                      ? "bg-violet-600 text-white"
                      : "bg-white text-neutral-600 hover:bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-300"
                  }`}
                >
                  {g.waterfallName ?? `Group ${String.fromCharCode(65 + i)}`} · {g.abTestWeight ?? 0}%
                </button>
              ))}
            <Button variant="ghost" onClick={onAddGroup}>
              ＋ A/B group
            </Button>
            {groups!.length > 1 && (
              <Button variant="ghost" onClick={() => onRemoveGroup(gi)}>
                ✕ Remove group
              </Button>
            )}
            <div className="ml-auto flex items-center gap-2">
              <Button variant="secondary" onClick={fillLabels}>
                Fill floors from labels
              </Button>
              <Button variant="ghost" onClick={onRemoveCountry}>
                Delete {iso}
              </Button>
            </div>
          </div>

          {/* A/B group meta editor */}
          {groups!.length > 1 && (
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Waterfall name">
                <TextInput
                  value={group.waterfallName ?? ""}
                  onChange={(e) => patchGroup({ ...group, waterfallName: e.target.value || undefined })}
                />
              </Field>
              <Field label="A/B weight (%)" hint="Weights across groups should sum to 100.">
                <TextInput
                  type="number"
                  min="0"
                  value={group.abTestWeight ?? 0}
                  onChange={(e) =>
                    patchGroup({ ...group, abTestWeight: Number(e.target.value) })
                  }
                />
              </Field>
            </div>
          )}

          <MediationGrid
            providers={app.global.providers}
            group={group}
            formats={formats}
            onEcpm={setEcpm}
            onTogglePriority={togglePriority}
            onRemoveProvider={onRemoveLine}
            onAddLine={setAddingLane}
          />
        </>
      )}
    </Section>
  );
}

// Visual accent per mediation lane (left border + pill colors).
const LANE_PILL: Record<MediationLane, string> = {
  max: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  "cas-bid": "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  waterfall: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
};
const LANE_BORDER: Record<MediationLane, string> = {
  max: "border-l-2 border-l-violet-400",
  "cas-bid": "border-l-2 border-l-emerald-400",
  waterfall: "border-l-2 border-l-amber-400",
};
const LANE_LABEL: Record<MediationLane, string> = {
  max: "MAX",
  "cas-bid": "CAS",
  waterfall: "CAS",
};

// Parent chain for the nested Core·MAX → CAS collapse logic.
const LANE_PARENT: Record<string, string | null> = {
  core: null,
  max: "core",
  cas: "core",
  "cas-bid": "cas",
  waterfall: "cas",
};

function MediationGrid({
  providers,
  group,
  formats,
  onEcpm,
  onTogglePriority,
  onRemoveProvider,
  onAddLine,
}: {
  providers: Provider[];
  group: CountryConfig;
  formats: AdFormat[];
  onEcpm: (fmt: AdFormat, index: number, value: number) => void;
  onTogglePriority: (index: number) => void;
  onRemoveProvider: (index: number) => void;
  onAddLine: (lane: MediationLane) => void;
}) {
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const [fmt, setFmt] = useState<AdFormat>(formats[0] ?? "inter");
  // Keep the selected format valid as the country/group changes.
  const activeFmt = formats.includes(fmt) ? fmt : formats[0];

  function toggle(key: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }
  function hidden(key: string) {
    let p = LANE_PARENT[key];
    while (p) {
      if (collapsed.has(p)) return true;
      p = LANE_PARENT[p];
    }
    return false;
  }

  // Partition provider indexes into lanes (waterfall always sorted by floor desc).
  const lanes: Record<MediationLane, number[]> = { max: [], "cas-bid": [], waterfall: [] };
  providers.forEach((p, i) => lanes[mediationLane(p)].push(i));
  lanes.waterfall.sort(
    (a, b) =>
      ((floorFromLabel(providers[b].label) ?? -Infinity) -
        (floorFromLabel(providers[a].label) ?? -Infinity)) || a - b,
  );

  const colSpan = 5; // # + Source + 1 format + Prio + ✕
  const casCount = lanes["cas-bid"].length + lanes.waterfall.length;

  if (!activeFmt) return <p className="text-sm text-neutral-400">This group prices no formats.</p>;

  function row(i: number) {
    const p = providers[i];
    const lane = mediationLane(p);
    const prio = group.priority?.[String(i)] != null;
    const labelFloor = floorFromLabel(p.label);
    const depth = lane === "max" ? 1 : 2;
    const serves = unitFor(p, activeFmt) != null;
    const v = group.ecpm[activeFmt]?.[i] ?? ECPM_EXCLUDE;
    return (
      <tr key={i} className={`border-b border-neutral-100 dark:border-neutral-900 ${LANE_BORDER[lane]}`}>
        <td className="py-1.5 pr-2 font-mono text-xs text-neutral-400">{i}</td>
        <td className="py-1.5 pr-3" style={{ paddingLeft: depth * 14 }}>
          <span className="font-medium">{p.net}</span>
          {p.label && <span className="ml-1 text-xs text-neutral-400">{p.label}</span>}
          <span className="ml-1 text-xs text-neutral-300 dark:text-neutral-600" title={sourceName(p.id, p.net)}>
            #{p.id}
          </span>
          {lane === "waterfall" && labelFloor != null && (
            <span className="ml-1 text-xs text-amber-600 dark:text-amber-400" title="Floor decoded from label">
              ${labelFloor}
            </span>
          )}
        </td>
        <td className="py-1.5 pr-3">
          {serves ? (
            <EcpmCell
              value={v}
              disabled={false}
              suggestion={lane === "waterfall" ? labelFloor : null}
              onChange={(nv) => onEcpm(activeFmt, i, nv)}
            />
          ) : lane === "waterfall" ? (
            // Waterfall line that doesn't serve this format: show its decoded
            // floor (the tier price) instead of "n/a".
            <span className="text-xs text-amber-600/70 dark:text-amber-400/60">
              {labelFloor != null ? labelFloor : "—"}
            </span>
          ) : (
            <span className="text-xs text-neutral-300 dark:text-neutral-700">—</span>
          )}
        </td>
        <td className="py-1.5 pr-3">
          <input type="checkbox" checked={prio} onChange={() => onTogglePriority(i)} title="Priority" />
        </td>
        <td className="py-1.5">
          <button
            type="button"
            onClick={() => onRemoveProvider(i)}
            title="Remove this line from all countries"
            className="text-xs text-red-500 hover:underline"
          >
            ✕
          </button>
        </td>
      </tr>
    );
  }

  function header(key: string, label: string, depth: number, count: number, lane?: MediationLane) {
    const isOpen = !collapsed.has(key);
    const bg =
      depth === 0
        ? "bg-neutral-100 dark:bg-neutral-800/70"
        : depth === 1
          ? "bg-neutral-50 dark:bg-neutral-900/60"
          : "bg-transparent";
    return (
      <tr key={`h-${key}`} className={`${bg} border-b border-neutral-200 dark:border-neutral-800`}>
        <td colSpan={colSpan} className="py-2 pr-3">
          <div className="flex w-full items-center gap-2" style={{ paddingLeft: depth * 14 }}>
            <button type="button" onClick={() => toggle(key)} className="flex items-center gap-2 text-left">
              <span className="w-3 text-neutral-400">{isOpen ? "▼" : "▶"}</span>
              {lane && (
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${LANE_PILL[lane]}`}>
                  {LANE_LABEL[lane]}
                </span>
              )}
              <span className={depth === 0 ? "text-sm font-bold" : "text-sm font-semibold"}>{label}</span>
              <span className="text-xs font-normal text-neutral-400">· {count} lines</span>
            </button>
            {lane && (
              <button
                type="button"
                onClick={() => onAddLine(lane)}
                title={`Add a ${LANE_LABEL[lane]} ${lane === "waterfall" ? "waterfall floor" : "bidding"} line`}
                className="ml-1 rounded px-1.5 py-0.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
              >
                ＋
              </button>
            )}
          </div>
        </td>
      </tr>
    );
  }

  return (
    <div>
      {/* Format selector — view & edit one format at a time. */}
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-xs uppercase text-neutral-400">Format</span>
        {formats.map((f) => (
          <button
            key={f}
            onClick={() => setFmt(f)}
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              f === activeFmt
                ? "bg-neutral-800 text-white dark:bg-neutral-200 dark:text-neutral-900"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300"
            }`}
          >
            {FORMAT_LABEL[f]}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-left text-xs uppercase text-neutral-400 dark:border-neutral-800">
              <th className="py-2 pr-2">#</th>
              <th className="py-2 pr-3">Source · floor</th>
              <th className="py-2 pr-3">{FORMAT_LABEL[activeFmt]} eCPM</th>
              <th className="py-2 pr-3">Prio</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {header("core", "Core · MAX (AppLovin)", 0, providers.length)}

            {!hidden("max") && lanes.max.length > 0 && header("max", "MAX bidding", 1, lanes.max.length, "max")}
            {!hidden("max") && !collapsed.has("max") && lanes.max.map(row)}

            {!hidden("cas") && casCount > 0 && header("cas", "CAS · mini-Core", 1, casCount)}

            {!hidden("cas-bid") && lanes["cas-bid"].length > 0 &&
              header("cas-bid", "CAS bidding", 2, lanes["cas-bid"].length, "cas-bid")}
            {!hidden("cas-bid") && !collapsed.has("cas-bid") && lanes["cas-bid"].map(row)}

            {!hidden("waterfall") && lanes.waterfall.length > 0 &&
              header("waterfall", "Waterfall ↓ price", 2, lanes.waterfall.length, "waterfall")}
            {!hidden("waterfall") && !collapsed.has("waterfall") && lanes.waterfall.map(row)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EcpmCell({
  value,
  disabled,
  suggestion,
  onChange,
}: {
  value: number;
  disabled: boolean;
  suggestion: number | null;
  onChange: (v: number) => void;
}) {
  const excluded = value === ECPM_EXCLUDE;
  const placeholder = disabled
    ? "n/a"
    : suggestion != null
      ? String(suggestion)
      : "—";
  return (
    <div className="flex items-center gap-1">
      <input
        type="number"
        step="0.01"
        min="0"
        disabled={disabled}
        value={excluded ? "" : value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value === "" ? ECPM_EXCLUDE : Number(e.target.value))}
        className="w-20 rounded border border-neutral-300 bg-white px-1.5 py-0.5 text-sm disabled:bg-neutral-50 disabled:text-neutral-300 dark:border-neutral-700 dark:bg-neutral-950 dark:disabled:bg-neutral-900"
      />
      {!disabled && excluded && suggestion != null && (
        <button
          type="button"
          title={`Use label floor ${suggestion}`}
          onClick={() => onChange(suggestion)}
          className="text-xs text-blue-500 hover:underline"
        >
          {suggestion}
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────── Global ───────────────────────────────

const SCALAR_FIELDS: { key: string; label: string; numeric?: boolean }[] = [
  { key: "admobAppId", label: "AdMob App ID" },
  { key: "applovinAppId", label: "AppLovin App ID" },
  { key: "appPublisherName", label: "Publisher" },
  { key: "appPublisherId", label: "Publisher ID" },
  { key: "bannerRefresh", label: "Banner refresh (s)", numeric: true },
  { key: "privacyPref", label: "privacyPref", numeric: true },
  { key: "consentPlatform", label: "consentPlatform", numeric: true },
  { key: "collectAnalytics", label: "collectAnalytics", numeric: true },
  { key: "trackerCollect", label: "trackerCollect", numeric: true },
];

function GlobalTab({ app, onChange }: { app: AppConfig; onChange: (a: AppConfig) => void }) {
  const g = app.global as unknown as Record<string, unknown>;
  const [adding, setAdding] = useState(false);

  function setField(key: string, value: string, numeric?: boolean) {
    const v = value === "" ? undefined : numeric ? Number(value) : value;
    onChange({ ...app, global: { ...app.global, [key]: v } });
  }

  function onRemoveProvider(index: number) {
    const p = app.global.providers[index];
    if (!confirm(`Remove line #${index} ${p.net}${p.label ? ` ${p.label}` : ""}?`)) return;
    onChange(removeProvider(app, index));
  }

  return (
    <>
      <Section title="Global configuration" description="App-level scalars.">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {SCALAR_FIELDS.map((f) => (
            <Field key={f.key} label={f.label}>
              <TextInput
                value={(g[f.key] as string | number | undefined) ?? ""}
                onChange={(e) => setField(f.key, e.target.value, f.numeric)}
              />
            </Field>
          ))}
        </div>
      </Section>

      <Section
        title={`Lines / providers (${app.global.providers.length})`}
        description="Ad sources in order. Kind & units are read from each settings blob. Floor labels decode to a suggested price."
        action={
          <Button variant="secondary" onClick={() => setAdding((v) => !v)}>
            {adding ? "Cancel" : "＋ Add line"}
          </Button>
        }
      >
        {adding && (
          <AddLineForm
            existing={app.global.providers}
            onAdd={(p, floor) => {
              onChange(addProvider(app, p, floor));
              setAdding(false);
            }}
            onCancel={() => setAdding(false)}
          />
        )}
        <div className="max-h-[32rem] overflow-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs uppercase text-neutral-400 dark:border-neutral-800">
                <th className="py-2 pr-2">#</th>
                <th className="py-2 pr-3">Net</th>
                <th className="py-2 pr-3">Label</th>
                <th className="py-2 pr-3">id</th>
                <th className="py-2 pr-3">Kind</th>
                <th className="py-2 pr-3">Floor</th>
                <th className="py-2 pr-3">Formats</th>
                <th className="py-2 pr-3"></th>
              </tr>
            </thead>
            <tbody>
              {app.global.providers.map((p, i) => {
                const kind = providerKind(p);
                const floor = kind === "floor" ? floorFromLabel(p.label) : null;
                return (
                  <tr key={i} className="border-b border-neutral-100 dark:border-neutral-900">
                    <td className="py-1.5 pr-2 font-mono text-xs text-neutral-400">{i}</td>
                    <td className="py-1.5 pr-3 font-medium">{p.net}</td>
                    <td className="py-1.5 pr-3 text-neutral-500">{p.label}</td>
                    <td className="py-1.5 pr-3 font-mono text-xs">{p.id}</td>
                    <td className="py-1.5 pr-3">{kind}</td>
                    <td className="py-1.5 pr-3 text-xs text-neutral-500">
                      {floor != null ? floor : ""}
                    </td>
                    <td className="py-1.5 pr-3 text-xs text-neutral-500">
                      {AD_FORMATS.filter((f) => unitFor(p, f)).map((f) => FORMAT_LABEL[f]).join(", ")}
                    </td>
                    <td className="py-1.5 pr-3">
                      <button
                        type="button"
                        onClick={() => onRemoveProvider(i)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  );
}

const selectClass =
  "w-full rounded-md border border-neutral-300 bg-white px-2.5 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-950";

const SORTED_SOURCES = [...CAS_SOURCES].sort((a, b) => a.name.localeCompare(b.name));
const CUSTOM = "__custom__";

type Mediation = "none" | "max" | "cas";
type Kind = "bidding" | "floor";
interface KV {
  key: string;
  value: string;
}

// Default kind + mediation for a line added from a given lane (just defaults —
// the user can still change everything).
function laneDefaults(lane?: MediationLane): { kind: Kind; mediation: Mediation } {
  if (lane === "max") return { kind: "bidding", mediation: "max" };
  if (lane === "cas-bid") return { kind: "bidding", mediation: "cas" };
  if (lane === "waterfall") return { kind: "floor", mediation: "none" };
  return { kind: "floor", mediation: "none" };
}

// Common settings keys offered as quick-add chips, per kind.
const QUICK_KEYS: Record<Kind, string[]> = {
  bidding: ["inter_rtb", "reward_rtb", "banner_rtb", "appopen_rtb", "appId", "AccountID", "ApplicationID", "apiKey", "signature"],
  floor: ["inter_AdUnit", "reward_AdUnit", "inter_Id", "reward_Id", "inter_PlacementID", "reward_PlacementID", "inter_unit", "inter_placement", "reward_unit", "reward_placement", "appId", "apiKey", "AccountID", "ApplicationID"],
};

const GENERIC_KEYS: Record<Kind, string[]> = {
  bidding: ["inter_rtb", "reward_rtb"],
  floor: ["inter_AdUnit", "reward_AdUnit"],
};

// App/account-level credentials — identical across all placements of a network,
// so they're auto-filled from an existing line of the same source. Everything
// else (the `<fmt>_*` unit ids) is placement-specific and stays empty.
const SHARED_KEYS = new Set([
  "appId",
  "apiKey",
  "AccountID",
  "ApplicationID",
  "AppID",
  "GameID",
  "AssetKey",
  "Token",
  "signature",
]);

/** Shared credential values pulled from an existing line of the same source. */
function sharedValues(id: number, existing: Provider[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const p of existing) {
    if (p.id !== id) continue;
    for (const [k, v] of Object.entries(p.settings)) {
      if (SHARED_KEYS.has(k) && out[k] == null) out[k] = String(v);
    }
  }
  return out;
}

/**
 * Settings rows seeded from a source's known field template for the given kind.
 * Shared credentials (appId, apiKey, …) are pre-filled from an existing line of
 * the same network; values the user already typed win; custom rows are kept.
 */
function seedRows(id: number, kind: Kind, prev: KV[], existing: Provider[]): KV[] {
  const tpl = sourceFields(id);
  const keys = tpl?.[kind]?.length ? tpl[kind]! : GENERIC_KEYS[kind];
  const shared = sharedValues(id, existing);
  const seeded = keys.map((k) => ({
    key: k,
    value: prev.find((r) => r.key === k)?.value || shared[k] || "",
  }));
  const extra = prev.filter((r) => r.key.trim() && !keys.includes(r.key));
  return [...seeded, ...extra];
}

function AddLineForm({
  onAdd,
  onCancel,
  lane,
  existing,
}: {
  onAdd: (p: Provider, floor?: number) => void;
  onCancel: () => void;
  /** Sets initial kind/mediation defaults; the user can still change them. */
  lane?: MediationLane;
  /** Existing lines, used to auto-fill shared credentials of the same network. */
  existing: Provider[];
}) {
  const init = laneDefaults(lane);
  const initialSourceId = SORTED_SOURCES[0]?.id ?? 0;
  const [source, setSource] = useState<string>(String(SORTED_SOURCES[0]?.id ?? CUSTOM));
  const [customNet, setCustomNet] = useState("");
  const [customId, setCustomId] = useState("");
  const [label, setLabel] = useState("");
  const [kind, setKind] = useState<Kind>(init.kind);
  const [mediation, setMediation] = useState<Mediation>(init.mediation);
  const [floor, setFloor] = useState("");
  const [rows, setRows] = useState<KV[]>(() => seedRows(initialSourceId, init.kind, [], existing));

  const isCustom = source === CUSTOM;
  const picked = isCustom ? null : CAS_SOURCES.find((s) => String(s.id) === source);

  // Picking a catalog network sets its default kind/mediation and auto-fills its
  // known settings keys — shared credentials from an existing same-network line.
  function pickSource(value: string) {
    setSource(value);
    if (value === CUSTOM) return;
    const s = CAS_SOURCES.find((x) => String(x.id) === value);
    if (!s) return;
    const newKind: Kind = s.bidding ? "bidding" : "floor";
    const tpl = sourceFields(s.id);
    setKind(newKind);
    setMediation(newKind === "bidding" ? (tpl?.bidMediation ?? "max") : "none");
    setRows((prev) => seedRows(s.id, newKind, prev, existing));
  }

  // Switching kind re-seeds the template for that kind (keeping typed values).
  function changeKind(k: Kind) {
    setKind(k);
    if (isCustom) return;
    const sid = Number(source);
    setMediation(k === "bidding" ? (sourceFields(sid)?.bidMediation ?? "max") : "none");
    setRows((prev) => seedRows(sid, k, prev, existing));
  }

  function setRow(i: number, patch: Partial<KV>) {
    setRows((prev) => prev.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  }
  function addRow(key = "") {
    setRows((prev) => (prev.some((r) => r.key === key && key) ? prev : [...prev, { key, value: "" }]));
  }
  function removeRow(i: number) {
    setRows((prev) => prev.filter((_, j) => j !== i));
  }

  const net = isCustom ? customNet.trim() : (picked?.net ?? "");
  const id = isCustom ? Number(customId) || 0 : (picked?.id ?? 0);
  const filledRows = rows.filter((r) => r.key.trim() && r.value.trim());
  const valid = net.length > 0 && filledRows.length > 0;

  function submit() {
    const settings: Record<string, string | number> = {};
    for (const r of filledRows) settings[r.key.trim()] = r.value.trim();
    if (mediation !== "none") settings.mediation = mediation;
    const provider: Provider = { id, net: net || "Custom", settings };
    if (label.trim()) provider.label = label.trim();
    const floorNum = floor.trim() === "" ? undefined : Number(floor);
    onAdd(provider, Number.isFinite(floorNum) ? floorNum : undefined);
  }

  return (
    <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50/50 p-3 dark:border-blue-900 dark:bg-blue-950/20">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Field label="Provider">
          <select value={source} onChange={(e) => pickSource(e.target.value)} className={selectClass}>
            {SORTED_SOURCES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} (#{s.id}){s.bidding ? " · bidding" : ""}
              </option>
            ))}
            <option value={CUSTOM}>Custom…</option>
          </select>
        </Field>
        <Field label="Kind">
          <select value={kind} onChange={(e) => changeKind(e.target.value as Kind)} className={selectClass}>
            <option value="floor">floor (waterfall)</option>
            <option value="bidding">bidding (RTB)</option>
          </select>
        </Field>
        <Field label="Mediation">
          <select
            value={mediation}
            onChange={(e) => setMediation(e.target.value as Mediation)}
            className={selectClass}
          >
            <option value="none">none (CAS core)</option>
            <option value="max">max (AppLovin)</option>
            <option value="cas">cas (CAS bidding)</option>
          </select>
        </Field>
        <Field label="Label" hint={kind === "floor" ? "Floor decodes from this, e.g. ra10.30" : "e.g. CasBid"}>
          <TextInput
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder={kind === "floor" ? "x2.50" : "CasBid"}
          />
        </Field>
        <Field label="Floor eCPM" hint="Optional — applied to all countries for served formats">
          <TextInput type="number" step="0.01" value={floor} onChange={(e) => setFloor(e.target.value)} placeholder="5.00" />
        </Field>
        {isCustom ? (
          <div className="grid grid-cols-2 gap-2">
            <Field label="net">
              <TextInput value={customNet} onChange={(e) => setCustomNet(e.target.value)} placeholder="AdMob" />
            </Field>
            <Field label="id">
              <TextInput type="number" value={customId} onChange={(e) => setCustomId(e.target.value)} placeholder="2" />
            </Field>
          </div>
        ) : (
          <Field label="Source">
            <div className="px-1 py-1.5 text-sm text-neutral-500">{picked?.net} · #{picked?.id}</div>
          </Field>
        )}
      </div>

      {/* Network settings — arbitrary key/value pairs (Mintegral etc. need many). */}
      <div className="mt-3">
        <div className="mb-1 flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-medium text-neutral-500">Settings (network-specific)</span>
          {QUICK_KEYS[kind].map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => addRow(k)}
              className="rounded bg-neutral-200 px-1.5 py-0.5 text-[11px] font-mono text-neutral-600 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-300"
            >
              ＋{k}
            </button>
          ))}
        </div>
        <div className="space-y-1.5">
          {rows.map((r, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={r.key}
                onChange={(e) => setRow(i, { key: e.target.value })}
                placeholder="key (e.g. inter_unit)"
                className="w-1/3 rounded border border-neutral-300 bg-white px-2 py-1 font-mono text-xs dark:border-neutral-700 dark:bg-neutral-950"
              />
              <input
                value={r.value}
                onChange={(e) => setRow(i, { value: e.target.value })}
                placeholder="value"
                className="flex-1 rounded border border-neutral-300 bg-white px-2 py-1 text-xs dark:border-neutral-700 dark:bg-neutral-950"
              />
              <button type="button" onClick={() => removeRow(i)} className="text-xs text-red-500 hover:underline">
                ✕
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => addRow()} className="mt-1.5 text-xs text-blue-600 hover:underline">
          ＋ Add field
        </button>
      </div>

      <div className="mt-3 flex items-center justify-end gap-2">
        {!valid && (
          <span className="mr-auto text-xs text-neutral-400">
            Pick a provider and add at least one settings key/value.
          </span>
        )}
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={submit} disabled={!valid}>
          Add line
        </Button>
      </div>
    </div>
  );
}
