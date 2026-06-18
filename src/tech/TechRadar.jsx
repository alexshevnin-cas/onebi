import React, { useMemo, useState } from 'react';
import { radarData } from './radarData.js';

// ---- Geometry & style config (ported from demo_tech_radar/radar.js) --------
const SIZE = 900;
const CX = SIZE / 2;
const CY = SIZE / 2;
const MAX_R = SIZE / 2 - 24;
const RING_OUTER = [0.30, 0.55, 0.78, 1.0].map((f) => f * MAX_R); // Adopt..Hold

// Quadrant angular ranges, in degrees. 0deg = +x axis, CCW positive (y up).
const QUADRANT_ANGLES = {
  0: [0, 90],     // top-right
  1: [270, 360],  // bottom-right
  2: [180, 270],  // bottom-left
  3: [90, 180],   // top-left
};

// Bright, distinguishable hues that read well on the dark slate theme.
const QUADRANT_COLORS = ['#3b9eff', '#fb7185', '#2dd4bf', '#fbbf24'];
// Ring fills: subtle slate bands, Adopt (innermost) slightly brighter.
const RING_FILL = ['#1e293b', '#1a2334', '#16202e', '#131a26'];
const RING_STROKE = '#334155';
const GRID_LINE = '#334155';

// ---- Deterministic pseudo-random placement (stable across reloads) ---------
function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const deg2rad = (d) => (d * Math.PI) / 180;

function placeBlip(entry) {
  const rng = mulberry32(hashString(entry.name + entry.quadrant + entry.ring));
  const [a0, a1] = QUADRANT_ANGLES[entry.quadrant];
  const rInner = entry.ring === 0 ? 0 : RING_OUTER[entry.ring - 1];
  const rOuter = RING_OUTER[entry.ring];
  const angPad = (a1 - a0) * 0.07;
  const rPad = (rOuter - rInner) * 0.15 + 6;
  const angle = deg2rad(a0 + angPad + rng() * (a1 - a0 - 2 * angPad));
  const radius = rInner + rPad + rng() * (rOuter - rInner - 2 * rPad);
  return { x: CX + radius * Math.cos(angle), y: CY - radius * Math.sin(angle) };
}

function clampToSegment(blip) {
  const [a0, a1] = QUADRANT_ANGLES[blip.quadrant];
  const rInner = blip.ring === 0 ? 0 : RING_OUTER[blip.ring - 1];
  const rOuter = RING_OUTER[blip.ring];
  const dx = blip.x - CX, dy = CY - blip.y;
  let r = Math.hypot(dx, dy) || 0.01;
  let ang = (Math.atan2(dy, dx) * 180) / Math.PI;
  if (ang < 0) ang += 360;
  const pad = 7;
  r = Math.min(rOuter - pad, Math.max(rInner + pad, r));
  const angPad = (a1 - a0) * 0.06;
  ang = Math.min(a1 - angPad, Math.max(a0 + angPad, ang));
  const rad = deg2rad(ang);
  blip.x = CX + r * Math.cos(rad);
  blip.y = CY - r * Math.sin(rad);
}

// Push apart blips that overlap, while keeping them in their ring band.
function relax(blips) {
  const MIN = 22;
  for (let iter = 0; iter < 80; iter++) {
    let moved = false;
    for (let i = 0; i < blips.length; i++) {
      for (let j = i + 1; j < blips.length; j++) {
        const a = blips[i], b = blips[j];
        const dx = b.x - a.x, dy = b.y - a.y;
        const dist = Math.hypot(dx, dy) || 0.01;
        if (dist < MIN) {
          const push = (MIN - dist) / 2;
          const ux = dx / dist, uy = dy / dist;
          a.x -= ux * push; a.y -= uy * push;
          b.x += ux * push; b.y += uy * push;
          clampToSegment(a); clampToSegment(b);
          moved = true;
        }
      }
    }
    if (!moved) break;
  }
}

// Resolve each technology into a single blip for the current team selection.
function resolveEntries(selectedTeam) {
  const out = [];
  radarData.entries.forEach((e) => {
    const placements = e.placements || {};
    const teamIds = Object.keys(placements);
    if (!teamIds.length) return;
    const rings = teamIds.map((t) => placements[t].ring);
    const varies = new Set(rings).size > 1;

    if (selectedTeam === 'all') {
      const bestTeam = teamIds.reduce((a, b) =>
        placements[b].ring < placements[a].ring ? b : a
      );
      out.push({
        name: e.name, quadrant: e.quadrant, description: e.description || '',
        ring: placements[bestTeam].ring, status: 'default',
        teamIds, placements, varies,
      });
    } else {
      const p = placements[selectedTeam];
      if (!p) return;
      out.push({
        name: e.name, quadrant: e.quadrant, description: e.description || '',
        ring: p.ring, status: p.status || 'default', note: p.note || '',
        teamIds: [selectedTeam], placements, varies: false,
      });
    }
  });
  return out;
}

