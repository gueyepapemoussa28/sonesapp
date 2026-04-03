import React, { useState, useEffect } from 'react';
import { Section, FuelBar, SiteSelector } from '../components/UI.jsx';
import { getLatest, getPrev } from '../utils/store.js';

const today = () => new Date().toISOString().split('T')[0];
const nowTime = () => new Date().toTimeString().slice(0, 5);

const emptyForm = (date = today()) => ({
  date, heure: nowTime(),
  cpt_h: '', cpt_eau: '', pression: '',
  k1: '', k2: '', kvar: '', cosphi: '',
  ge_h: '', ge_marche: '', carburant: '', obs: ''
});

export default function Saisie({ state, currentSite, onSelectSite, onSave, showToast }) {
  const { sites, saisies } = state;

  if (!sites.length) return (
    <div style={{ textAlign: 'center', padding: '48px 20px', color: '#667085' }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>✏️</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#344054', marginBottom: 6 }}>Aucun site configuré</div>
      <div style={{ fontSize: 12 }}>Ajoutez un site dans l'onglet Sites avant de saisir des données.</div>
    </div>
  );

  const site = sites[currentSite];
  const rows = saisies[site.id] || [];
  const sortedDates = [...new Set(rows.map(r => r.date))].sort();

  const [selectedDate, setSelectedDate] = useState(today());
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Quand on change de site ou de date → charger la saisie correspondante
  useEffect(() => {
    const row = rows.find(r => r.date === selectedDate);
    if (row) {
      const filled = {};
      Object.keys(emptyForm()).forEach(k => { filled[k] = row[k] !== undefined ? String(row[k]) : ''; });
      setForm(filled);
    } else {
      setForm(emptyForm(selectedDate));
    }
  }, [currentSite, site.id, selectedDate, saisies]);

  // Reset date quand on change de site
  useEffect(() => { setSelectedDate(today()); }, [currentSite]);

  const currentIdx = sortedDates.indexOf(selectedDate);
  const hasPrev = currentIdx > 0;
  const hasNext = currentIdx < sortedDates.length - 1 && sortedDates[currentIdx + 1] <= today();
  const isExisting = rows.some(r => r.date === selectedDate);

  // Pour les deltas, trouver la saisie du jour précédent dans les données
  const prevRow = (() => {
    const idx = sortedDates.indexOf(selectedDate);
    if (idx > 0) return rows.find(r => r.date === sortedDates[idx - 1]);
    return null;
  })();

  function set(field) {
    return e => setForm(f => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const entry = {
      date: form.date,
      heure: form.heure,
      cpt_h: parseFloat(form.cpt_h) || 0,
      cpt_eau: parseFloat(form.cpt_eau) || 0,
      pression: parseFloat(form.pression) || 0,
      k1: parseFloat(form.k1) || 0,
      k2: parseFloat(form.k2) || 0,
      kvar: parseFloat(form.kvar) || 0,
      cosphi: parseFloat(form.cosphi) || 0,
      ge_h: parseFloat(form.ge_h) || 0,
      ge_marche: parseFloat(form.ge_marche) || 0,
      carburant: parseInt(form.carburant) || 0,
      obs: form.obs,
    };
    try {
      await onSave(site.id, entry);
      showToast('✅ Saisie enregistrée — ' + site.name);
    } catch {
      showToast('❌ Erreur — saisie non sauvegardée');
    } finally {
      setSaving(false);
    }
  }

  const fieldStyle = {
    padding: '9px 12px', border: '1.5px solid #E4E7EC', borderRadius: 9,
    fontSize: 14, fontFamily: "'Space Mono', monospace", outline: 'none',
    background: 'white', width: '100%', boxSizing: 'border-box'
  };
  const labelStyle = {
    fontSize: 11, fontWeight: 600, color: '#344054',
    textTransform: 'uppercase', letterSpacing: '0.4px',
    display: 'block', marginBottom: 4
  };
  const grid2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 };
  const fieldWrap = { display: 'flex', flexDirection: 'column' };

  function DeltaHint({ field }) {
    if (!prevRow || prevRow[field] === undefined || form[field] === '') return null;
    const val = parseFloat(form[field]);
    const delta = parseFloat((val - prevRow[field]).toFixed(3));
    return (
      <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
        <span style={{
          fontSize: 10, padding: '2px 7px', borderRadius: 20, fontWeight: 600,
          fontFamily: "'Space Mono', monospace", background: '#F9FAFB', color: '#667085'
        }}>Préc: {prevRow[field]}</span>
        {!isNaN(delta) && <span style={{
          fontSize: 10, padding: '2px 7px', borderRadius: 20, fontWeight: 600,
          background: delta >= 0 ? '#DCFAE6' : '#FEE4E2',
          color: delta >= 0 ? '#027A48' : '#D92D20'
        }}>{delta >= 0 ? '+' : ''}{delta}</span>}
      </div>
    );
  }

  const pressWarn = form.pression !== '' && parseFloat(form.pression) < 2;
  const carbVal = parseInt(form.carburant) || 0;

  return (
    <div>
      <SiteSelector sites={sites} current={currentSite} onSelect={onSelectSite} />

      {/* Navigation par date */}
      <div style={{
        background: 'white', borderRadius: 14, padding: '12px 14px',
        marginBottom: 14, border: '1px solid #E4E7EC',
        boxShadow: '0 1px 4px rgba(16,24,40,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          {/* Flèche précédente */}
          <button onClick={() => hasPrev && setSelectedDate(sortedDates[currentIdx - 1])}
            disabled={!hasPrev}
            style={{
              width: 36, height: 36, borderRadius: 9, border: '1.5px solid #E4E7EC',
              background: hasPrev ? 'white' : '#F9FAFB', cursor: hasPrev ? 'pointer' : 'default',
              fontSize: 16, color: hasPrev ? '#0057A8' : '#C0C8D6',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>‹</button>

          {/* Sélecteur de date central */}
          <div style={{ flex: 1, textAlign: 'center' }}>
            <input
              type="date"
              value={selectedDate}
              max={today()}
              onChange={e => setSelectedDate(e.target.value)}
              style={{
                border: 'none', outline: 'none', fontSize: 15, fontWeight: 700,
                color: '#101828', textAlign: 'center', cursor: 'pointer',
                fontFamily: "'Outfit', sans-serif", background: 'transparent', width: '100%'
              }}
            />
            <div style={{ fontSize: 11, marginTop: 2 }}>
              {isExisting
                ? <span style={{ color: '#027A48', fontWeight: 600 }}>✓ Saisie enregistrée</span>
                : <span style={{ color: '#F4720B', fontWeight: 600 }}>Nouvelle saisie</span>
              }
            </div>
          </div>

          {/* Flèche suivante */}
          <button onClick={() => hasNext && setSelectedDate(sortedDates[currentIdx + 1])}
            disabled={!hasNext}
            style={{
              width: 36, height: 36, borderRadius: 9, border: '1.5px solid #E4E7EC',
              background: hasNext ? 'white' : '#F9FAFB', cursor: hasNext ? 'pointer' : 'default',
              fontSize: 16, color: hasNext ? '#0057A8' : '#C0C8D6',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>›</button>

          {/* Bouton historique */}
          <button onClick={() => setShowHistory(v => !v)} style={{
            padding: '6px 12px', borderRadius: 9, border: '1.5px solid #E4E7EC',
            background: showHistory ? '#EBF3FF' : 'white', cursor: 'pointer',
            fontSize: 11, fontWeight: 600, color: showHistory ? '#0057A8' : '#344054',
            fontFamily: "'Outfit', sans-serif", flexShrink: 0
          }}>
            {sortedDates.length} saisie{sortedDates.length !== 1 ? 's' : ''}
          </button>
        </div>

        {/* Liste historique déroulante */}
        {showHistory && sortedDates.length > 0 && (
          <div style={{
            marginTop: 12, borderTop: '1px solid #F2F4F7', paddingTop: 10,
            maxHeight: 200, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4
          }}>
            {[...sortedDates].reverse().map(date => (
              <button key={date} onClick={() => { setSelectedDate(date); setShowHistory(false); }}
                style={{
                  textAlign: 'left', padding: '8px 12px', borderRadius: 8,
                  border: 'none', cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
                  background: date === selectedDate ? '#EBF3FF' : 'transparent',
                  color: date === selectedDate ? '#0057A8' : '#344054',
                  fontWeight: date === selectedDate ? 700 : 400, fontSize: 13,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                <span>{new Date(date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                {date === today() && <span style={{ fontSize: 10, color: '#0057A8', fontWeight: 700 }}>Aujourd'hui</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Général */}
        <Section icon="🕐" iconBg="#E8F2FF" title="Informations générales">
          <div style={grid2}>
            <div style={fieldWrap}>
              <label style={labelStyle}>Date</label>
              <input type="date" value={form.date} max={today()}
                onChange={e => { set('date')(e); setSelectedDate(e.target.value); }}
                style={fieldStyle} required />
            </div>
            <div style={fieldWrap}>
              <label style={labelStyle}>Heure d'arrivée</label>
              <input type="time" value={form.heure} onChange={set('heure')} style={fieldStyle} required />
            </div>
          </div>
        </Section>

        {/* Compteurs */}
        <Section icon="💧" iconBg="#E0F5F1" title="Compteurs & Pression">
          <div style={grid2}>
            <div style={fieldWrap}>
              <label style={labelStyle}>Compteur horaire (h)</label>
              <input type="number" value={form.cpt_h} onChange={set('cpt_h')} step="0.1" placeholder="0.0" style={fieldStyle} />
              <DeltaHint field="cpt_h" />
            </div>
            <div style={fieldWrap}>
              <label style={labelStyle}>Compteur eau (m³)</label>
              <input type="number" value={form.cpt_eau} onChange={set('cpt_eau')} step="1" placeholder="0" style={fieldStyle} />
              <DeltaHint field="cpt_eau" />
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Pression (bars)</label>
            <input type="number" value={form.pression} onChange={set('pression')} step="0.01" placeholder="0.00"
              style={{ ...fieldStyle, borderColor: pressWarn ? '#D92D20' : '#E4E7EC' }} />
            {pressWarn && <p style={{ fontSize: 11, color: '#D92D20', marginTop: 4 }}>⚠ Pression sous le seuil minimum (2 bars)</p>}
            <DeltaHint field="pression" />
          </div>
        </Section>

        {/* Énergie */}
        <Section icon="⚡" iconBg="#E8F2FF" title="Énergie">
          <div style={grid2}>
            {[['k1 (kWh)', 'k1', '0.1'], ['k2 (kWh)', 'k2', '0.1'], ['kvar', 'kvar', '0.1'], ['cos φ', 'cosphi', '0.001']].map(([label, field, step]) => (
              <div key={field} style={fieldWrap}>
                <label style={labelStyle}>{label}</label>
                <input type="number" value={form[field]} onChange={set(field)} step={step}
                  placeholder={step === '0.001' ? '0.000' : '0.0'} style={fieldStyle} />
              </div>
            ))}
          </div>
        </Section>

        {/* Groupe électrogène */}
        <Section icon="🔋" iconBg="#FEF0E5" title="Groupe électrogène">
          <div style={grid2}>
            <div style={fieldWrap}>
              <label style={labelStyle}>Compteur GE (h)</label>
              <input type="number" value={form.ge_h} onChange={set('ge_h')} step="0.1" placeholder="0.0" style={fieldStyle} />
            </div>
            <div style={fieldWrap}>
              <label style={labelStyle}>Temps de marche (h)</label>
              <input type="number" value={form.ge_marche} onChange={set('ge_marche')} step="0.1" placeholder="0.0" style={fieldStyle} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Niveau carburant (%)</label>
            <input type="number" value={form.carburant} onChange={set('carburant')}
              min="0" max="100" step="1" placeholder="0"
              style={{ ...fieldStyle, marginBottom: 8 }} />
            <FuelBar value={carbVal} />
            {carbVal > 0 && <DeltaHint field="carburant" />}
          </div>
        </Section>

        {/* Observations */}
        <Section icon="📝" iconBg="#E0F5F1" title="Observations">
          <input type="text" value={form.obs} onChange={set('obs')}
            placeholder="Remarques éventuelles..." style={fieldStyle} />
        </Section>

        <button type="submit" disabled={saving} style={{
          background: saving ? '#A0AEBF' : 'linear-gradient(135deg,#0057A8,#3381C8)',
          color: 'white', border: 'none', borderRadius: 10, padding: '13px 20px',
          fontSize: 15, fontWeight: 600, width: '100%',
          cursor: saving ? 'not-allowed' : 'pointer',
          fontFamily: "'Outfit', sans-serif", boxShadow: '0 4px 12px rgba(0,87,168,0.3)',
          marginBottom: 16
        }}>
          {saving ? '⏳ Enregistrement...' : (isExisting ? '💾 Mettre à jour la saisie' : '💾 Enregistrer la saisie')}
        </button>
      </form>
    </div>
  );
}
