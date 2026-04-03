// src/utils/store.js

const STORAGE_KEY = 'sitewatch_state_v2';

export const CREDENTIALS = { user: 'admin', pass: 'seneau2025' };

export const THRESHOLDS = {
  pression_min: 2.0,
  carburant_warn: 20,
  carburant_danger: 10,
  k1_max: 1200,
};

function generateDemoData() {
  const today = new Date();
  const saisies = {};
  [1, 2, 3].forEach(sid => {
    saisies[sid] = [];
    for (let d = 13; d >= 0; d--) {
      const dt = new Date(today);
      dt.setDate(dt.getDate() - d);
      const dateStr = dt.toISOString().split('T')[0];
      const carbBase = sid === 3 ? 15 : 80;
      saisies[sid].push({
        date: dateStr,
        heure: `0${6 + Math.floor(Math.random() * 2)}:${String(20 + Math.floor(Math.random() * 40)).padStart(2, '0')}`,
        cpt_h: parseFloat((1200 + (13 - d) * 24 + Math.random() * 5).toFixed(1)),
        cpt_eau: Math.round(45000 + (13 - d) * 150 + Math.random() * 80),
        pression: sid === 1 && d === 0 ? 1.6 : parseFloat((2.2 + Math.random() * 1.5).toFixed(2)),
        k1: parseFloat((800 + (13 - d) * 18 + Math.random() * 40).toFixed(1)),
        k2: parseFloat((400 + (13 - d) * 9 + Math.random() * 20).toFixed(1)),
        kvar: parseFloat((120 + Math.random() * 40).toFixed(1)),
        cosphi: parseFloat((0.88 + Math.random() * 0.09).toFixed(3)),
        ge_h: Math.round(200 + (13 - d) * 3 + Math.random() * 2),
        ge_marche: parseFloat((Math.random() * 5).toFixed(1)),
        carburant: Math.max(5, Math.round(carbBase - d * (sid === 3 ? 0 : 4) + Math.random() * 5)),
        obs: '',
      });
    }
  });
  return saisies;
}

const DEFAULT_STATE = {
  sites: [
    { id: 1, name: 'Forage F2 Kolda', loc: 'Kolda', status: 'online' },
    { id: 2, name: 'Station SP3 Ziguinchor', loc: 'Ziguinchor', status: 'online' },
    { id: 3, name: 'Forage F1 Kaolack', loc: 'Kaolack', status: 'warn' },
  ],
  saisies: generateDemoData(),
};

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_STATE;
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Storage error', e);
  }
}

export function getLatest(saisies, siteId) {
  const rows = saisies[siteId] || [];
  return rows[rows.length - 1] || null;
}

export function getPrev(saisies, siteId) {
  const rows = saisies[siteId] || [];
  return rows[rows.length - 2] || null;
}

export function getDelta(latest, prev, field) {
  if (!prev || latest[field] === undefined) return null;
  return parseFloat((latest[field] - prev[field]).toFixed(3));
}

export function computeAlerts(sites, saisies) {
  const alerts = [];
  sites.forEach(site => {
    const latest = getLatest(saisies, site.id);
    if (!latest) return;
    if (latest.pression < THRESHOLDS.pression_min)
      alerts.push({ type: 'danger', icon: '🚨', site: site.name, text: `Pression critique : ${latest.pression} bars`, sub: 'Seuil minimum : 2 bars' });
    if (latest.carburant <= THRESHOLDS.carburant_danger)
      alerts.push({ type: 'danger', icon: '⛽', site: site.name, text: `Carburant critique : ${latest.carburant}%`, sub: 'Ravitaillement urgent requis' });
    else if (latest.carburant <= THRESHOLDS.carburant_warn)
      alerts.push({ type: 'warning', icon: '⛽', site: site.name, text: `Carburant faible : ${latest.carburant}%`, sub: 'Prévoir ravitaillement' });
    if (latest.k1 > THRESHOLDS.k1_max)
      alerts.push({ type: 'warning', icon: '⚡', site: site.name, text: `k1 élevé : ${latest.k1} kWh`, sub: 'Surveiller la consommation' });
  });
  return alerts;
}
