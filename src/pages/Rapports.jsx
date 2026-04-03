// src/pages/Rapports.js
import React, { useState } from 'react';
import { Section } from '../components/UI.jsx';
import { exportDaily, exportMonthly } from '../utils/exportExcel.js';

export default function Rapports({ state, showToast }) {
  const { sites, saisies } = state;
  const [reportType, setReportType] = useState('daily');
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  const allRows = [];
  sites.forEach(site => {
    (saisies[site.id] || []).forEach(r => {
      allRows.push({ ...r, siteName: site.name });
    });
  });
  allRows.sort((a, b) => b.date.localeCompare(a.date));

  function handleExport() {
    try {
      if (reportType === 'daily') {
        exportDaily(sites, saisies);
      } else {
        exportMonthly(sites, saisies, month);
      }
      showToast('📥 Export Excel généré avec succès');
    } catch (e) {
      showToast('❌ Erreur export: ' + e.message);
    }
  }

  function handleSyncDrive() {
    showToast('☁ Sync Google Drive — intégration OAuth à configurer');
  }

  const selectStyle = {
    padding: '9px 12px', border: '1.5px solid #E4E7EC', borderRadius: 9,
    fontSize: 14, outline: 'none', background: 'white', width: '100%',
    fontFamily: "'Outfit', sans-serif"
  };
  const labelStyle = { fontSize: 11, fontWeight: 600, color: '#344054', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: 4 };

  return (
    <div>
      {/* Export */}
      <Section icon="📋" iconBg="#E8F2FF" title="Génération de rapports">
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Type de rapport</label>
          <select value={reportType} onChange={e => setReportType(e.target.value)} style={selectStyle}>
            <option value="daily">Synthèse quotidienne (tous les jours)</option>
            <option value="monthly">Synthèse mensuelle</option>
          </select>
        </div>
        {reportType === 'monthly' && (
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Mois</label>
            <input type="month" value={month} onChange={e => setMonth(e.target.value)} style={selectStyle} />
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button onClick={handleExport} style={{
            background: '#DCFAE6', color: '#027A48', border: '1.5px solid #027A48',
            borderRadius: 10, padding: '11px 16px', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', flex: 1, fontFamily: "'Outfit', sans-serif"
          }}>
            📥 Export Excel
          </button>
          <button onClick={handleSyncDrive} style={{
            background: 'white', color: '#0057A8', border: '1.5px solid #0057A8',
            borderRadius: 10, padding: '11px 16px', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', flex: 1, fontFamily: "'Outfit', sans-serif"
          }}>
            ☁ Sync Drive
          </button>
        </div>
        <p style={{ fontSize: 11, color: '#667085', marginTop: 12 }}>
          L'export inclut une feuille par site + une synthèse globale avec les deltas J/J-1.
        </p>
      </Section>

      {/* Stats rapides */}
      <Section icon="📊" iconBg="#E0F5F1" title="Résumé par site">
        {sites.map(site => {
          const rows = saisies[site.id] || [];
          const latest = rows[rows.length - 1];
          const prev = rows[rows.length - 2];
          return (
            <div key={site.id} style={{
              padding: '12px 0', borderBottom: '1px solid #E4E7EC',
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{site.name}</div>
                <div style={{ fontSize: 12, color: '#667085', marginTop: 2 }}>
                  {rows.length} saisie(s) enregistrée(s)
                </div>
                {latest && (
                  <div style={{ fontSize: 12, color: '#667085' }}>
                    Dernière: {latest.date} à {latest.heure}
                  </div>
                )}
              </div>
              {latest && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, color: '#0057A8', fontWeight: 600 }}>P: {latest.pression} bars</div>
                  <div style={{ fontSize: 12, color: latest.carburant < 20 ? '#D92D20' : '#027A48', fontWeight: 600 }}>
                    GE: {latest.carburant}%
                  </div>
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
            <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid #E4E7EC' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{r.siteName}</span>
                <span style={{ fontSize: 11, color: '#667085' }}>{r.date} {r.heure}</span>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, color: r.pression < 2 ? '#D92D20' : '#0057A8' }}>P: {r.pression} bars</span>
                <span style={{ fontSize: 12, color: '#00917C' }}>Eau: {r.cpt_eau?.toLocaleString('fr')} m³</span>
                <span style={{ fontSize: 12, color: r.carburant < 20 ? '#D92D20' : '#027A48' }}>GE: {r.carburant}%</span>
                <span style={{ fontSize: 12, color: '#667085' }}>k1: {r.k1} kWh</span>
              </div>
              {r.obs && <div style={{ fontSize: 11, color: '#667085', marginTop: 4, fontStyle: 'italic' }}>{r.obs}</div>}
            </div>
          ))
        }
        {allRows.length > 30 && (
          <p style={{ fontSize: 12, color: '#667085', textAlign: 'center', marginTop: 8 }}>
            {allRows.length - 30} saisies supplémentaires dans l'export Excel
          </p>
        )}
      </Section>
    </div>
  );
}
