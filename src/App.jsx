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


const APP_THEME_CSS = `
  .standquiz-shell {
    background-color: #050b18;
    background-image: radial-gradient(ellipse at 50% -18%, rgba(37,99,235,.22), transparent 48%), radial-gradient(ellipse at 100% 55%, rgba(14,165,233,.08), transparent 35%);
  }
  .standquiz-shell button { -webkit-tap-highlight-color: transparent; }
  .standquiz-shell button:not(:disabled) { transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease, background-color .18s ease; }
  .standquiz-shell button:not(:disabled):hover { transform: translateY(-2px); }
  .standquiz-shell button:not(:disabled):active { transform: translateY(0) scale(.985); }
  .standquiz-screen { background-image: radial-gradient(ellipse at 50% -20%, rgba(37,99,235,.2), transparent 52%), linear-gradient(135deg,#050b18 0%,#0b1222 52%,#071426 100%); }
  .standquiz-screen header { border-color: rgba(100,116,139,.35); }
  .standquiz-screen .standquiz-intro {
    background: linear-gradient(135deg,rgba(15,23,42,.96),rgba(15,23,42,.72));
    border: 1px solid rgba(148,163,184,.24);
    box-shadow: 0 22px 70px rgba(0,0,0,.28), inset 0 1px rgba(255,255,255,.04);
  }
  .standquiz-screen .standquiz-qr-card {
    background: linear-gradient(155deg,rgba(15,35,67,.96),rgba(8,19,38,.96));
    border-width: 1px;
    box-shadow: 0 18px 55px rgba(0,0,0,.34), inset 0 1px rgba(255,255,255,.05);
    transition: transform .22s ease, box-shadow .22s ease;
  }
  .standquiz-screen .standquiz-qr-card:hover { transform: translateY(-4px); box-shadow: 0 24px 65px rgba(0,0,0,.42),0 0 28px rgba(56,189,248,.10); }
  .standquiz-screen .standquiz-qr-card img { image-rendering: pixelated; }
  .standquiz-screen .standquiz-leaderboard {
    background: linear-gradient(155deg,rgba(15,29,52,.98),rgba(8,16,32,.98));
    border-width: 1px;
    box-shadow: 0 18px 50px rgba(0,0,0,.3), inset 0 1px rgba(255,255,255,.04);
  }
  .standquiz-screen .standquiz-leaderboard h2 { letter-spacing: -.02em; }

  /* Purpose-built layout for a 1920x1080 stand display. */
  @media (min-width: 1200px) and (min-height: 760px) and (max-height: 1100px) {
    .standquiz-screen {
      height: 100vh;
      min-height: 0;
      overflow: hidden;
      box-sizing: border-box;
      padding: 18px 24px;
      gap: 0;
    }
    .standquiz-screen > header {
      flex: 0 0 auto;
      flex-wrap: nowrap;
      padding-bottom: 12px;
      margin-bottom: 14px;
      gap: 18px;
    }
    .standquiz-screen > header > div:first-child {
      min-width: 0;
      gap: 18px;
    }
    .standquiz-screen > header img {
      height: 88px;
      max-width: 360px;
      padding: 8px;
    }
    .standquiz-screen > header h1 {
      font-size: clamp(1.6rem, 2vw, 2.25rem);
      line-height: 1.1;
    }
    .standquiz-screen > header p {
      font-size: .95rem;
      line-height: 1.35;
    }
    .standquiz-screen > header > div:last-child {
      flex-wrap: nowrap;
      flex-shrink: 0;
      gap: 8px;
    }
    .standquiz-screen > header > div:last-child > div,
    .standquiz-screen > header > div:last-child > button {
      padding: 9px 13px;
      white-space: nowrap;
    }
    .standquiz-screen .standquiz-intro {
      flex: 0 0 auto;
      margin-bottom: 14px;
      padding: 14px;
      gap: 14px;
      border-radius: 20px;
    }
    .standquiz-screen .standquiz-intro > div {
      min-width: 0;
      padding: 13px 16px;
      gap: 13px;
      border-radius: 15px;
    }
    .standquiz-screen .standquiz-intro > div > div:first-child {
      padding: 11px;
    }
    .standquiz-screen .standquiz-intro svg {
      width: 30px;
      height: 30px;
    }
    .standquiz-screen .standquiz-intro h3 {
      font-size: 1.05rem;
      line-height: 1.3;
    }
    .standquiz-screen .standquiz-intro p {
      font-size: .84rem;
      line-height: 1.35;
    }
    .standquiz-screen > .grid {
      flex: 1 1 0;
      min-height: 0;
      gap: 16px;
      align-items: stretch;
    }
    .standquiz-screen > .grid > div {
      min-height: 0;
    }
    .standquiz-screen .standquiz-qr-card {
      height: 100%;
      min-height: 0;
      box-sizing: border-box;
      padding: 18px 14px;
      border-radius: 22px;
      justify-content: center;
    }
    .standquiz-screen .standquiz-qr-card > div:first-child {
      font-size: 1.2rem;
      margin-bottom: 8px;
    }
    .standquiz-screen .standquiz-qr-card > div:first-child svg {
      width: 26px;
      height: 26px;
    }
    .standquiz-screen .standquiz-qr-card > p {
      margin-bottom: 12px;
      min-height: 0;
      font-size: .85rem;
      line-height: 1.35;
    }
    .standquiz-screen .standquiz-qr-code {
      width: 100%;
      box-sizing: border-box;
      padding: 12px;
      margin-bottom: 12px;
      border-radius: 16px;
    }
    .standquiz-screen .standquiz-qr-image {
      display: block;
      width: clamp(230px, 27vh, 300px);
      height: clamp(230px, 27vh, 300px);
      max-width: 100%;
      object-fit: contain;
    }
    .standquiz-screen .standquiz-qr-card > span {
      font-size: .75rem;
    }
    .standquiz-screen > .grid > div:nth-child(2) {
      gap: 12px;
    }
    .standquiz-screen .standquiz-leaderboard {
      flex: 1 1 0;
      min-height: 0;
      box-sizing: border-box;
      padding: 12px 14px;
      border-radius: 20px;
    }
    .standquiz-screen .standquiz-leaderboard > div:first-child {
      flex: 0 0 auto;
      min-height: 34px;
      margin-bottom: 8px;
      padding-bottom: 7px;
      gap: 8px;
    }
    .standquiz-screen .standquiz-leaderboard h2 {
      font-size: clamp(.8rem, .95vw, 1.05rem);
      line-height: 1.25;
    }
    .standquiz-screen .standquiz-leaderboard > div:first-child svg {
      width: 21px;
      height: 21px;
      flex-shrink: 0;
    }
    .standquiz-screen .standquiz-leaderboard > div:first-child > span {
      flex-shrink: 0;
      font-size: .68rem;
    }
    .standquiz-screen .standquiz-leaderboard-list {
      display: flex;
      flex: 1 1 auto;
      flex-direction: column;
      align-items: stretch;
      gap: 4px;
      min-height: 0;
      overflow: visible;
    }
    .standquiz-screen .standquiz-leaderboard-list > div {
      flex: 0 0 27px;
      min-height: 27px;
      box-sizing: border-box;
      padding: 2px 7px;
      border-radius: 8px;
    }
    .standquiz-screen .standquiz-leaderboard-list > div > div:first-child {
      width: 21px;
      height: 21px;
      margin-right: 7px;
      flex-shrink: 0;
      font-size: 10px;
    }
    .standquiz-screen .standquiz-leaderboard-list p {
      font-size: .75rem;
      line-height: 1rem;
    }
    .standquiz-screen .standquiz-leaderboard-list span {
      font-size: .75rem;
    }
    .standquiz-screen .standquiz-leaderboard-list span:last-child {
      padding: 1px 6px;
      font-size: .68rem;
    }
  }
  .standquiz-mobile { background-image: radial-gradient(ellipse at 50% -12%,rgba(37,99,235,.22),transparent 48%),linear-gradient(160deg,#050b18,#0b1425 65%,#071426); }
  .standquiz-mobile .standquiz-panel {
    background: linear-gradient(150deg,rgba(15,27,48,.98),rgba(8,17,32,.98));
    border-color: rgba(100,116,139,.32);
    box-shadow: 0 20px 55px rgba(0,0,0,.32),inset 0 1px rgba(255,255,255,.04);
  }
  .standquiz-mobile input:focus { box-shadow: 0 0 0 3px rgba(56,189,248,.12); }
  @media (prefers-reduced-motion: reduce) {
    .standquiz-shell *, .standquiz-shell *::before, .standquiz-shell *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; }
  }

  /* Clean, high-impact stand display: two equal challenge panels. */
  .stand-v2 {
    box-sizing: border-box;
    min-height: 100vh;
    padding: 22px;
    color: #f8fafc;
    background: radial-gradient(ellipse at 50% -20%, rgba(37,99,235,.25), transparent 55%), linear-gradient(135deg,#050b18,#0b1426 60%,#071426);
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  }
  .stand-v2-header {
    display: flex;
    align-items: center;
    gap: 24px;
    min-height: 96px;
    padding: 0 4px 18px;
    border-bottom: 1px solid rgba(148,163,184,.25);
  }
  .stand-v2-brand { flex: 0 0 auto; cursor: pointer; }
  .stand-v2-brand img { display:block; max-width:230px; max-height:70px; object-fit:contain; }
  .stand-v2-wordmark { display:flex; flex-direction:column; line-height:1; }
  .stand-v2-wordmark span { color:#fbbf24; font-size:17px; font-weight:900; letter-spacing:.28em; }
  .stand-v2-wordmark strong { margin-top:7px; color:white; font-size:21px; letter-spacing:-.04em; }
  .stand-v2-headline { min-width:0; flex:1; }
  .stand-v2-headline h1 { margin:0; font-size:clamp(24px,2vw,38px); line-height:1.1; font-weight:950; letter-spacing:-.04em; }
  .stand-v2-headline p { margin:7px 0 0; color:#aebdd0; font-size:16px; }
  .stand-v2-actions { display:flex; align-items:center; gap:12px; }
  .stand-v2-live { display:flex; align-items:center; gap:9px; padding:10px 15px; border:1px solid rgba(34,197,94,.3); border-radius:999px; color:#bbf7d0; background:rgba(20,83,45,.3); font-size:13px; font-weight:900; letter-spacing:.12em; }
  .stand-v2-live i { width:9px; height:9px; border-radius:50%; background:#4ade80; box-shadow:0 0 12px #4ade80; }
  .stand-v2-actions button { display:flex; align-items:center; gap:8px; padding:10px 14px; border:1px solid rgba(248,113,113,.35); border-radius:999px; color:#fecaca; background:rgba(127,29,29,.35); font-size:13px; font-weight:800; }
  .stand-v2-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:20px; padding-top:20px; }
  .stand-v2-track { display:grid; grid-template-columns:minmax(250px, .82fr) minmax(0,1.18fr); min-width:0; gap:16px; padding:18px; border:1px solid rgba(148,163,184,.24); border-radius:24px; background:linear-gradient(145deg,rgba(15,31,55,.98),rgba(7,16,31,.98)); box-shadow:0 20px 60px rgba(0,0,0,.28); }
  .sky-track { border-top:3px solid #38bdf8; }
  .amber-track { border-top:3px solid #f59e0b; }
  .stand-v2-qr-panel { display:flex; flex-direction:column; align-items:center; justify-content:center; min-width:0; text-align:center; }
  .stand-v2-track-title { display:flex; align-items:center; justify-content:center; gap:10px; }
  .stand-v2-track-title span { font-size:27px; }
  .stand-v2-track-title h2 { margin:0; color:white; font-size:clamp(18px,1.3vw,25px); font-weight:950; letter-spacing:-.025em; }
  .stand-v2-qr-panel > p { margin:7px 0 14px; color:#b8c6d8; font-size:14px; }
  .stand-v2-qr-frame { display:flex; align-items:center; justify-content:center; width:min(100%,330px); padding:12px; border-radius:20px; background:white; box-shadow:0 0 0 5px rgba(255,255,255,.06),0 15px 45px rgba(0,0,0,.35); }
  .stand-v2-qr-frame img { display:block; width:100%; aspect-ratio:1; object-fit:contain; image-rendering:pixelated; }
  .stand-v2-scan { margin-top:15px; color:#dbeafe; font-size:11px; font-weight:900; letter-spacing:.12em; }
  .amber-track .stand-v2-scan { color:#fde68a; }
  .stand-v2-board { display:flex; flex-direction:column; min-width:0; min-height:0; }
  .stand-v2-board-head { display:flex; align-items:center; justify-content:space-between; gap:8px; padding:2px 2px 12px; border-bottom:1px solid rgba(148,163,184,.2); }
  .stand-v2-eyebrow { margin-bottom:3px; font-size:10px; font-weight:900; letter-spacing:.18em; }
  .stand-v2-eyebrow.sky { color:#7dd3fc; }
  .stand-v2-eyebrow.amber { color:#fcd34d; }
  .stand-v2-board-head h2 { margin:0; color:white; font-size:clamp(16px,1.15vw,22px); font-weight:900; }
  .stand-v2-count { padding:5px 9px; border-radius:999px; color:#cbd5e1; background:rgba(15,23,42,.9); font-size:12px; font-weight:800; }
  .stand-v2-list { display:flex; flex-direction:column; gap:7px; padding-top:10px; }
  .stand-v2-row { display:flex; align-items:center; min-width:0; min-height:49px; gap:10px; padding:5px 10px; border:1px solid rgba(148,163,184,.13); border-radius:12px; background:rgba(2,8,23,.55); }
  .stand-v2-row.first { border-color:rgba(250,204,21,.4); background:linear-gradient(90deg,rgba(250,204,21,.12),rgba(2,8,23,.55)); }
  .stand-v2-rank { display:flex; flex:0 0 30px; align-items:center; justify-content:center; width:30px; height:30px; border-radius:50%; color:#cbd5e1; background:#1e293b; font-size:14px; font-weight:900; }
  .stand-v2-rank.gold { color:#111827; background:#facc15; }
  .stand-v2-rank.silver { color:#111827; background:#cbd5e1; }
  .stand-v2-rank.bronze { color:white; background:#b45309; }
  .stand-v2-name { flex:1; min-width:0; overflow:hidden; color:#f8fafc; font-size:clamp(13px,.95vw,17px); font-weight:750; text-overflow:ellipsis; white-space:nowrap; }
  .stand-v2-score { flex:0 0 auto; font-size:clamp(14px,1vw,18px); font-weight:950; }
  .stand-v2-metric { flex:0 0 auto; min-width:56px; text-align:right; color:#cbd5e1; font-size:12px; font-variant-numeric:tabular-nums; }
  .sky-track .stand-v2-score { color:#7dd3fc; }
  .amber-track .stand-v2-score { color:#fcd34d; }
  .stand-v2-empty { display:flex; flex:1; min-height:250px; flex-direction:column; align-items:center; justify-content:center; text-align:center; color:#94a3b8; }
  .stand-v2-empty span { margin-bottom:12px; font-size:42px; }
  .stand-v2-empty strong { color:#e2e8f0; font-size:18px; }
  .stand-v2-empty p { margin:6px 0 0; font-size:13px; }
  @media (min-width:1200px) and (min-height:760px) {
    .stand-v2 { display:flex; flex-direction:column; box-sizing:border-box; height:100vh; min-height:0; overflow:hidden; padding:20px 26px; }
    .stand-v2-header { box-sizing:border-box; flex:0 0 88px; min-height:88px; height:88px; padding-bottom:12px; }
    .stand-v2-grid { flex:1 1 0; height:auto; min-height:0; padding-top:18px; gap:18px; }
    .stand-v2-track { min-height:0; height:100%; grid-template-columns:minmax(245px,.82fr) minmax(0,1.18fr); gap:14px; padding:16px; }
    .stand-v2-qr-frame { width:min(100%, min(330px, 34vh)); }
    .stand-v2-list { gap:7px; }
    .stand-v2-row { min-height:clamp(43px,5.2vh,56px); }
  }
  @media (max-width:1199px) {
    .stand-v2-header { flex-wrap:wrap; }
    .stand-v2-grid { grid-template-columns:1fr; }
    .stand-v2-track { min-height:560px; }
  }
  @media (max-width:700px) {
    .stand-v2 { padding:14px; }
    .stand-v2-header { gap:12px; }
    .stand-v2-brand img { max-width:130px; }
    .stand-v2-wordmark strong { font-size:14px; }
    .stand-v2-headline h1 { font-size:22px; }
    .stand-v2-headline p { font-size:12px; }
    .stand-v2-actions { width:100%; justify-content:space-between; }
    .stand-v2-track { grid-template-columns:1fr; min-height:0; }
    .stand-v2-qr-frame { width:min(100%,260px); }
  }

  .stand-v2-task-description {
    width:100%;
    max-width:390px;
    box-sizing:border-box;
    margin-top:13px;
    padding:11px 13px;
    border-radius:12px;
    font-size:clamp(12px,.82vw,15px);
    line-height:1.4;
    font-weight:550;
    text-align:center;
  }
  .stand-v2-task-description.sky-description {
    color:#dbeafe;
    border:1px solid rgba(56,189,248,.25);
    background:rgba(14,116,144,.14);
  }
  .stand-v2-task-description.amber-description {
    color:#fef3c7;
    border:1px solid rgba(245,158,11,.25);
    background:rgba(146,64,14,.14);
  }
`;

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

