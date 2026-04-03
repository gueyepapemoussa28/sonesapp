// src/pages/Graphiques.js
import React, { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { Section, SiteSelector } from '../components/UI.jsx';

const CHART_TYPES = [
  { key: 'pression', label: 'Pression', color: '#0057A8', unit: 'bars', refLine: 2 },
  { key: 'cpt_eau_delta', label: 'Production eau', color: '#00917C', unit: 'm³/j', refLine: null },
  { key: 'carburant', label: 'Carburant', color: '#F4720B', unit: '%', refLine: 20 },
  { key: 'k1', label: 'Énergie k1', color: '#7C3AED', unit: 'kWh', refLine: null },
];

export default function Graphiques({ state, currentSite, onSelectSite }) {
  const { sites, saisies } = state;
  const [activeChart, setActiveChart] = useState('pression');

  if (!sites.length) return (
    <div style={{ textAlign: 'center', padding: '48px 20px', color: '#667085' }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>📈</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#344054', marginBottom: 6 }}>Aucun site configuré</div>
      <div style={{ fontSize: 12 }}>Ajoutez un site dans l'onglet Sites pour voir les graphiques.</div>
    </div>
  );

  const site = sites[currentSite];

  const rows = (saisies[site.id] || []).slice(-14);

  const data = rows.map((r, i) => ({
    date: r.date.slice(5),
    pression: r.pression,
    carburant: r.carburant,
    k1: r.k1,
    k2: r.k2,
    kvar: r.kvar,
    cosphi: r.cosphi,
    cpt_eau_delta: i > 0 ? r.cpt_eau - rows[i - 1].cpt_eau : 0,
    ge_marche: r.ge_marche,
  }));

  const active = CHART_TYPES.find(c => c.key === activeChart) || CHART_TYPES[0];

  const tabStyle = (key) => ({
    padding: '6px 14px', borderRadius: 20, cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
    fontSize: 12, fontWeight: 600, border: key === activeChart ? 'none' : '1px solid #E4E7EC',
    background: key === activeChart ? '#0057A8' : 'white',
    color: key === activeChart ? 'white' : '#1D2939',
  });

  return (
    <div>
      <SiteSelector sites={sites} current={currentSite} onSelect={onSelectSite} />

      {/* Main chart */}
      <Section icon="📈" iconBg="#E8F2FF" title="Évolution 14 jours">
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
          {CHART_TYPES.map(c => (
            <button key={c.key} onClick={() => setActiveChart(c.key)} style={tabStyle(c.key)}>
              {c.label}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: '100%', height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#667085' }} />
              <YAxis tick={{ fontSize: 10, fill: '#667085' }} />
              <Tooltip
                contentStyle={{ borderRadius: 10, border: '1px solid #E4E7EC', fontSize: 12 }}
                formatter={v => [`${v} ${active.unit}`, active.label]}
              />
              {active.refLine && (
                <ReferenceLine y={active.refLine} stroke="#D92D20" strokeDasharray="4 4"
                  label={{ value: `Seuil: ${active.refLine}`, fill: '#D92D20', fontSize: 10 }} />
              )}
              <Line
                type="monotone" dataKey={active.key}
                stroke={active.color} strokeWidth={2.5}
                dot={{ r: 3, fill: active.color }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Section>

      {/* Energy multi-line */}
      <Section icon="⚡" iconBg="#E8F2FF" title="Énergie — k1, k2, kvar">
        <div style={{ position: 'relative', width: '100%', height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#667085' }} />
              <YAxis tick={{ fontSize: 10, fill: '#667085' }} />
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E4E7EC', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="k1" name="k1 (kWh)" fill="#0057A844" stroke="#0057A8" strokeWidth={1} radius={[4,4,0,0]} />
              <Bar dataKey="k2" name="k2 (kWh)" fill="#00917C44" stroke="#00917C" strokeWidth={1} radius={[4,4,0,0]} />
              <Bar dataKey="kvar" name="kvar" fill="#F4720B44" stroke="#F4720B" strokeWidth={1} radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Section>

      {/* GE runtime */}
      <Section icon="🔋" iconBg="#FEF0E5" title="Temps de marche groupe électrogène (h/j)">
        <div style={{ position: 'relative', width: '100%', height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#667085' }} />
              <YAxis tick={{ fontSize: 10, fill: '#667085' }} />
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E4E7EC', fontSize: 12 }}
                formatter={v => [`${v} h`, 'Marche GE']} />
              <Bar dataKey="ge_marche" name="GE (h)" fill="#F4720B" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Section>
    </div>
  );
}
