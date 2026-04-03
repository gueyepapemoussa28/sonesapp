import React, { useState } from 'react';
import { Section, StatusBadge } from '../components/UI.jsx';
import { exportDaily, exportMonthly } from '../utils/exportExcel.js';

export default function Rapports({ state, showToast }) {
  const { sites, saisies } = state;
  const [reportType, setReportType] = useState('daily');
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedSite, setSelectedSite] = useState('all');
  const [exporting, setExporting] = useState(false);

  if (!sites.length) return (
    <div style={{ textAlign: 'center', padding: '48px 20px', color: '#667085' }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#344054', marginBottom: 6 }}>Aucune donnée disponible</div>
      <div style={{ fontSize: 12 }}>Ajoutez des sites et des saisies pour générer des rapports.</div>
    </div>
  );

  const allRows = [];
  sites.forEach(site => {
    (saisies[site.id] || []).forEach(r => {
      allRows.push({ ...r, siteName: site.name });
    });
  });
  allRows.sort((a, b) => b.date.localeCompare(a.date));

  async function handleExport() {
    setExporting(true);
    try {
      // Filtrer les sites selon la sélection
      const targetSites = selectedSite === 'all'
        ? sites
        : sites.filter(s => String(s.id) === selectedSite);

      const targetSaisies = {};
      targetSites.forEach(s => { targetSaisies[s.id] = saisies[s.id] || []; });

      if (reportType === 'daily') {
        await exportDaily(targetSites, targetSaisies);
      } else {
        await exportMonthly(targetSites, targetSaisies, month);
      }
      showToast('📥 Rapport Excel généré avec succès');
    } catch (e) {
      showToast('❌ Erreur export: ' + e.message);
    } finally {
      setExporting(false);
    }
  }

  const selectStyle = {
    padding: '9px 12px', border: '1.5px solid #E4E7EC', borderRadius: 9,
    fontSize: 14, outline: 'none', background: 'white', width: '100%',
    fontFamily: "'Outfit', sans-serif"
  };
  const labelStyle = {
    fontSize: 11, fontWeight: 600, color: '#344054',
    textTransform: 'uppercase', letterSpacing: '0.4px',
    display: 'block', marginBottom: 4
  };

  return (
    <div>
      {/* Export */}
      <Section icon="📋" iconBg="#E8F2FF" title="Génération de rapports">

        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Site</label>
          <select value={selectedSite} onChange={e => setSelectedSite(e.target.value)} style={selectStyle}>
            <option value="all">Tous les sites</option>
            {sites.map(s => (
              <option key={s.id} value={String(s.id)}>{s.name}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Type de rapport</label>
          <select value={reportType} onChange={e => setReportType(e.target.value)} style={selectStyle}>
            <option value="daily">Synthèse complète (tous les jours)</option>
            <option value="monthly">Synthèse mensuelle</option>
          </select>
        </div>

        {reportType === 'monthly' && (
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Mois</label>
            <input type="month" value={month} onChange={e => setMonth(e.target.value)} style={selectStyle} />
          </div>
        )}

        <button onClick={handleExport} disabled={exporting} style={{
          width: '100%', marginTop: 4,
          background: exporting ? '#F2F4F7' : 'linear-gradient(135deg, #027A48, #00917C)',
          color: exporting ? '#667085' : 'white',
          border: 'none', borderRadius: 10, padding: '13px',
          fontSize: 14, fontWeight: 600,
          cursor: exporting ? 'not-allowed' : 'pointer',
          fontFamily: "'Outfit', sans-serif",
          boxShadow: exporting ? 'none' : '0 4px 12px rgba(2,122,72,0.25)'
        }}>
          {exporting ? '⏳ Génération en cours...' : '📥 Télécharger le rapport Excel'}
        </button>

        <p style={{ fontSize: 11, color: '#667085', marginTop: 10 }}>
          {selectedSite === 'all'
            ? `Inclut les ${sites.length} sites avec couleurs conditionnelles et statistiques.`
            : `Rapport pour : ${sites.find(s => String(s.id) === selectedSite)?.name}`
          }
        </p>
      </Section>

      {/* Résumé par site */}
      <Section icon="📊" iconBg="#E0F5F1" title="Résumé par site">
        {sites.map((site, idx) => {
          const rows = saisies[site.id] || [];
          const latest = rows[rows.length - 1];
          return (
            <div key={site.id} style={{
              padding: '12px 0',
              borderBottom: idx < sites.length - 1 ? '1px solid #F2F4F7' : 'none',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: '#101828' }}>{site.name}</span>
                  <StatusBadge status={site.status} />
                </div>
                <div style={{ fontSize: 11, color: '#667085' }}>
                  {rows.length} saisie{rows.length !== 1 ? 's' : ''}
                  {latest ? ` · Dernière : ${latest.date}` : ' · Aucune saisie'}
                </div>
              </div>
              {latest && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20,
                    background: latest.pression < 2 ? '#FFF1F0' : '#ECFDF3',
                    color: latest.pression < 2 ? '#D92D20' : '#027A48'
                  }}>
                    {latest.pression} bars
                  </span>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20,
                    background: latest.carburant < 20 ? '#FFF1F0' : '#ECFDF3',
                    color: latest.carburant < 20 ? '#D92D20' : '#027A48'
                  }}>
                    GE {latest.carburant}%
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </Section>

      {/* Historique */}
      <Section icon="📅" iconBg="#E8F2FF" title={`Historique des saisies (${allRows.length})`}>
        {allRows.length === 0
          ? <p style={{ fontSize: 13, color: '#667085' }}>Aucune saisie enregistrée</p>
          : allRows.slice(0, 30).map((r, i) => (
            <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid #F2F4F7' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#101828' }}>{r.siteName}</span>
                <span style={{ fontSize: 11, color: '#667085' }}>{r.date} {r.heure}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[
                  { label: `P: ${r.pression} bars`, warn: r.pression < 2 },
                  { label: `Eau: ${r.cpt_eau?.toLocaleString('fr')} m³`, warn: false },
                  { label: `GE: ${r.carburant}%`, warn: r.carburant < 20 },
                  { label: `k1: ${r.k1} kWh`, warn: false },
                ].map(({ label, warn }) => (
                  <span key={label} style={{
                    fontSize: 11, padding: '2px 7px', borderRadius: 20, fontWeight: 500,
                    background: warn ? '#FFF1F0' : '#F9FAFB',
                    color: warn ? '#D92D20' : '#344054'
                  }}>{label}</span>
                ))}
              </div>
              {r.obs && <div style={{ fontSize: 11, color: '#667085', marginTop: 4, fontStyle: 'italic' }}>{r.obs}</div>}
            </div>
          ))
        }
        {allRows.length > 30 && (
          <p style={{ fontSize: 12, color: '#667085', textAlign: 'center', marginTop: 8 }}>
            + {allRows.length - 30} saisies dans l'export Excel
          </p>
        )}
      </Section>
    </div>
  );
}
