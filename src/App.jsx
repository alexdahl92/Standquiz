import React, { useState, useEffect, useMemo, useRef } from 'react';

// Safe LocalStorage wrapper to handle restricted iframe sandboxes
const safeStorage = {
  getItem: (key) => {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  },
  setItem: (key, val) => {
    try { localStorage.setItem(key, val); } catch (e) { /* ignore */ }
  }
};

const TrophyIcon = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg className={className} fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 21h8m-4-4v4m-5-13a4 4 0 00-4 4v2a4 4 0 004 4h6a4 4 0 004-4v-2a4 4 0 00-4-4m-6 0V3h6v2" />
  </svg>
);

const TimerIcon = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg className={className} fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth="2">
    <circle cx="12" cy="12" r="9" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3M12 3v2" />
  </svg>
);

const CheckIcon = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg className={className} fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const AlertTriangleIcon = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg className={className} fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const MonitorIcon = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg className={className} fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth="2">
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 21h8m-4-4v4" />
  </svg>
);

const ZapIcon = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg className={className} fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth="2">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const BuildingIcon = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg className={className} fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const PlayIcon = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg className={className} fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth="2">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const RefreshIcon = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg className={className} fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const TruckIcon = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg className={className} fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth="2">
    <rect x="1" y="3" width="15" height="13" rx="2" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const XIcon = ({ className = "w-5 h-5", color = "currentColor" }) => (
  <svg className={className} fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const NTFY_TOPIC = 'itb-bygg-stand-quiz-2026-v5';

// ELEKTRO & ITB TASK LIST
const ELEKTRO_SYSTEMS = [
  { id: 'audio', label: 'Talevarsling', isCorrect: true },
  { id: 'transmitter', label: 'Alarmsender', isCorrect: true },
  { id: 'coffee', label: 'Stikkontakter for kaffetrakter', isCorrect: false },
  { id: 'snow_melt', label: 'Utvendig gatevarme', isCorrect: false },
  { id: 'emergency_light', label: 'Nødlys', isCorrect: true },
  { id: 'music', label: 'Musikkanlegg', isCorrect: true },
  { id: 'door_access', label: 'Dør/adgangskontroll', isCorrect: true },
  { id: 'temp_control', label: 'Temperaturregulering', isCorrect: false },
  { id: 'lighting', label: 'Lys', isCorrect: true },
  { id: 'fire_curtain', label: 'Branngardin', isCorrect: true },
  { id: 'vent_unit', label: 'Ventilasjonsaggregat', isCorrect: true },
  { id: 'fire_damper', label: 'Brannspjeld', isCorrect: true },
  { id: 'elevator', label: 'Heis', isCorrect: true },
  { id: 'smoke_vent', label: 'Røykluker', isCorrect: true },
  { id: 'sprinkler', label: 'Sprinkler', isCorrect: false }
];

// BRIDGE STRUCTURAL CHOICES
const BRIDGE_DESIGNS = [
  {
    id: 'flat_beam',
    name: '1. Enkel Bjelkebro',
    desc: 'Bjelke uten fagverk.',
    capacityFactor: 0.35,
    basePoints: 3,
    trussType: 'none'
  },
  {
    id: 'warren_truss',
    name: '2. Warren-fagverk',
    desc: 'Diagonale sik-sak staver.',
    capacityFactor: 0.82,
    basePoints: 7,
    trussType: 'warren'
  },
  {
    id: 'pratt_truss',
    name: '3. Pratt-fagverk',
    desc: 'Vertikaler i trykk, diagonaler i strekk.',
    capacityFactor: 1.0,
    basePoints: 10,
    trussType: 'pratt'
  },
  {
    id: 'under_arch',
    name: '4. Underliggende Bue',
    desc: 'Trykkbue med overføring til landkar.',
    capacityFactor: 0.92,
    basePoints: 9,
    trussType: 'arch'
  }
];

const BRIDGE_MATERIALS = [
  { id: 'steel_s355', name: 'S355 Konstruksjonsstål', capMod: 1.0, weightMod: 1.0, color: '#38bdf8' },
  { id: 'steel_s460', name: 'S460 Høyfast Stål', capMod: 1.3, weightMod: 0.85, color: '#60a5fa' },
  { id: 'concrete_c45', name: 'Armert Betong C45', capMod: 0.85, weightMod: 1.5, color: '#94a3b8' },
  { id: 'timber_gl30', name: 'Limtre GL30c', capMod: 0.65, weightMod: 0.45, color: '#d97706' }
];

const BRIDGE_SUPPORTS = [
  { id: 'simple', name: 'Fritt Opplagt (Ledd/Rull)', capMod: 1.0 },
  { id: 'fixed', name: 'Fast Innspent Landkar', capMod: 1.2 },
  { id: 'pier', name: 'Midtpilar i Gjel', capMod: 1.5 }
];

const BRIDGE_DECKS = [
  { id: 'steel_grate', name: 'Stålgitterdekke (Lett)', capMod: 0.92, weightMod: 0.85 },
  { id: 'composite_slab', name: 'Samvirkedekke Betong (Tungt)', capMod: 1.15, weightMod: 1.25 },
  { id: 'asphalt_steel', name: 'Asfaltert Ståldekke (Standard)', capMod: 1.05, weightMod: 1.05 }
];

const INTRO_TEXTS = {
  elektro: "Velkommen til Elektro- og ITB-oppgaven! Identifiser hvilke tekniske bygningssystemer som skal påvirkes eller reagere ved utløst brannalarm.",
  bygg: "Velkommen til Brobyggings- og Statikkoppgaven! En 24-tonns lastebil skal krysse et 12-meters gjel. Velg bæresystem, materialtype, oppleggsbetingelser, dekketype og profiltykkelse for å sikre at bilen kjører helt over."
};

function BridgeSimulator({
  selectedDesign,
  setSelectedDesign,
  selectedMaterial,
  setSelectedMaterial,
  selectedSupport,
  setSelectedSupport,
  selectedDeck,
  setSelectedDeck,
  profileThickness,
  setProfileThickness,
  includeDiagonals,
  setIncludeDiagonals,
  isTesting,
  testProgress,
  maxStress,
  hasFailed,
  drivenMeters,
  delayCountdown,
  onRunTest
}) {
  const design = BRIDGE_DESIGNS.find(d => d.id === selectedDesign) || BRIDGE_DESIGNS[1];
  const matObj = BRIDGE_MATERIALS.find(m => m.id === selectedMaterial) || BRIDGE_MATERIALS[0];

  const truckX = 60 + (testProgress / 100) * 480;
  const strokeW = Math.max(1.5, (profileThickness / 100) * 7);

  const breakX = Math.max(120, Math.min(480, truckX));
  const truckY = 210 + (hasFailed ? 38 : -22);
  const truckRotation = hasFailed ? 28 : 0;

  return (
    <div className="w-full bg-slate-950 rounded-2xl p-3 border border-amber-500/30 shadow-inner flex flex-col gap-3">
      <div className="relative w-full aspect-[16/9] bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-2xl select-none">
        <svg viewBox="0 0 600 320" className="w-full h-full">
          <defs>
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
            <pattern id="gridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#334155" strokeWidth="0.5" opacity="0.4" />
            </pattern>
          </defs>

          <rect width="600" height="320" fill="url(#skyGrad)" />
          <rect width="600" height="320" fill="url(#gridPattern)" />

          <path d="M 0 280 Q 300 290 600 280 L 600 320 L 0 320 Z" fill="#0284c7" opacity="0.4" />
          <path d="M 120 230 L 120 320 L 0 320 L 0 230 Z" fill="#0f172a" stroke="#334155" strokeWidth="2" />
          <path d="M 480 230 L 480 320 L 600 320 L 600 230 Z" fill="#0f172a" stroke="#334155" strokeWidth="2" />

          {hasFailed && (
            <g className="animate-pulse">
              <ellipse cx={breakX} cy="285" rx="35" ry="8" fill="#38bdf8" opacity="0.7" />
              <path d={`M ${breakX - 20} 285 Q ${breakX - 10} 260 ${breakX - 25} 250`} stroke="#7dd3fc" strokeWidth="2" fill="none" />
              <path d={`M ${breakX + 20} 285 Q ${breakX + 10} 260 ${breakX + 25} 250`} stroke="#7dd3fc" strokeWidth="2" fill="none" />
              <circle cx={breakX - 12} cy="265" r="3" fill="#ef4444" />
              <circle cx={breakX + 15} cy="270" r="4" fill="#f59e0b" />
              <circle cx={breakX + 2} cy="255" r="3" fill="#cbd5e1" />
            </g>
          )}

          {selectedSupport === 'pier' && (
            <g>
              <rect x="285" y="210" width="30" height="90" fill="#475569" stroke="#f59e0b" strokeWidth="1.5" />
              <text x="300" y="260" fill="#cbd5e1" fontSize="9" textAnchor="middle" fontFamily="monospace">MIDTPILAR</text>
            </g>
          )}

          <rect x="50" y="210" width="70" height="30" fill="#334155" stroke="#f59e0b" strokeWidth="2" rx="2" />
          <rect x="480" y="210" width="70" height="30" fill="#334155" stroke="#f59e0b" strokeWidth="2" rx="2" />
          <text x="85" y="230" fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="monospace">0.0 m</text>
          <text x="515" y="230" fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="monospace">12.0 m</text>

          {(() => {
            const stressColor = hasFailed ? '#ef4444' : maxStress > 0.85 ? '#f59e0b' : matObj.color;

            if (hasFailed) {
              return (
                <g id="bridge-structure-failed">
                  <line x1="60" y1="210" x2={breakX - 10} y2="245" stroke="#ef4444" strokeWidth={strokeW + 2} />
                  <line x1={breakX + 10} y1="245" x2="540" y2="210" stroke="#ef4444" strokeWidth={strokeW + 2} />
                  <path d={`M ${breakX - 25} 210 L ${breakX - 10} 245 L ${breakX - 5} 270`} stroke="#ef4444" strokeWidth={strokeW} fill="none" strokeDasharray="4 2" />
                  <path d={`M ${breakX + 25} 210 L ${breakX + 10} 245 L ${breakX + 18} 265`} stroke="#ef4444" strokeWidth={strokeW} fill="none" strokeDasharray="4 2" />
                  <line x1={breakX - 15} y1="230" x2={breakX + 15} y2="235" stroke="#f59e0b" strokeWidth="3" />
                  <line x1={breakX - 5} y1="220" x2={breakX + 5} y2="250" stroke="#f59e0b" strokeWidth="2" />
                </g>
              );
            }

            return (
              <g id="bridge-structure-intact" className="transition-all duration-200">
                <line x1="60" y1="210" x2="540" y2="210" stroke={matObj.color} strokeWidth={strokeW + 2} />

                {design.trussType === 'warren' && (
                  <g stroke={stressColor} strokeWidth={strokeW} fill="none">
                    <line x1="120" y1="130" x2="480" y2="130" stroke="#ef4444" strokeWidth={strokeW + 1} />
                    <path d="M 60 210 L 120 130 L 180 210 L 240 130 L 300 210 L 360 130 L 420 210 L 480 130 L 540 210" />
                  </g>
                )}

                {design.trussType === 'pratt' && (
                  <g stroke={stressColor} strokeWidth={strokeW} fill="none">
                    <line x1="120" y1="120" x2="480" y2="120" stroke="#ef4444" strokeWidth={strokeW + 1} />
                    <line x1="120" y1="210" x2="120" y2="120" stroke="#ef4444" />
                    <line x1="210" y1="210" x2="210" y2="120" stroke="#ef4444" />
                    <line x1="300" y1="210" x2="300" y2="120" stroke="#ef4444" />
                    <line x1="390" y1="210" x2="390" y2="120" stroke="#ef4444" />
                    <line x1="480" y1="210" x2="480" y2="120" stroke="#ef4444" />
                    {includeDiagonals && (
                      <path d="M 60 210 L 120 120 M 120 210 L 210 120 M 210 210 L 300 120 M 390 120 L 300 210 M 480 120 L 390 210 M 540 210 L 480 120" stroke="#38bdf8" />
                    )}
                  </g>
                )}

                {design.trussType === 'arch' && (
                  <g stroke="#ef4444" strokeWidth={strokeW + 1} fill="none">
                    <path d="M 60 210 Q 300 90 540 210" />
                    <g stroke="#38bdf8" strokeWidth="2">
                      <line x1="150" y1="210" x2="150" y2="160" />
                      <line x1="220" y1="210" x2="220" y2="130" />
                      <line x1="300" y1="210" x2="300" y2="120" />
                      <line x1="380" y1="210" x2="380" y2="130" />
                      <line x1="450" y1="210" x2="450" y2="160" />
                    </g>
                  </g>
                )}
              </g>
            );
          })()}

          <g 
            transform={`translate(${truckX}, ${truckY}) rotate(${truckRotation})`} 
            className="transition-all duration-100"
          >
            <rect x="-35" y="-18" width="45" height="22" fill={hasFailed ? "#ef4444" : "#f59e0b"} rx="3" stroke="#fff" strokeWidth="1" />
            <rect x="10" y="-10" width="18" height="14" fill="#38bdf8" rx="2" />
            <circle cx="-20" cy="6" r="6" fill="#0f172a" stroke="#cbd5e1" strokeWidth="2" />
            <circle cx="-5" cy="6" r="6" fill="#0f172a" stroke="#cbd5e1" strokeWidth="2" />
            <circle cx="18" cy="6" r="6" fill="#0f172a" stroke="#cbd5e1" strokeWidth="2" />
            <text x="-12" y="-4" fill="#0f172a" fontSize="9" fontWeight="bold" fontFamily="sans-serif">24 TONN</text>
            
            {hasFailed && (
              <circle cx="18" cy="-14" r="4" fill="#ef4444" className="animate-ping" />
            )}
          </g>

          <g transform="translate(20, 20)">
            <rect width="180" height="52" fill="#0f172a" opacity="0.9" rx="8" stroke="#334155" strokeWidth="1" />
            <text x="12" y="18" fill="#94a3b8" fontSize="10" fontFamily="monospace">KJØRT DISTANSE:</text>
            <text x="12" y="42" fill="#f59e0b" fontSize="22" fontWeight="black" fontFamily="monospace">
              {drivenMeters.toFixed(1)} <tspan fontSize="12" fill="#cbd5e1">/ 12.0 m</tspan>
            </text>
          </g>

          <g transform="translate(400, 20)">
            <rect width="180" height="52" fill="#0f172a" opacity="0.9" rx="8" stroke="#334155" strokeWidth="1" />
            <text x="12" y="18" fill="#94a3b8" fontSize="10" fontFamily="monospace">SPENNING (σ / f_y):</text>
            <rect x="12" y="28" width="156" height="12" fill="#1e293b" rx="6" />
            <rect 
              x="12" y="28" 
              width={Math.min(156, 156 * maxStress)} 
              height="12" 
              fill={hasFailed ? '#ef4444' : maxStress > 0.85 ? '#f59e0b' : '#10b981'} 
              rx="6" 
            />
            <text x="90" y="38" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
              {Math.round(maxStress * 100)}%
            </text>
          </g>

          {hasFailed && (
            <g transform="translate(300, 85)" className="animate-bounce">
              <rect x="-170" y="-30" width="340" height="60" fill="#ef4444" rx="12" stroke="#ffffff" strokeWidth="2" />
              <text x="0" y="-5" fill="#ffffff" fontSize="14" fontWeight="black" textAnchor="middle">
                💥 STRUKTURELL KOLLAPS!
              </text>
              <text x="0" y="16" fill="#fef08a" fontSize="11" fontWeight="bold" textAnchor="middle">
                Broen knakk ved {drivenMeters.toFixed(1)} meter
              </text>
            </g>
          )}

          {delayCountdown > 0 && (
            <g transform="translate(300, 290)">
              <rect x="-110" y="-14" width="220" height="24" fill="#0f172a" opacity="0.9" rx="12" stroke="#f59e0b" strokeWidth="1" />
              <text x="0" y="2" fill="#f59e0b" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                Viser resultat om {delayCountdown}s...
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Control Inputs */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-bold text-amber-400 mb-1">1. Velg bæresystem (fagverkstype)</label>
          <div className="grid grid-cols-2 gap-2">
            {BRIDGE_DESIGNS.map(d => (
              <button
                key={d.id}
                type="button"
                disabled={isTesting}
                onClick={() => setSelectedDesign(d.id)}
                className={`p-2 rounded-xl border text-left transition-all text-xs ${
                  selectedDesign === d.id
                    ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-amber-300 font-bold">{d.name}</div>
                <div className="text-[10px] text-slate-400">{d.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-amber-400 mb-1">2. Velg materiale</label>
          <div className="grid grid-cols-2 gap-2">
            {BRIDGE_MATERIALS.map(m => (
              <button
                key={m.id}
                type="button"
                disabled={isTesting}
                onClick={() => setSelectedMaterial(m.id)}
                className={`p-2 rounded-xl border text-left transition-all text-xs ${
                  selectedMaterial === m.id
                    ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-amber-400 mb-1">3. Velg opplegg og landkar</label>
          <div className="grid grid-cols-3 gap-1.5">
            {BRIDGE_SUPPORTS.map(s => (
              <button
                key={s.id}
                type="button"
                disabled={isTesting}
                onClick={() => setSelectedSupport(s.id)}
                className={`p-2 rounded-xl border text-center transition-all text-[11px] ${
                  selectedSupport === s.id
                    ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-amber-400 mb-1">4. Velg kjørebane / dekketype</label>
          <div className="grid grid-cols-3 gap-1.5">
            {BRIDGE_DECKS.map(dk => (
              <button
                key={dk.id}
                type="button"
                disabled={isTesting}
                onClick={() => setSelectedDeck(dk.id)}
                className={`p-2 rounded-xl border text-center transition-all text-[11px] ${
                  selectedDeck === dk.id
                    ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                {dk.name}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <label className="font-bold text-amber-400">5. Profiltykkelse / dimensjonering</label>
            <span className="font-mono text-white font-bold bg-slate-950 px-2.5 py-1 rounded border border-slate-700">
              {Math.round(100 + profileThickness * 4)} mm
            </span>
          </div>

          <input 
            type="range" 
            min="10" 
            max="100" 
            value={profileThickness}
            disabled={isTesting}
            onChange={(e) => setProfileThickness(Number(e.target.value))}
            className="w-full accent-amber-500 h-2 bg-slate-950 rounded-lg cursor-pointer"
          />

          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>100 mm</span>
            <span>300 mm</span>
            <span>500 mm</span>
          </div>
        </div>

        {selectedDesign === 'pratt_truss' && (
          <div className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-300 font-medium">Inkluder diagonale strekkstag i midtfelt?</span>
            <input 
              type="checkbox" 
              checked={includeDiagonals} 
              disabled={isTesting}
              onChange={(e) => setIncludeDiagonals(e.target.checked)}
              className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
            />
          </div>
        )}

        <button
          type="button"
          disabled={isTesting}
          onClick={onRunTest}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-3.5 rounded-xl text-base shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all"
        >
          <TruckIcon className="w-5 h-5 fill-current" /> {isTesting ? 'Kjører over broen...' : 'Start bæreevnetest (Kjør lastebil)'}
        </button>
      </div>

    </div>
  );
}

export default function App() {
  const [mode, setMode] = useState('select'); // 'select', 'screen', 'mobile'
  const [track, setTrack] = useState('elektro'); // 'elektro' or 'bygg'
  
  // Custom logo state (stored persistently in safeStorage)
  const [logoUrl, setLogoUrl] = useState(() => safeStorage.getItem('niras_logo_url') || '');
  const fileInputRef = useRef(null);

  // Two separate leaderboards
  const [elektroLeaderboard, setElektroLeaderboard] = useState([]);
  const [byggLeaderboard, setByggLeaderboard] = useState([]);

  // Mobile Quiz & Simulator State
  const [step, setStep] = useState('start'); // 'start', 'quiz', 'result'
  const [participantName, setParticipantName] = useState('');
  const [selectedItems, setSelectedItems] = useState({});
  const [timeSeconds, setTimeSeconds] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [finalTime, setFinalTime] = useState(0);
  const [finalDistance, setFinalDistance] = useState(0);

  // Bridge Simulator State (Bygg track)
  const [selectedDesign, setSelectedDesign] = useState('warren_truss');
  const [selectedMaterial, setSelectedMaterial] = useState('steel_s355');
  const [selectedSupport, setSelectedSupport] = useState('simple');
  const [selectedDeck, setSelectedDeck] = useState('asphalt_steel');
  const [profileThickness, setProfileThickness] = useState(50);
  const [includeDiagonals, setIncludeDiagonals] = useState(true);
  const [isTestingBridge, setIsTestingBridge] = useState(false);
  const [bridgeProgress, setBridgeProgress] = useState(0);
  const [bridgeMaxStress, setBridgeMaxStress] = useState(0);
  const [bridgeFailed, setBridgeFailed] = useState(false);
  const [drivenMeters, setDrivenMeters] = useState(0);
  const [delayCountdown, setDelayCountdown] = useState(0);

  // Handle NIRAS Logo Upload
  const handleLogoUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target.result;
        setLogoUrl(result);
        safeStorage.setItem('niras_logo_url', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoUrl('');
    safeStorage.setItem('niras_logo_url', '');
  };

  // Parse URL Parameters
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('mode') === 'skjerm') {
        setMode('screen');
      }
      if (params.get('track') === 'bygg') {
        setTrack('bygg');
        if (params.get('mode') !== 'skjerm') setMode('mobile');
      } else if (params.get('track') === 'elektro') {
        setTrack('elektro');
        if (params.get('mode') !== 'skjerm') setMode('mobile');
      }
    } catch (e) { /* ignore */ }
  }, []);

  // Real-time synchronization via ntfy.sh SSE
  useEffect(() => {
    const sseUrl = `https://ntfy.sh/${NTFY_TOPIC}/sse`;
    let eventSource;

    try {
      eventSource = new EventSource(sseUrl);

      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload && payload.message) {
            const entry = JSON.parse(payload.message);
            if (entry && entry.name && entry.track) {
              if (entry.track === 'bygg') {
                setByggLeaderboard((prev) => updateAndSortByggList(prev, entry));
              } else {
                setElektroLeaderboard((prev) => updateAndSortElektroList(prev, entry));
              }
            }
          }
        } catch (err) { /* silent catch */ }
      };
    } catch (e) {
      console.warn("SSE connection error:", e);
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, []);

  const updateAndSortElektroList = (list, newEntry) => {
    const updated = [...list, { ...newEntry, id: Math.random().toString() }];
    updated.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.timeUsed - b.timeUsed;
    });
    return updated.slice(0, 10);
  };

  const updateAndSortByggList = (list, newEntry) => {
    const updated = [...list, { ...newEntry, id: Math.random().toString() }];
    updated.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (b.distanceMeters || 0) - (a.distanceMeters || 0);
    });
    return updated.slice(0, 10);
  };

  // Stopwatch Timer for ELEKTRO ONLY
  useEffect(() => {
    let interval;
    if (step === 'quiz' && track === 'elektro') {
      interval = setInterval(() => {
        setTimeSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [step, track]);

  const handleToggleItem = (id) => {
    setSelectedItems((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleRunBridgeTest = () => {
    setIsTestingBridge(true);
    setBridgeProgress(0);
    setBridgeFailed(false);
    setDrivenMeters(0);
    setDelayCountdown(0);

    const designObj = BRIDGE_DESIGNS.find(d => d.id === selectedDesign);
    const materialObj = BRIDGE_MATERIALS.find(m => m.id === selectedMaterial) || BRIDGE_MATERIALS[0];
    const supportObj = BRIDGE_SUPPORTS.find(s => s.id === selectedSupport) || BRIDGE_SUPPORTS[0];
    const deckObj = BRIDGE_DECKS.find(dk => dk.id === selectedDeck) || BRIDGE_DECKS[0];

    let baseCap = designObj?.capacityFactor || 0.8;
    if (selectedDesign === 'pratt_truss' && !includeDiagonals) baseCap *= 0.55;

    const materialCapMod = materialObj.capMod;
    const supportCapMod = supportObj.capMod;
    const deckCapMod = deckObj.capMod;

    const thicknessRatio = profileThickness / 50; 
    const structuralCapacity = baseCap * materialCapMod * supportCapMod * deckCapMod * Math.sqrt(thicknessRatio);

    const selfWeightFactor = (materialObj.weightMod * deckObj.weightMod * (profileThickness / 45));
    const effectiveCapacity = structuralCapacity / (1.0 + selfWeightFactor * 0.18);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 1.8;
      setBridgeProgress(progress);

      const currentMeters = (progress / 100) * 12.0;
      setDrivenMeters(currentMeters);

      const currentLoad = 0.35 + 0.65 * Math.sin((progress / 100) * Math.PI);
      const stressRatio = currentLoad / effectiveCapacity;
      setBridgeMaxStress(stressRatio);

      if (stressRatio > 1.0) {
        clearInterval(interval);
        setBridgeFailed(true);
        setIsTestingBridge(false);

        let failedScore = Math.max(1, Math.floor((currentMeters / 12.0) * 4));

        let countdown = 3;
        setDelayCountdown(countdown);

        const countdownInterval = setInterval(() => {
          countdown -= 1;
          setDelayCountdown(countdown);
          if (countdown <= 0) {
            clearInterval(countdownInterval);
            submitByggResult(failedScore, currentMeters);
          }
        }, 1000);

      } else if (progress >= 100) {
        clearInterval(interval);
        setIsTestingBridge(false);

        const base = designObj?.basePoints || 8;
        let scorePenalties = 0;
        if (selfWeightFactor > 2.0) scorePenalties += Math.floor((selfWeightFactor - 2.0) * 2);
        if (selectedSupport === 'pier' && selectedDesign === 'under_arch') scorePenalties += 1;

        let calculatedScore = base + 2 - scorePenalties;

        if (calculatedScore < 1) calculatedScore = 1;
        if (calculatedScore > 12) calculatedScore = 12;

        let countdown = 2;
        setDelayCountdown(countdown);
        const victoryInterval = setInterval(() => {
          countdown -= 1;
          setDelayCountdown(countdown);
          if (countdown <= 0) {
            clearInterval(victoryInterval);
            submitByggResult(calculatedScore, 12.0);
          }
        }, 800);
      }
    }, 45);
  };

  const calculateElektroScore = () => {
    let score = 0;
    ELEKTRO_SYSTEMS.forEach((item) => {
      const isSelected = !!selectedItems[item.id];
      if (isSelected && item.isCorrect) score += 1;
      if (isSelected && !item.isCorrect) score -= 1;
    });

    return score < 0 ? 0 : score;
  };

  const handleElektroSubmit = () => {
    const score = calculateElektroScore();
    sendResultToLeaderboard(score, timeSeconds, 0);
  };

  const submitByggResult = (score, meters) => {
    sendResultToLeaderboard(score, 0, meters);
  };

  const sendResultToLeaderboard = async (score, timeUsed, distance) => {
    setFinalScore(score);
    setFinalTime(timeUsed);
    setFinalDistance(distance);
    setStep('result');

    const entry = {
      name: participantName.trim(),
      track: track,
      score: score,
      timeUsed: timeUsed,
      distanceMeters: distance,
      timestamp: Date.now()
    };

    if (track === 'bygg') {
      setByggLeaderboard((prev) => updateAndSortByggList(prev, entry));
    } else {
      setElektroLeaderboard((prev) => updateAndSortElektroList(prev, entry));
    }

    try {
      await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
    } catch (err) {
      console.warn("Could not post score to ntfy:", err);
    }
  };

  const resetQuiz = () => {
    setParticipantName('');
    setSelectedItems({});
    setTimeSeconds(0);
    setBridgeProgress(0);
    setBridgeMaxStress(0);
    setBridgeFailed(false);
    setDrivenMeters(0);
    setDelayCountdown(0);
    setSelectedDesign('warren_truss');
    setSelectedMaterial('steel_s355');
    setSelectedSupport('simple');
    setSelectedDeck('asphalt_steel');
    setProfileThickness(50);
    setIncludeDiagonals(true);
    setStep('start');
  };

  const currentBaseUrl = typeof window !== 'undefined' ? window.location.href.split('?')[0] : '';
  const elektroQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(currentBaseUrl + '?track=elektro')}`;
  const byggQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(currentBaseUrl + '?track=bygg')}`;

  if (mode === 'select') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 font-sans">
        <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl max-w-md w-full border border-slate-800 text-center">
          <AlertTriangleIcon className="w-16 h-16 text-amber-500 mx-auto mb-6 animate-pulse" />
          <h1 className="text-3xl font-extrabold mb-2 text-white">NIRAS Stand-quiz</h1>
          <p className="text-slate-400 mb-8 text-sm">Velg visningsmodus for enheten:</p>
          
          <div className="space-y-4">
            <button 
              onClick={() => setMode('screen')}
              className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-2xl transition-all font-semibold text-lg shadow-lg shadow-blue-900/30"
            >
              <MonitorIcon className="w-6 h-6" /> Åpne storskjerm (stand)
            </button>
            <button 
              onClick={() => { setTrack('elektro'); setMode('mobile'); }}
              className="w-full flex items-center justify-center gap-3 bg-slate-800 hover:bg-slate-700 text-blue-400 p-4 rounded-2xl transition-all font-semibold text-lg border border-blue-500/30"
            >
              <ZapIcon className="w-6 h-6 text-blue-400" /> Deltaker: Elektro & ITB
            </button>
            <button 
              onClick={() => { setTrack('bygg'); setMode('mobile'); }}
              className="w-full flex items-center justify-center gap-3 bg-slate-800 hover:bg-slate-700 text-amber-400 p-4 rounded-2xl transition-all font-semibold text-lg border border-amber-500/30"
            >
              <BuildingIcon className="w-6 h-6 text-amber-400" /> Deltaker: Bygg & Statikk
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'screen') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col p-6 font-sans overflow-x-hidden">
        {/* Header with Prominent NIRAS Logo (No action buttons) */}
        <header className="flex flex-wrap items-center justify-between pb-6 border-b border-slate-800 mb-6 gap-4">
          <div className="flex items-center gap-6">
            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*" 
              onChange={handleLogoUpload} 
              className="hidden" 
            />
            
            {/* Clickable area to set logo silently without showing action buttons */}
            <div 
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              className="cursor-pointer transition-transform hover:scale-102 flex items-center"
              title="Klikk her for å velge logo-fil"
            >
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt="NIRAS Logo" 
                  className="h-28 md:h-36 max-w-[450px] object-contain bg-slate-900/90 p-3.5 rounded-2xl border-2 border-slate-700 shadow-2xl" 
                />
              ) : (
                <div className="flex items-center gap-4 bg-slate-900 px-8 py-5 rounded-3xl border-2 border-amber-500/50 shadow-2xl">
                  <AlertTriangleIcon className="w-14 h-14 text-amber-400" />
                  <div>
                    <span className="text-2xl font-black tracking-widest text-amber-500 uppercase block">NIRAS</span>
                    <h1 className="text-4xl font-black text-white tracking-tight">STUDENTUTFORDRING</h1>
                  </div>
                </div>
              )}
            </div>

            <div>
              {logoUrl && <h1 className="text-4xl font-black text-white tracking-tight">NIRAS STUDENTUTFORDRING</h1>}
              <p className="text-slate-400 text-base mt-1">Velg fagfelt • Skann QR og konkurrer på kunnskap og dimensjonering!</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 bg-slate-900 px-5 py-3 rounded-full border border-slate-800 text-sm text-slate-300 font-mono shadow-lg">
              <span className="w-3 h-3 rounded-full bg-green-500 animate-ping"></span> Live-synkronisert
            </div>
          </div>
        </header>

        {/* Explanatory Info Banner Top - High Legibility for Large Screen */}
        <div className="mb-8 bg-slate-900/95 border-2 border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start gap-5 bg-blue-950/60 p-6 rounded-2xl border-2 border-blue-500/40 shadow-xl">
            <div className="p-4 bg-blue-500/20 rounded-2xl border border-blue-400/40 flex-shrink-0">
              <ZapIcon className="w-10 h-10 text-blue-400" />
            </div>
            <div className="space-y-2">
              <h3 className="font-black text-blue-400 text-xl md:text-2xl tracking-wide">
                ⚡ Elektro & ITB-utfordringen
              </h3>
              <p className="text-base md:text-lg text-slate-100 font-medium leading-relaxed">
                Test kunnskapene dine om bygningsautomasjon! Identifiser hvilke tekniske bygningssystemer som skal påvirkes eller gå i brannmodus når brannalarmen utløses. Flest riktige på kortest tid vinner!
              </p>
            </div>
          </div>

          <div className="flex items-start gap-5 bg-amber-950/60 p-6 rounded-2xl border-2 border-amber-500/40 shadow-xl">
            <div className="p-4 bg-amber-500/20 rounded-2xl border border-amber-400/40 flex-shrink-0">
              <BuildingIcon className="w-10 h-10 text-amber-400" />
            </div>
            <div className="space-y-2">
              <h3 className="font-black text-amber-400 text-xl md:text-2xl tracking-wide">
                🏗️ Bygg & Statikk-utfordringen
              </h3>
              <p className="text-base md:text-lg text-slate-100 font-medium leading-relaxed">
                Test ferdighetene dine som ingeniør! Velg bæresystem, materiale, opplegg, dekketype og profiltykkelse for å dimensjonere en bro som tåler at en 24-tonns lastebil kjører helt over gjelet.
              </p>
            </div>
          </div>
        </div>

        {/* 3-Column Layout: QR Left - Leaderboards Middle - QR Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-start">
          
          {/* LEFT COLUMN: Elektro QR Code */}
          <div className="lg:col-span-4 flex flex-col items-center">
            <div className="w-full bg-blue-950/60 rounded-3xl p-6 border-2 border-blue-500/40 shadow-2xl flex flex-col items-center text-center">
              <div className="flex items-center gap-2 mb-2 text-blue-400 font-bold text-xl">
                <ZapIcon className="w-7 h-7" /> Elektro & ITB
              </div>
              <p className="text-slate-200 text-sm mb-4 min-h-[32px]">
                Skann for oppgave om brann- og bygningsautomasjon
              </p>
              <div className="bg-white p-4 rounded-2xl shadow-inner border-2 border-blue-500 mb-4 w-full flex justify-center">
                <img src={elektroQrUrl} alt="QR Elektro" className="w-60 h-60 md:w-72 md:h-72 lg:w-80 lg:h-80 object-contain" />
              </div>
              <span className="text-xs font-mono text-blue-300 bg-blue-950 px-4 py-1.5 rounded-full border border-blue-800/50 font-semibold">
                ⚡ Elektro-løype
              </span>
            </div>
          </div>

          {/* CENTER COLUMN: Leaderboards Stacked Vertically */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Elektro Leaderboard */}
            <div className="bg-blue-950/60 rounded-3xl p-5 border-2 border-blue-500/40 shadow-2xl flex flex-col">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-blue-800/50">
                <div className="flex items-center gap-2 text-blue-400">
                  <TrophyIcon className="w-6 h-6 text-yellow-400" />
                  <h2 className="text-lg font-bold text-white">Toppliste Elektro & ITB</h2>
                </div>
                <span className="text-xs font-mono text-blue-300 bg-blue-950 px-2.5 py-0.5 rounded-full border border-blue-700/50">
                  Maks 11p
                </span>
              </div>

              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {elektroLeaderboard.length === 0 ? (
                  <div className="py-8 flex flex-col items-center justify-center text-slate-400 text-xs">
                    <ZapIcon className="w-8 h-8 mb-1 opacity-40" />
                    Venter på første elektro-deltaker...
                  </div>
                ) : (
                  elektroLeaderboard.map((entry, idx) => (
                    <div 
                      key={entry.id || idx}
                      className={`flex items-center p-2.5 rounded-2xl border ${
                        idx === 0 ? 'bg-yellow-500/10 border-yellow-500/40' :
                        idx === 1 ? 'bg-slate-400/10 border-slate-400/30' :
                        idx === 2 ? 'bg-amber-700/10 border-amber-700/30' :
                        'bg-slate-950/60 border-slate-800'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center mr-2.5 ${
                        idx === 0 ? 'bg-yellow-500 text-slate-950' :
                        idx === 1 ? 'bg-slate-300 text-slate-900' :
                        idx === 2 ? 'bg-amber-600 text-white' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0 mr-2">
                        <p className="font-semibold text-white truncate text-xs">
                          {entry.name}
                        </p>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <span className="text-sm font-bold text-blue-400">{entry.score}/11</span>
                        <span className="text-xs font-mono text-slate-300 bg-slate-900 px-2 py-0.5 rounded">{entry.timeUsed}s</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Bygg Leaderboard (Matching Amber Info-box styling) */}
            <div className="bg-amber-950/60 rounded-3xl p-5 border-2 border-amber-500/40 shadow-2xl flex flex-col">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-amber-800/50">
                <div className="flex items-center gap-2 text-amber-400">
                  <TrophyIcon className="w-6 h-6 text-yellow-400" />
                  <h2 className="text-lg font-bold text-white">Toppliste Bygg & Statikk</h2>
                </div>
                <span className="text-xs font-mono text-amber-300 bg-amber-950 px-2.5 py-0.5 rounded-full border border-amber-700/50">
                  Maks 12p
                </span>
              </div>

              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {byggLeaderboard.length === 0 ? (
                  <div className="py-8 flex flex-col items-center justify-center text-slate-400 text-xs">
                    <BuildingIcon className="w-8 h-8 mb-1 opacity-40" />
                    Venter på første bygg-deltaker...
                  </div>
                ) : (
                  byggLeaderboard.map((entry, idx) => (
                    <div 
                      key={entry.id || idx}
                      className={`flex items-center p-2.5 rounded-2xl border ${
                        idx === 0 ? 'bg-yellow-500/10 border-yellow-500/40' :
                        idx === 1 ? 'bg-slate-400/10 border-slate-400/30' :
                        idx === 2 ? 'bg-amber-700/10 border-amber-700/30' :
                        'bg-slate-950/60 border-slate-800'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center mr-2.5 ${
                        idx === 0 ? 'bg-yellow-500 text-slate-950' :
                        idx === 1 ? 'bg-slate-300 text-slate-900' :
                        idx === 2 ? 'bg-amber-600 text-white' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0 mr-2">
                        <p className="font-semibold text-white truncate text-xs">
                          {entry.name}
                        </p>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <span className="text-sm font-bold text-amber-400">{entry.score}/12</span>
                        <span className="text-xs font-mono text-slate-300 bg-slate-900 px-2 py-0.5 rounded">
                          {(entry.distanceMeters || 0).toFixed(1)}m
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Bygg QR Code (Matching Amber Info-box styling) */}
          <div className="lg:col-span-4 flex flex-col items-center">
            <div className="w-full bg-amber-950/60 rounded-3xl p-6 border-2 border-amber-500/40 shadow-2xl flex flex-col items-center text-center">
              <div className="flex items-center gap-2 mb-2 text-amber-400 font-bold text-xl">
                <BuildingIcon className="w-7 h-7" /> Bygg & Statikk
              </div>
              <p className="text-slate-200 text-sm mb-4 min-h-[32px]">
                Skann for brobyggings- og bæreevnetesten
              </p>
              <div className="bg-white p-4 rounded-2xl shadow-inner border-2 border-amber-500 mb-4 w-full flex justify-center">
                <img src={byggQrUrl} alt="QR Bygg" className="w-60 h-60 md:w-72 md:h-72 lg:w-80 lg:h-80 object-contain" />
              </div>
              <span className="text-xs font-mono text-amber-300 bg-amber-950 px-4 py-1.5 rounded-full border border-amber-800/50 font-semibold">
                🏗️ Bygg-løype
              </span>
            </div>
          </div>

        </div>
      </div>
    );
  }

  const maxPossibleScore = track === 'bygg' ? 12 : 11;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col p-4 font-sans max-w-lg mx-auto relative">
      
      {/* Participant Header */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between mb-4 shadow-lg">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt="NIRAS Logo" className="h-8 max-w-[120px] object-contain" />
          ) : (
            track === 'bygg' ? (
              <BuildingIcon className="w-6 h-6 text-amber-400" />
            ) : (
              <ZapIcon className="w-6 h-6 text-blue-400" />
            )
          )}
          <div>
            <h2 className="font-bold text-sm text-white">
              {track === 'bygg' ? 'Bygg- og statikkoppgave' : 'Elektro- og ITB-oppgave'}
            </h2>
            <p className="text-[11px] text-slate-400">NIRAS Studentutfordring</p>
          </div>
        </div>

        {step === 'quiz' && track === 'elektro' && (
          <div className="flex items-center gap-1.5 font-mono font-bold text-amber-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-amber-500/30">
            <TimerIcon className="w-4 h-4" />
            <span>{timeSeconds}s</span>
          </div>
        )}
      </div>

      {/* STEP 1: START SCREEN */}
      {step === 'start' && (
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-6">
          <div className="space-y-2">
            <h1 className="text-xl font-black text-white">Velkommen til standen!</h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              {INTRO_TEXTS[track]}
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300">
              Ditt navn eller alias (vises på leaderboard)
            </label>
            <input
              type="text"
              placeholder="f.eks. Kari Nordmann"
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-all"
            />
          </div>

          <button
            disabled={!participantName.trim()}
            onClick={() => setStep('quiz')}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-4 rounded-2xl text-base shadow-lg shadow-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            <PlayIcon className="w-5 h-5 fill-current" /> Start oppgaven
          </button>
        </div>
      )}

      {/* STEP 2: QUIZ SCREEN */}
      {step === 'quiz' && track === 'elektro' && (
        <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 shadow-xl space-y-5">
          <div>
            <h2 className="text-base font-bold text-white mb-1">
              Hvilke systemer skal reagere ved utløst brannalarm?
            </h2>
            <p className="text-xs text-slate-400">
              Huk av for alle systemer som skal påvirkes eller gå i brannmodus.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2 max-h-[50vh] overflow-y-auto pr-1">
            {ELEKTRO_SYSTEMS.map((item) => {
              const isSelected = !!selectedItems[item.id];
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleToggleItem(item.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-600/20 border-blue-500 text-white font-semibold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs">{item.label}</span>
                  <div
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-blue-500 border-blue-400 text-white'
                        : 'border-slate-700 bg-slate-900'
                    }`}
                  >
                    {isSelected && <CheckIcon className="w-3.5 h-3.5" />}
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleElektroSubmit}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-2xl text-sm shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
          >
            <CheckIcon className="w-5 h-5" /> Lever svar
          </button>
        </div>
      )}

      {step === 'quiz' && track === 'bygg' && (
        <BridgeSimulator
          selectedDesign={selectedDesign}
          setSelectedDesign={setSelectedDesign}
          selectedMaterial={selectedMaterial}
          setSelectedMaterial={setSelectedMaterial}
          selectedSupport={selectedSupport}
          setSelectedSupport={setSelectedSupport}
          selectedDeck={selectedDeck}
          setSelectedDeck={setSelectedDeck}
          profileThickness={profileThickness}
          setProfileThickness={setProfileThickness}
          includeDiagonals={includeDiagonals}
          setIncludeDiagonals={setIncludeDiagonals}
          isTesting={isTestingBridge}
          testProgress={bridgeProgress}
          maxStress={bridgeMaxStress}
          hasFailed={bridgeFailed}
          drivenMeters={drivenMeters}
          delayCountdown={delayCountdown}
          onRunTest={handleRunBridgeTest}
        />
      )}

      {/* STEP 3: RESULT SCREEN */}
      {step === 'result' && (
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-6 text-center">
          <div className="inline-flex p-4 bg-amber-500/10 rounded-full border border-amber-500/30 text-amber-400 mb-1">
            <TrophyIcon className="w-12 h-12" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-white mb-1">Gratulerer, {participantName}!</h2>
            <p className="text-xs text-slate-400">Ditt resultat er registrert på storskjermen.</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] text-slate-400 font-mono">POENGSUM</p>
              <p className="text-2xl font-black text-amber-400">
                {finalScore} <span className="text-xs text-slate-500">/ {maxPossibleScore}p</span>
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-mono">
                {track === 'bygg' ? 'KJØRT DISTANSE' : 'TIDSFORBRUK'}
              </p>
              <p className="text-2xl font-black text-blue-400">
                {track === 'bygg' ? `${finalDistance.toFixed(1)}m` : `${finalTime}s`}
              </p>
            </div>
          </div>

          <button
            onClick={resetQuiz}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 rounded-2xl text-sm border border-slate-700 transition-all flex items-center justify-center gap-2"
          >
            <RefreshIcon className="w-4 h-4" /> Prøv på nytt / Ny deltaker
          </button>
        </div>
      )}
    </div>
  );
}
