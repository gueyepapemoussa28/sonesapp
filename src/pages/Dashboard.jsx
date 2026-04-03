// src/pages/Dashboard.js
import React from 'react';
import { Section, KpiCard, AlertItem, FuelBar, SiteSelector } from '../components/UI.jsx';
import { getLatest, getPrev, getDelta, computeAlerts } from '../utils/store.js';

export default function Dashboard({ state, currentSite, onSelectSite }) {
  const { sites, saisies } = state;
  const site = sites[currentSite];
  const latest = getLatest(saisies, site.id);
  const prev = getPrev(saisies, site.id);
  const alerts = computeAlerts(sites, saisies);
  const siteAlerts = alerts.filter(a => a.site === site.name);

  const pressVariant = !latest ? 'default' : latest.pression < 2 ? 'alert' : 'ok';
  const carbVariant = !latest ? 'default' : latest.carburant <= 10 ? 'alert' : latest.carburant <= 20 ? 'warn' : 'ok';

  return (
    <div>
      <SiteSelector sites={sites} current={currentSite} onSelect={onSelectSite} />

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        <KpiCard
          label="Pression"
          value={latest?.pression ?? '—'}
          unit="bars"
          delta={latest && prev ? getDelta(latest, prev, 'pression') : null}
          deltaLabel="vs hier"
          variant={pressVariant}
        />
        <KpiCard
          label="Carburant GE"
          value={latest?.carburant ?? '—'}
          unit="%"
          delta={latest && prev ? getDelta(latest, prev, 'carburant') : null}
          deltaLabel="% vs hier"
          variant={carbVariant}
        />
        <KpiCard
          label="Compteur eau"
          value={latest?.cpt_eau?.toLocaleString('fr') ?? '—'}
          unit="m³"
          delta={latest && prev ? getDelta(latest, prev, 'cpt_eau') : null}
          deltaLabel="m³ aujourd'hui"
          variant="default"
        />
        <KpiCard
          label="k1 énergie"
          value={latest?.k1 ?? '—'}
          unit="kWh"
          delta={latest && prev ? getDelta(latest, prev, 'k1') : null}
          deltaLabel="vs hier"
          variant="default"
        />
      </div>

      {/* Alerts */}
      <Section icon="⚠" iconBg="#FEF0E5" title="Alertes du site">
        {siteAlerts.length === 0
          ? <p style={{ fontSize: 13, color: '#667085' }}>✅ Aucune alerte active pour ce site</p>
          : siteAlerts.map((a, i) => <AlertItem key={i} {...a} />)
        }
      </Section>

      {/* Fuel */}
      <Section icon="⛽" iconBg="#FEF0E5" title="Niveau carburant groupe électrogène">
        {latest ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 13, color: '#667085' }}>Réservoir</span>
              <span style={{
                fontSize: 22, fontWeight: 700, fontFamily: "'Space Mono', monospace",
                color: latest.carburant <= 20 ? '#D92D20' : '#027A48'
              }}>{latest.carburant}%</span>
            </div>
            <FuelBar value={latest.carburant} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <span style={{ fontSize: 12, color: '#667085' }}>Cpt GE: {latest.ge_h} h</span>
              <span style={{ fontSize: 12, color: '#667085' }}>Marche aujourd'hui: {latest.ge_marche} h</span>
            </div>
          </>
        ) : <p style={{ fontSize: 13, color: '#667085' }}>Aucune donnée</p>}
      </Section>

      {/* Energy */}
      <Section icon="⚡" iconBg="#E8F2FF" title="Énergie — dernière saisie">
        {latest ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[['k1', latest.k1, 'kWh'], ['k2', latest.k2, 'kWh'], ['kvar', latest.kvar, 'kvar'], ['cos φ', latest.cosphi, '']].map(([l, v, u]) => (
              <div key={l} style={{ background: '#E8F2FF', borderRadius: 10, padding: 10 }}>
                <div style={{ fontSize: 11, color: '#0057A8', fontWeight: 600 }}>{l}</div>
                <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Space Mono', monospace", color: '#003d7a' }}>
                  {v}<span style={{ fontSize: 11 }}> {u}</span>
                </div>
              </div>
            ))}
          </div>
        ) : <p style={{ fontSize: 13, color: '#667085' }}>Aucune donnée</p>}
      </Section>

      {/* Toutes les alertes */}
      {alerts.length > 0 && (
        <Section icon="🚨" iconBg="#FEE4E2" title={`Toutes les alertes (${alerts.length})`}>
          {alerts.map((a, i) => <AlertItem key={i} {...a} />)}
        </Section>
      )}
    </div>
  );
}