const pickOne = (items) => items[Math.floor(Math.random() * items.length)];

const buildElektroFeedback = (answers) => {
  const wrongSelected = ELEKTRO_SYSTEMS.filter(item => !item.isCorrect && answers[item.id]);
  const missedCorrect = ELEKTRO_SYSTEMS.filter(item => item.isCorrect && !answers[item.id]);
  const correctSelected = ELEKTRO_SYSTEMS.filter(item => item.isCorrect && answers[item.id]).length;
  const errors = wrongSelected.length + missedCorrect.length;
  const humor = errors === 0
    ? ["Full klaff. Brannkonseptet kan få gå hjem litt tidligere.", "Imponerende. Du har tydeligvis lest mer enn møtereferatet.", "Alle riktige! ITB-koordinatoren fikk akkurat en rolig puls."]
    : errors <= 2
      ? ["Nesten helt i mål. Bare et par signaler gikk seg bort i systemskjemaet.", "Godt forsøk. Det gjenstår bare noen små avklaringer – klassisk prosjektering.", "Du er nær. Ett kort tverrfaglig møte burde holde."]
      : ["Her hadde avviksmøtet blitt litt lengre enn planlagt.", "Brannmodus ble aktivert, men svarene tok en liten omvei via teknisk rom.", "Det er potensial her. La oss kalle det en tidligfase-leveranse."];
  const details = [
    ...wrongSelected.map(item => ({
      ok: false,
      label: item.label,
      explanation: ({
        coffee: "Vanlige stikkontakter til kaffetrakter er normalt ikke et system som skal styres av brannalarmen. Kaffepausen er ikke en brannfunksjon.",
        snow_melt: "Utvendig gatevarme inngår normalt ikke i byggets brannstyringssekvens. Den kan fortsette å gjøre jobben sin uavhengig av brannalarmen.",
        temp_control: "Vanlig temperaturregulering er ikke i seg selv en brannfunksjon. Det er ventilasjonens og øvrige brannstrategiske funksjoner som må håndteres etter brannkonseptet.",
        sprinkler: "Sprinkleranlegget er et selvstendig slokkesystem som normalt aktiveres lokalt av varme – ikke et system som skal startes av brannalarmanlegget."
      })[item.id] || "Dette systemet inngår normalt ikke som en generell styring fra brannalarmanlegget. Endelig funksjon må følge brannkonseptet."
    })),
    ...missedCorrect.map(item => ({
      ok: false,
      label: item.label,
      explanation: ({
        audio: "Talevarsling må kunne gi relevant evakueringsinformasjon ved brann, der dette er en del av byggets brannstrategi.",
        transmitter: "Alarmsenderen formidler brannalarm videre til alarmmottak/sentral, når dette er prosjektert som del av løsningen.",
        emergency_light: "Nødlys skal ivareta sikker rømning ved bortfall av normal belysning eller andre definerte hendelser. Brannalarm kan inngå i styringen av relevante funksjoner.",
        music: "Bakgrunnsmusikk/lydanlegg må normalt dempes eller kobles ut slik at talevarsling og brannmeldinger ikke overdøves.",
        door_access: "Adgangskontrollerte dører i rømningsveier må frigjøres eller settes i definert sikker tilstand slik at personer kan rømme.",
        lighting: "Lysstyring kan måtte overstyres slik at rømningsveier og relevante arealer får nødvendig belysning.",
        fire_curtain: "Branngardiner kan være del av brannseksjonering og må utløses/styres i henhold til brannstrategien.",
        vent_unit: "Ventilasjonsaggregater kan måtte stoppe eller gå i særskilt brannmodus for å begrense røykspredning.",
        fire_damper: "Brannspjeld må lukke eller styres i henhold til branncelle- og seksjoneringsstrategien.",
        elevator: "Heiser skal normalt gå til definert plan og tas ut av vanlig bruk ved brann, med eventuelle unntak for brannmannsheis.",
        smoke_vent: "Røykluker kan inngå i røykventilasjonen og må styres etter den prosjekterte brannstrategien."
      })[item.id] || "Dette systemet kan ha en definert funksjon i brannstrategien og må inngå i riktig alarm-/styringssekvens."
    }))
  ];
  return {
    title: errors === 0 ? "Treffsikker brannmodus!" : errors <= 2 ? "Nesten samordnet!" : "Her trengs en tverrfaglig runde",
    humor: pickOne(humor),
    summary: `Du traff ${correctSelected} av ${ELEKTRO_SYSTEMS.filter(item => item.isCorrect).length} riktige systemer og hadde ${errors} avvik.`,
    details
  };
};