function computeBlips(selectedTeam) {
  const entries = resolveEntries(selectedTeam);
  // stable numbering: by quadrant, then ring, then name
  entries.sort((a, b) =>
    a.quadrant - b.quadrant || a.ring - b.ring || a.name.localeCompare(b.name)
  );
  // place + relax per quadrant (relax within quadrant only)
  entries.forEach((e) => Object.assign(e, placeBlip(e)));
  for (let q = 0; q < 4; q++) relax(entries.filter((e) => e.quadrant === q));
  entries.forEach((e, i) => (e.num = i + 1));
  return entries;
}

const teamLabel = (id) => (radarData.teams.find((t) => t.id === id) || {}).label || id;

// Corner anchors for the four quadrant titles.
const CORNERS = [
  { x: CX + MAX_R, y: CY - MAX_R + 4, anchor: 'end' },   // Q0 top-right
  { x: CX + MAX_R, y: CY + MAX_R, anchor: 'end' },        // Q1 bottom-right
  { x: CX - MAX_R, y: CY + MAX_R, anchor: 'start' },      // Q2 bottom-left
  { x: CX - MAX_R, y: CY - MAX_R + 4, anchor: 'start' },  // Q3 top-left
];

function Blip({ d, active, onEnter, onMove, onLeave }) {
  const color = QUADRANT_COLORS[d.quadrant];
  let shape;
  if (d.status === 'new') {
    shape = <path d="M0,-11 L10,8 L-10,8 Z" fill={color} />;
  } else if (d.status === 'moved-out') {
    shape = <rect x={-9} y={-9} width={18} height={18} rx={3} fill={color} />;
  } else {
    shape = <circle r={10} fill={color} />;
  }
  return (
    <g
      transform={`translate(${d.x},${d.y})`}
      style={{ cursor: 'pointer' }}
      onMouseEnter={(e) => onEnter(d, e)}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {active && (
        d.status === 'moved-out'
          ? <rect x={-12} y={-12} width={24} height={24} rx={5} fill="none" stroke="#fff" strokeWidth={2} style={{ filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.55))' }} />
          : <circle r={d.status === 'new' ? 15 : 13} fill="none" stroke="#fff" strokeWidth={2} style={{ filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.55))' }} />
      )}
      {shape}
      <text textAnchor="middle" dy="0.35em" fontSize={11} fontWeight={700} fill="#0b1220" style={{ pointerEvents: 'none', userSelect: 'none' }}>{d.num}</text>
    </g>
  );
}

