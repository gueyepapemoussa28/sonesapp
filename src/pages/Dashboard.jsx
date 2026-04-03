import React from 'react';
import { Section, KpiCard, AlertItem, FuelBar, SiteSelector, StatusBadge, EmptyState } from '../components/UI.jsx';
import { getLatest, getPrev, getDelta, computeAlerts } from '../utils/store.js';

export default function Dashboard({ state, currentSite, onSelectSite }) {
  const { sites, saisies } = state;

  if (!sites.length) return (
    <EmptyState icon="🏗" title="Aucun site configuré" sub="Allez dans l'onglet Sites pour ajouter votre premier site." />
  );

  const site = sites[currentSite];
  const latest = getLatest(saisies, site.id);
  const prev = getPrev(saisies, site.id);
  const alerts = computeAlerts(sites, saisies);
  const siteAlerts = alerts.filter(a => a.site === site.name);

  const pressVariant = !latest ? 'default' : latest.pression < 2 ? 'alert' : 'ok';
  const carbVariant  = !latest ? 'default' : latest.carburant <= 10 ? 'alert' : latest.carburant <= 20 ? 'warn' : 'ok';

  return (
    <div>
      <SiteSelector sites={sites} current={currentSite} onSelect={onSelectSite} />

      {/* Site status card */}
      <div style={{
        background: 'linear-gradient(135deg, #003d7a 0%, #0057A8 100%)',
        borderRadius: 16, padding: '16px 18px', marginBottom: 14,
        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 4px 16px rgba(0,57,122,0.3)'
      }}>
        <div>
          <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Site actif</div>
          <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.3px' }}>{site.name}</div>
          <div style={{ fontSize: 11, opacity: 0.7, marginTop: 3 }}>
            {site.loc} {latest ? `· Dernière saisie ${latest.date}` : '· Aucune saisie'}
          </div>
        </div>
        <StatusBadge status={site.status} />
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        <KpiCard
          label="Pression"
          value={latest?.pression ?? '—'}
          unit="bars"
          icon="🌡"
          delta={latest && prev ? getDelta(latest, prev, 'pression') : null}
          deltaLabel="vs hier"
          variant={pressVariant}
        />
        <KpiCard
          label="Carburant GE"
          value={latest?.carburant ?? '—'}
          unit="%"
          icon="⛽"
          delta={latest && prev ? getDelta(latest, prev, 'carburant') : null}
          deltaLabel="% vs hier"
          variant={carbVariant}
        />
        <KpiCard
          label="Compteur eau"
          value={latest?.cpt_eau?.toLocaleString('fr') ?? '—'}
          unit="m³"
          icon="💧"
          delta={latest && prev ? getDelta(latest, prev, 'cpt_eau') : null}
          deltaLabel="m³ aujourd'hui"
        />
        <KpiCard
          label="k1 énergie"
          value={latest?.k1 ?? '—'}
          unit="kWh"
          icon="⚡"
          delta={latest && prev ? getDelta(latest, prev, 'k1') : null}
          deltaLabel="vs hier"
        />
      </div>

      {/* Alerts */}
      {siteAlerts.length > 0 && (
        <Section icon="⚠" iconBg="#FEF0E5" title="Alertes du site">
          {siteAlerts.map((a, i) => <AlertItem key={i} {...a} />)}
        </Section>
      )}

      {/* Fuel bar */}
      <Section icon="⛽" iconBg="#FEF0E5" title="Niveau carburant">
        {latest ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
              <span style={{ fontSize: 12, color: '#667085' }}>Réservoir</span>
              <span style={{
                fontSize: 26, fontWeight: 800, fontFamily: "'Space Mono', monospace",
                color: latest.carburant <= 20 ? '#D92D20' : '#027A48'
              }}>{latest.carburant}<span style={{ fontSize: 14, fontWeight: 400 }}>%</span></span>
            </div>
            <FuelBar value={latest.carburant} />
            <div style={{
              display: 'flex', justifyContent: 'space-between', marginTop: 12,
              padding: '10px 14px', background: '#F9FAFB', borderRadius: 10
            }}>
              <div>
                <div style={{ fontSize: 10, color: '#667085', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cpt GE</div>
                <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'Space Mono', monospace", color: '#0057A8' }}>{latest.ge_h} h</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10, color: '#667085', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Marche aujourd'hui</div>
                <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'Space Mono', monospace", color: '#0057A8' }}>{latest.ge_marche} h</div>
              </div>
            </div>
          </>
        ) : <EmptyState icon="⛽" title="Aucune donnée" sub="Faites une saisie pour voir les données." />}
      </Section>

      {/* Energy */}
      <Section icon="⚡" iconBg="#EBF3FF" title="Énergie — dernière saisie">
        {latest ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { label: 'k1', value: latest.k1, unit: 'kWh', color: '#0057A8', bg: '#EBF3FF' },
              { label: 'k2', value: latest.k2, unit: 'kWh', color: '#00917C', bg: '#E0F5F1' },
              { label: 'kvar', value: latest.kvar, unit: 'kvar', color: '#F4720B', bg: '#FFF4EC' },
              { label: 'cos φ', value: latest.cosphi, unit: '', color: '#344054', bg: '#F9FAFB' },
            ].map(({ label, value, unit, color, bg }) => (
              <div key={label} style={{
                background: bg, borderRadius: 12, padding: '12px 14px',
                border: `1px solid ${color}22`
              }}>
                <div style={{ fontSize: 10, color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Space Mono', monospace", color, lineHeight: 1 }}>
                  {value}<span style={{ fontSize: 10, fontWeight: 400, marginLeft: 2 }}>{unit}</span>
                </div>
              </div>
            ))}
          </div>
        ) : <EmptyState icon="⚡" title="Aucune donnée" />}
      </Section>

      {/* Global alerts */}
      {alerts.length > 0 && (
        <Section icon="🚨" iconBg="#FFF1F0" title={`Toutes les alertes (${alerts.length})`}>
          {alerts.map((a, i) => <AlertItem key={i} {...a} />)}
        </Section>
      )}
    </div>
  );
}