const buildByggFeedback = (distance, choices) => {
  const details = [];
  const design = BRIDGE_DESIGNS.find(item => item.id === choices.design);
  const material = BRIDGE_MATERIALS.find(item => item.id === choices.material);
  const support = BRIDGE_SUPPORTS.find(item => item.id === choices.support);
  const deck = BRIDGE_DECKS.find(item => item.id === choices.deck);
  if (design?.capacityFactor < 0.7) details.push({ok:false,label:"Bæresystem",explanation:"En enkel bjelkebro har lavere kapasitet i denne forenklede simuleringen enn fagverksalternativene. Fagverk kan føre krefter mer effektivt gjennom strekk og trykk i stavene."});
  if (choices.design === "pratt_truss" && !choices.diagonals) details.push({ok:false,label:"Manglende diagonaler",explanation:"Uten diagonale strekkstag mister Pratt-fagverket en viktig del av lastveien og får betydelig redusert kapasitet i modellen."});
  if (material?.capMod < 0.9) details.push({ok:false,label:"Materialvalg",explanation:`${material.name} er gitt lavere kapasitetsfaktor i denne modellen. Materialstyrke, stivhet, egenvekt og dimensjonering må vurderes samlet.`});
  if (material?.weightMod > 1.2) details.push({ok:false,label:"Egenvekt",explanation:"Et tungt materiale øker konstruksjonens egenlast. Da går mer av kapasiteten med til å bære selve broen før trafikklasten kommer."});
  if (support?.capMod === 1) details.push({ok:false,label:"Opplegg",explanation:"Fritt opplagt løsning har lavere kapasitetsfaktor enn fast innspenning eller midtpilar i denne forenklede modellen. Reelle opplegg må dimensjoneres for reaksjonskrefter og stabilitet."});
  if (deck?.weightMod > 1.1) details.push({ok:false,label:"Dekke",explanation:"Det tunge samvirkedekket gir større egenlast. Det kan være en god løsning, men bæresystemet må dimensjoneres for vekten."});
  if (choices.thickness < 30) details.push({ok:false,label:"Profiltykkelse",explanation:"Lav profiltykkelse reduserer kapasiteten i simuleringen. Større tverrsnitt kan øke bæreevnen, men gir også mer materialbruk og egenvekt."});
  if (distance >= 12) {
    return {
      title: pickOne(["Broen holder – og det gjør du også.", "Godkjent for trafikk (i denne simuleringen).", "En sjelden sak uten behov for avklaringsmøte."]),
      humor: pickOne(["Lastebilen kom over. RIB kan beholde kaffekoppen.", "Ingen dramatisk kollaps. Litt skuffende for publikum, svært bra for trafikksikkerheten.", "Du har levert en bro som holder. Nå gjenstår bare FDV-dokumentasjonen."]),
      summary: "Kjøretøyet passerte hele spennet på 12 meter.",
      details: details.length ? details : [{ok:true,label:"Konstruksjonen",explanation:"Valgene dine ga tilstrekkelig kapasitet i denne forenklede testen. I virkeligheten kreves full dimensjonering av blant annet brudd, bruksgrense, stabilitet, utmatting og fundamentering."}]
    };
  }
  if (!details.length) details.push({ok:false,label:"Samlet bæreevne",explanation:"Kombinasjonen av last, spenn og konstruksjonskapasitet var ikke tilstrekkelig i simuleringen. Små endringer i flere parametere kan påvirke resultatet."});
  return {
    title: pickOne(["Broen ba om en omprosjektering.", "Det ble en kort brokarriere.", "Lastebilen må dessverre snu."]),
    humor: pickOne(["Det blir en avviksrapport – og muligens en ny fergerute.", "Kollapsen var spektakulær. Prosjekteringsgrunnlaget var mindre imponerende.", "Vi foreslår en liten tverrfaglig gjennomgang før neste lastebilbestilling."]),
    summary: `Broen sviktet etter ${distance.toFixed(1)} av 12 meter.`,
    details
  };
};