export function TechRadar() {
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [activeNum, setActiveNum] = useState(null);
  const [tip, setTip] = useState(null); // { d, x, y }

  const blips = useMemo(() => computeBlips(selectedTeam), [selectedTeam]);

  const showTip = (d, e) => {
    setActiveNum(d.num);
    setTip({ d, x: e.clientX, y: e.clientY });
  };
  const moveTip = (e) => setTip((t) => (t ? { ...t, x: e.clientX, y: e.clientY } : t));
  const hideTip = () => { setActiveNum(null); setTip(null); };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div>
          <span className="text-sm font-semibold text-slate-100 leading-tight tracking-tight">Tech Radar</span>
          <span className="text-[10px] text-slate-500 ml-2">{blips.length} blip{blips.length === 1 ? '' : 's'} · {radarData.teams.length} teams</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-500">Team</span>
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500/50"
          >
            <option value="all">All teams</option>
            {radarData.teams.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>
      </div>

      {/* Quadrant legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-4">
        {radarData.quadrants.map((q, i) => (
          <span key={q} className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <i className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: QUADRANT_COLORS[i] }} />
            {q}
          </span>
        ))}
      </div>

      {/* Radar + side panel */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* Radar */}
        <div className="flex-1 min-w-0 w-full bg-slate-800/30 border border-slate-800 rounded-xl p-3">
          <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full h-auto max-w-[640px] mx-auto block">
            {/* rings (outer-first so inner sits on top) */}
            {RING_OUTER.map((r, i) => RING_OUTER.length - 1 - i).map((i) => (
              <circle key={`ring-${i}`} cx={CX} cy={CY} r={RING_OUTER[i]} fill={RING_FILL[i]} stroke={RING_STROKE} />
            ))}
            {/* quadrant dividers */}
            <line x1={CX} y1={CY - MAX_R} x2={CX} y2={CY + MAX_R} stroke={GRID_LINE} />
            <line x1={CX - MAX_R} y1={CY} x2={CX + MAX_R} y2={CY} stroke={GRID_LINE} />
            {/* ring labels along the top vertical axis */}
            {radarData.rings.map((name, i) => {
              const rOuter = RING_OUTER[i];
              const rInner = i === 0 ? 0 : RING_OUTER[i - 1];
              const y = CY - (rInner + rOuter) / 2;
              return <text key={name} x={CX} y={y} textAnchor="middle" fontSize={12} fontWeight={700} fill="#64748b">{name}</text>;
            })}
            {/* quadrant titles */}
            {radarData.quadrants.map((q, i) => (
              <text key={q} x={CORNERS[i].x} y={CORNERS[i].y} textAnchor={CORNERS[i].anchor} fontSize={15} fontWeight={700} fill={QUADRANT_COLORS[i]}>{q}</text>
            ))}
            {/* blips */}
            {blips.map((d) => (
              <Blip key={d.num} d={d} active={activeNum === d.num} onEnter={showTip} onMove={moveTip} onLeave={hideTip} />
            ))}
          </svg>
        </div>

        {/* Side panel */}
        <div className="w-full lg:w-80 shrink-0 bg-slate-800/30 border border-slate-800 rounded-xl p-3 max-h-[640px] overflow-y-auto">
          {radarData.quadrants.map((q, qi) => {
            const inQuad = blips.filter((e) => e.quadrant === qi);
            if (!inQuad.length) return null;
            return (
              <div key={q} className="mb-3 last:mb-0">
                <h3 className="text-xs font-semibold mb-1.5" style={{ color: QUADRANT_COLORS[qi] }}>{q}</h3>
                {radarData.rings.map((ringName, ri) => {
                  const inRing = inQuad.filter((e) => e.ring === ri);
                  if (!inRing.length) return null;
                  return (
                    <div key={ringName} className="mb-2 last:mb-0">
                      <h4 className="text-[10px] uppercase tracking-wide text-slate-500 mb-1 ml-0.5">{ringName}</h4>
                      <ul className="flex flex-col gap-0.5">
                        {inRing.map((e) => (
                          <li
                            key={e.num}
                            onMouseEnter={(ev) => showTip(e, ev)}
                            onMouseMove={moveTip}
                            onMouseLeave={hideTip}
                            className={`flex items-center gap-2 px-1.5 py-1 rounded cursor-pointer transition-colors ${activeNum === e.num ? 'bg-blue-600/20' : 'hover:bg-slate-800'}`}
                          >
                            <span className="shrink-0 w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center text-slate-900" style={{ background: QUADRANT_COLORS[qi] }}>{e.num}</span>
                            <span className="text-xs text-slate-300 flex-1 truncate">{e.name}</span>
                            {e.status === 'new' && <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-medium shrink-0">new</span>}
                            {e.status === 'moved-out' && <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-400 font-medium shrink-0">moved</span>}
                            {e.varies && <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 font-medium shrink-0">varies</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tooltip */}
      {tip && (() => {
        const d = tip.d;
        const ringLine = selectedTeam === 'all'
          ? (d.varies ? 'Varies by team · ' : radarData.rings[d.ring] + ' · ') + radarData.quadrants[d.quadrant]
          : radarData.rings[d.ring] + ' · ' + radarData.quadrants[d.quadrant];
        const teamRows = selectedTeam === 'all'
          ? d.teamIds.slice().sort((a, b) => d.placements[a].ring - d.placements[b].ring)
              .map((id) => ({ id, label: teamLabel(id), ring: radarData.rings[d.placements[id].ring] }))
          : [{ id: selectedTeam, label: teamLabel(selectedTeam), ring: null }];
        return (
          <div
            className="fixed z-[60] pointer-events-none max-w-xs bg-slate-800 border border-slate-700 rounded-lg shadow-2xl shadow-black/50 px-3 py-2"
            style={{ left: tip.x + 16, top: tip.y + 16 }}
          >
            <div className="text-xs font-semibold text-slate-100">{d.num}. {d.name}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">{ringLine}</div>
            {d.description && <p className="text-[11px] text-slate-300 mt-1.5 leading-snug">{d.description}</p>}
            {d.note && <p className="text-[11px] text-blue-300 mt-1 leading-snug italic">{d.note}</p>}
            <div className="mt-1.5 pt-1.5 border-t border-slate-700/60 flex flex-col gap-0.5">
              {teamRows.map((r) => (
                <div key={r.id} className="text-[10px] text-slate-400 flex items-center justify-between gap-3">
                  <span>{r.label}</span>
                  {r.ring && <span className="text-slate-500">{r.ring}</span>}
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </>
  );
}