const INTRO_TEXTS = {
  elektro: "⚡ Brannalarm i et kontorbygg! Hvilke tekniske systemer mener du skal reagere? Tenk på hvordan bygget går i brannmodus – flere svar kan være riktige.",
  bygg: "🏗️ Brobyggermesteren: En 24-tonns lastebil skal over et 12 meter langt gjel. Velg bæresystem, materiale, opplegg, dekke og profiltykkelse. Klarer du å få bilen trygt over – eller blir det en spektakulær kollaps?"
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

  // Leaderboards persist on the display browser until manually cleared.
  const [elektroLeaderboard, setElektroLeaderboard] = useState(() => {
    try { return JSON.parse(safeStorage.getItem('standquiz_elektro_leaderboard') || '[]'); } catch { return []; }
  });
  const [byggLeaderboard, setByggLeaderboard] = useState(() => {
    try { return JSON.parse(safeStorage.getItem('standquiz_bygg_leaderboard') || '[]'); } catch { return []; }
  });

  useEffect(() => {
    safeStorage.setItem('standquiz_elektro_leaderboard', JSON.stringify(elektroLeaderboard));
  }, [elektroLeaderboard]);

  useEffect(() => {
    safeStorage.setItem('standquiz_bygg_leaderboard', JSON.stringify(byggLeaderboard));
  }, [byggLeaderboard]);

  // Mobile Quiz & Simulator State
  const [step, setStep] = useState('start'); // 'start', 'quiz', 'result'
  const [participantName, setParticipantName] = useState('');
  const [selectedItems, setSelectedItems] = useState({});
  const [timeSeconds, setTimeSeconds] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [finalTime, setFinalTime] = useState(0);
  const [finalDistance, setFinalDistance] = useState(0);
  const [resultFeedback, setResultFeedback] = useState(null);

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
            if (entry && entry.action === 'reset_leaderboards') {
              setElektroLeaderboard([]);
              setByggLeaderboard([]);
              safeStorage.setItem('standquiz_elektro_leaderboard', '[]');
              safeStorage.setItem('standquiz_bygg_leaderboard', '[]');
            } else if (entry && entry.name && entry.track) {
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

  const handleResetLeaderboards = async () => {
    if (!window.confirm('Vil du nullstille begge topplistene? Dette kan ikke angres.')) return;

    setElektroLeaderboard([]);
    setByggLeaderboard([]);
    safeStorage.setItem('standquiz_elektro_leaderboard', '[]');
    safeStorage.setItem('standquiz_bygg_leaderboard', '[]');

    try {
      await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_leaderboards', timestamp: Date.now() })
      });
    } catch (err) {
      console.warn('Could not broadcast leaderboard reset:', err);
    }
  };

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
    const feedback = track === 'bygg'
      ? buildByggFeedback(distance, { design: selectedDesign, material: selectedMaterial, support: selectedSupport, deck: selectedDeck, thickness: profileThickness, diagonals: includeDiagonals })
      : buildElektroFeedback(selectedItems);
    setResultFeedback(feedback);
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
    setResultFeedback(null);
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
      <div className="standquiz-shell min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 font-sans">
        <style>{APP_THEME_CSS}</style>
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
    const renderLeaderboard = (entries, type) => {
      const isElektro = type === 'elektro';
      const accent = isElektro ? 'text-sky-300' : 'text-amber-300';
      const scoreColor = isElektro ? 'text-sky-300' : 'text-amber-300';
      return (
        <div className="stand-v2-board">
          <div className="stand-v2-board-head">
            <div>
              <div className={isElektro ? 'stand-v2-eyebrow sky' : 'stand-v2-eyebrow amber'}>DAGENS TOPPLISTE</div>
              <h2>{isElektro ? 'Elektro & ITB' : 'Bygg & Statikk'}</h2>
            </div>
            <span className="stand-v2-count">{entries.length}/10</span>
          </div>
          <div className="stand-v2-list">
            {entries.length === 0 ? (
              <div className="stand-v2-empty">
                <span>{isElektro ? '⚡' : '🏗️'}</span>
                <strong>Topplisten venter på deg</strong>
                <p>Bli den første som setter dagens rekord!</p>
              </div>
            ) : entries.slice(0, 10).map((entry, idx) => (
              <div key={entry.id || idx} className={idx === 0 ? 'stand-v2-row first' : 'stand-v2-row'}>
                <div className={idx === 0 ? 'stand-v2-rank gold' : idx === 1 ? 'stand-v2-rank silver' : idx === 2 ? 'stand-v2-rank bronze' : 'stand-v2-rank'}>
                  {idx + 1}
                </div>
                <div className="stand-v2-name">{entry.name || 'Anonym deltaker'}</div>
                <div className={'stand-v2-score ' + scoreColor}>{entry.score}/{isElektro ? 11 : 12}</div>
                <div className="stand-v2-metric">{isElektro ? (entry.timeUsed || 0) + ' sek' : ((entry.distanceMeters || 0).toFixed(1) + ' m')}</div>
              </div>
            ))}
          </div>
        </div>
      );
    };

    const renderTrack = (type) => {
      const isElektro = type === 'elektro';
      const title = isElektro ? 'ELEKTRO & ITB' : 'BYGG & STATIKK';
      const qr = isElektro ? elektroQrUrl : byggQrUrl;
      const subtitle = isElektro ? 'Brannalarm og bygningsautomasjon' : 'Brobygging og bæreevne';
      return (
        <section className={isElektro ? 'stand-v2-track sky-track' : 'stand-v2-track amber-track'}>
          <div className="stand-v2-qr-panel">
            <div className="stand-v2-track-title">
              <span>{isElektro ? '⚡' : '🏗️'}</span>
              <h2>{title}</h2>
            </div>
            <p>{subtitle}</p>
            <div className="stand-v2-qr-frame">
              <img src={qr} alt={'QR-kode for ' + title} />
            </div>
            <div className="stand-v2-scan">SKANN QR-KODEN · START UTFORDRINGEN</div>
            <div className={isElektro ? 'stand-v2-task-description sky-description' : 'stand-v2-task-description amber-description'}>
              {isElektro
                ? 'Finn hvilke tekniske bygningssystemer som skal påvirkes eller gå i brannmodus når brannalarmen utløses. Velg alle riktige.'
                : 'Bygg en bro ved å velge bæresystem, materiale, opplegg og dekke. Klarer den en 24-tonns lastebil over spennet?'}
            </div>
          </div>
          {renderLeaderboard(isElektro ? elektroLeaderboard : byggLeaderboard, type)}
        </section>
      );
    };

    return (
      <div className="standquiz-shell stand-v2">
        <style>{APP_THEME_CSS}</style>
        <header className="stand-v2-header">
          <input type="file" ref={fileInputRef} accept="image/*" onChange={handleLogoUpload} className="hidden" />
          <div className="stand-v2-brand" onClick={() => fileInputRef.current && fileInputRef.current.click()} title="Klikk for å velge logo">
            {logoUrl ? (
              <img src={logoUrl} alt="NIRAS-logo" />
            ) : (
              <div className="stand-v2-wordmark"><span>NIRAS</span><strong>STUDENTUTFORDRING</strong></div>
            )}
          </div>
          <div className="stand-v2-headline">
            <h1>Velg din utfordring</h1>
            <p>Skann QR-koden, test deg selv og kom på dagens toppliste.</p>
          </div>
          <div className="stand-v2-actions">
            <div className="stand-v2-live"><i /> LIVE</div>
            <button type="button" onClick={handleResetLeaderboards}><RefreshIcon className="w-4 h-4" /> Nullstill</button>
          </div>
        </header>
        <main className="stand-v2-grid">
          {renderTrack('elektro')}
          {renderTrack('bygg')}
        </main>
      </div>
    );
  }

  const maxPossibleScore = track === 'bygg' ? 12 : 11;

  return (
    <div className="standquiz-shell standquiz-mobile min-h-screen bg-slate-950 text-slate-100 flex flex-col p-4 font-sans max-w-lg mx-auto relative">
      <style>{APP_THEME_CSS}</style>
      
      {/* Participant Header */}
      <div className="standquiz-panel bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between mb-4 shadow-lg">
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
        <div className="standquiz-panel bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-6">
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
        <div className="standquiz-panel bg-slate-900 p-5 rounded-3xl border border-slate-800 shadow-xl space-y-5">
          <div>
            <h2 className="text-base font-bold text-white mb-1">
              Brannalarm i et kontorbygg – hvilke systemer reagerer?
            </h2>
            <p className="text-xs text-slate-400">
              Tenk på byggets brannmodus. Huk av for alle systemer du mener skal påvirkes. Flere svar kan være riktige!
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
        <div className="standquiz-panel bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-6 text-center">
          <div className="inline-flex p-4 bg-amber-500/10 rounded-full border border-amber-500/30 text-amber-400 mb-1">
            <TrophyIcon className="w-12 h-12" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-white mb-1">{resultFeedback?.title || `Gratulerer, ${participantName}!`}</h2>
            <p className="text-xs text-slate-500 mb-2">Resultat for {participantName}</p>
            <p className="text-sm text-amber-300 font-semibold">{resultFeedback?.humor}</p>
            <p className="text-xs text-slate-400 mt-2">{resultFeedback?.summary}</p>
          </div>

          {resultFeedback?.details?.length > 0 && (
            <div className="text-left bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="text-xs uppercase tracking-wider font-black text-slate-300">Faglig tilbakemelding</h3>
              {resultFeedback.details.map((item, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <span className={`mt-0.5 flex-shrink-0 font-black ${item.ok ? 'text-emerald-400' : 'text-amber-400'}`}>{item.ok ? '✓' : '!'}</span>
                  <div>
                    <p className="text-xs font-bold text-white">{item.label}</p>
                    <p className="text-xs leading-relaxed text-slate-400">{item.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

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
