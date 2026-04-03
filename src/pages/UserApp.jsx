import React, { useState, useEffect, useCallback } from 'react';
import { FuelBar, Toast } from '../components/UI.jsx';
import {
  dbFetchSites, dbFetchSaisies, dbFetchUserSites,
  dbUpsertSaisie, dbSubmitSaisie
} from '../utils/store.js';
import { dbLogout } from '../utils/store.js';

const today = () => new Date().toISOString().split('T')[0];
const nowTime = () => new Date().toTimeString().slice(0, 5);
const emptyForm = (date = today()) => ({
  date, heure: nowTime(),
  cpt_h: '', cpt_eau: '', pression: '',
  k1: '', k2: '', kvar: '', cosphi: '',
  ge_h: '', ge_marche: '', carburant: '', obs: ''
});

export default function UserApp({ session, profile, onLogout, showToast: showToastProp }) {
  const [sites, setSites] = useState([]);
  const [saisies, setSaisies] = useState({});
  const [currentSiteIdx, setCurrentSiteIdx] = useState(0);
  const [view, setView] = useState('form'); // 'form' | 'history'
  const [selectedDate, setSelectedDate] = useState(today());
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [toast, setToast] = useState({ msg: '', visible: false });
  const [loading, setLoading] = useState(true);

  function showToast(msg) {
    setToast({ msg, visible: true });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const assignedIds = await dbFetchUserSites(session.user.id);
      const allSites = await dbFetchSites();
      const userSites = allSites.filter(s => assignedIds.includes(s.id));
      setSites(userSites);
      const saisiesMap = {};
      await Promise.all(userSites.map(async s => {
        saisiesMap[s.id] = await dbFetchSaisies(s.id);
      }));
      setSaisies(saisiesMap);
    } catch (e) {
      showToast('❌ Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }

  const site = sites[currentSiteIdx];
  const siteRows = site ? (saisies[site.id] || []) : [];
  const currentRow = siteRows.find(r => r.date === selectedDate);
  const isSubmitted = currentRow?.status === 'submitted';
  const isDraft = currentRow?.status === 'draft';

  useEffect(() => {
    if (!site) return;
    if (currentRow) {
      const filled = {};
      Object.keys(emptyForm()).forEach(k => {
        filled[k] = currentRow[k] !== undefined ? String(currentRow[k]) : '';
      });
      setForm(filled);
    } else {
      setForm(emptyForm(selectedDate));
    }
  }, [selectedDate, currentSiteIdx, saisies]);

  useEffect(() => {
    setSelectedDate(today());
  }, [currentSiteIdx]);

  async function handleSaveDraft(e) {
    e.preventDefault();
    if (isSubmitted) return;
    setSaving(true);
    try {
      const entry = buildEntry();
      await dbUpsertSaisie(site.id, { ...entry, status: 'draft' });
      setSaisies(prev => {
        const rows = [...(prev[site.id] || [])];
        const idx = rows.findIndex(r => r.date === entry.date);
        const newRow = { ...entry, status: 'draft' };
        if (idx >= 0) rows[idx] = { ...rows[idx], ...newRow };
        else rows.push(newRow);
        return { ...prev, [site.id]: rows };
      });
      showToast('💾 Brouillon enregistré');
    } catch {
      showToast('❌ Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setConfirmSubmit(false);
    try {
      const entry = buildEntry();
      await dbUpsertSaisie(site.id, { ...entry, status: 'draft' });
      await dbSubmitSaisie(site.id, selectedDate);
      setSaisies(prev => {
        const rows = [...(prev[site.id] || [])];
        const idx = rows.findIndex(r => r.date === selectedDate);
        if (idx >= 0) rows[idx] = { ...rows[idx], ...entry, status: 'submitted', submitted_at: new Date().toISOString() };
        return { ...prev, [site.id]: rows };
      });
      showToast('✅ Saisie soumise définitivement');
    } catch {
      showToast('❌ Erreur lors de la soumission');
    } finally {
      setSubmitting(false);
    }
  }

  function buildEntry() {
    return {
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
  }

  function set(field) {
    return e => setForm(f => ({ ...f, [field]: e.target.value }));
  }

  const fieldStyle = {
    padding: '10px 12px', border: '1.5px solid #E4E7EC', borderRadius: 10,
    fontSize: 15, outline: 'none', background: isSubmitted ? '#F9FAFB' : 'white',
    width: '100%', boxSizing: 'border-box', fontFamily: "'Space Mono', monospace",
    color: isSubmitted ? '#667085' : '#101828'
  };
  const labelStyle = {
    fontSize: 11, fontWeight: 700, color: '#344054',
    textTransform: 'uppercase', letterSpacing: '0.5px',
    display: 'block', marginBottom: 5
  };
  const cardStyle = {
    background: 'white', borderRadius: 14, padding: 16,
    marginBottom: 12, border: '1px solid #E4E7EC',
    boxShadow: '0 1px 3px rgba(16,24,40,0.05)'
  };

  if (loading) return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '100vh',
      background: 'linear-gradient(135deg, #003d7a, #0057A8)'
    }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>💧</div>
      <p style={{ color: 'white', fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>Chargement...</p>
    </div>
  );

  if (!sites.length) return (
    <div style={{ minHeight: '100vh', background: '#F0F5FC', display: 'flex', flexDirection: 'column' }}>
      <UserHeader profile={profile} onLogout={onLogout} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🏗</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#101828', marginBottom: 8 }}>Aucun site assigné</div>
        <div style={{ fontSize: 13, color: '#667085', textAlign: 'center' }}>
          Contactez votre administrateur pour être assigné à un site.
        </div>
      </div>
    </div>
  );

  const sortedRows = [...siteRows].sort((a, b) => b.date.localeCompare(a.date));
  const carbVal = parseInt(form.carburant) || 0;
  const pressWarn = form.pression !== '' && parseFloat(form.pression) < 2;

  return (
    <div style={{ minHeight: '100vh', background: '#F0F5FC', display: 'flex', flexDirection: 'column' }}>
      <UserHeader profile={profile} onLogout={onLogout} />

      {/* Sélecteur de site */}
      {sites.length > 1 && (
        <div style={{
          background: 'white', borderBottom: '1px solid #EAECF0',
          padding: '10px 16px', display: 'flex', gap: 8, overflowX: 'auto'
        }}>
          {sites.map((s, i) => (
            <button key={s.id} onClick={() => setCurrentSiteIdx(i)} style={{
              padding: '7px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
              background: i === currentSiteIdx ? '#0057A8' : '#F2F4F7',
              color: i === currentSiteIdx ? 'white' : '#344054',
              fontSize: 12, fontWeight: 600, fontFamily: "'Outfit', sans-serif",
              whiteSpace: 'nowrap', flexShrink: 0
            }}>{s.name}</button>
          ))}
        </div>
      )}

      {/* Onglets */}
      <div style={{
        background: 'white', borderBottom: '1px solid #EAECF0',
        display: 'flex', padding: '0 16px'
      }}>
        {[{ key: 'form', label: '✏️ Saisie' }, { key: 'history', label: '📅 Historique' }].map(t => (
          <button key={t.key} onClick={() => setView(t.key)} style={{
            padding: '12px 16px', border: 'none', background: 'none',
            fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 600,
            color: view === t.key ? '#0057A8' : '#667085', cursor: 'pointer',
            borderBottom: view === t.key ? '3px solid #0057A8' : '3px solid transparent'
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ flex: 1, padding: 16, paddingBottom: 40, maxWidth: 600, margin: '0 auto', width: '100%' }}>

        {/* ── VUE SAISIE ── */}
        {view === 'form' && (
          <>
            {/* Site + Date */}
            <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #003d7a, #0057A8)', color: 'white' }}>
              <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 2 }}>Site actif</div>
              <div style={{ fontSize: 16, fontWeight: 800 }}>{site.name}</div>
              <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>{site.loc}</div>
            </div>

            {/* Sélecteur date + statut */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="date" value={selectedDate} max={today()}
                  onChange={e => setSelectedDate(e.target.value)}
                  disabled={isSubmitted && selectedDate !== today()}
                  style={{
                    flex: 1, padding: '9px 12px', border: '1.5px solid #E4E7EC',
                    borderRadius: 9, fontSize: 14, fontWeight: 700, outline: 'none',
                    fontFamily: "'Outfit', sans-serif", background: 'white'
                  }} />
                <span style={{
                  padding: '6px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                  background: isSubmitted ? '#ECFDF3' : isDraft ? '#FFF4EC' : '#F2F4F7',
                  color: isSubmitted ? '#027A48' : isDraft ? '#F4720B' : '#667085'
                }}>
                  {isSubmitted ? '🔒 Soumis' : isDraft ? '✏️ Brouillon' : '🆕 Nouveau'}
                </span>
              </div>
              {isSubmitted && (
                <p style={{ fontSize: 11, color: '#667085', marginTop: 8 }}>
                  Cette saisie a été soumise et ne peut plus être modifiée.
                </p>
              )}
            </div>

            <form onSubmit={handleSaveDraft}>
              {/* Général */}
              <div style={cardStyle}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0057A8', marginBottom: 12 }}>🕐 Informations générales</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div><label style={labelStyle}>Date</label>
                    <input type="date" value={form.date} max={today()} onChange={e => { set('date')(e); setSelectedDate(e.target.value); }}
                      style={fieldStyle} disabled={isSubmitted} required /></div>
                  <div><label style={labelStyle}>Heure arrivée</label>
                    <input type="time" value={form.heure} onChange={set('heure')} style={fieldStyle} disabled={isSubmitted} /></div>
                </div>
              </div>

              {/* Compteurs */}
              <div style={cardStyle}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#00917C', marginBottom: 12 }}>💧 Compteurs & Pression</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div><label style={labelStyle}>Cpt horaire (h)</label>
                    <input type="number" value={form.cpt_h} onChange={set('cpt_h')} step="0.1" placeholder="0.0" style={fieldStyle} disabled={isSubmitted} /></div>
                  <div><label style={labelStyle}>Cpt eau (m³)</label>
                    <input type="number" value={form.cpt_eau} onChange={set('cpt_eau')} step="1" placeholder="0" style={fieldStyle} disabled={isSubmitted} /></div>
                </div>
                <div>
                  <label style={labelStyle}>Pression (bars)</label>
                  <input type="number" value={form.pression} onChange={set('pression')} step="0.01" placeholder="0.00"
                    style={{ ...fieldStyle, borderColor: pressWarn && !isSubmitted ? '#D92D20' : '#E4E7EC' }} disabled={isSubmitted} />
                  {pressWarn && !isSubmitted && <p style={{ fontSize: 11, color: '#D92D20', marginTop: 4 }}>⚠ Pression sous le seuil (2 bars)</p>}
                </div>
              </div>

              {/* Énergie */}
              <div style={cardStyle}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#3381C8', marginBottom: 12 }}>⚡ Énergie</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[['k1 (kWh)', 'k1', '0.1'], ['k2 (kWh)', 'k2', '0.1'], ['kvar', 'kvar', '0.1'], ['cos φ', 'cosphi', '0.001']].map(([label, field, step]) => (
                    <div key={field}>
                      <label style={labelStyle}>{label}</label>
                      <input type="number" value={form[field]} onChange={set(field)} step={step}
                        placeholder={step === '0.001' ? '0.000' : '0.0'} style={fieldStyle} disabled={isSubmitted} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Groupe électrogène */}
              <div style={cardStyle}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#F4720B', marginBottom: 12 }}>🔋 Groupe électrogène</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div><label style={labelStyle}>Cpt GE (h)</label>
                    <input type="number" value={form.ge_h} onChange={set('ge_h')} step="0.1" placeholder="0.0" style={fieldStyle} disabled={isSubmitted} /></div>
                  <div><label style={labelStyle}>Marche (h)</label>
                    <input type="number" value={form.ge_marche} onChange={set('ge_marche')} step="0.1" placeholder="0.0" style={fieldStyle} disabled={isSubmitted} /></div>
                </div>
                <div>
                  <label style={labelStyle}>Carburant (%)</label>
                  <input type="number" value={form.carburant} onChange={set('carburant')} min="0" max="100" step="1"
                    placeholder="0" style={{ ...fieldStyle, marginBottom: 8 }} disabled={isSubmitted} />
                  <FuelBar value={carbVal} />
                </div>
              </div>

              {/* Observations */}
              <div style={cardStyle}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#344054', marginBottom: 12 }}>📝 Observations</div>
                <textarea value={form.obs} onChange={set('obs')} placeholder="Remarques éventuelles..."
                  disabled={isSubmitted}
                  style={{
                    ...fieldStyle, height: 80, resize: 'vertical',
                    fontFamily: "'Outfit', sans-serif"
                  }} />
              </div>

              {/* Boutons */}
              {!isSubmitted && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                  <button type="submit" disabled={saving} style={{
                    padding: '13px', background: saving ? '#F2F4F7' : 'white',
                    color: saving ? '#667085' : '#0057A8',
                    border: '1.5px solid #0057A8', borderRadius: 12,
                    fontSize: 15, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer',
                    fontFamily: "'Outfit', sans-serif"
                  }}>
                    {saving ? '⏳ Enregistrement...' : '💾 Enregistrer en brouillon'}
                  </button>
                  <button type="button" onClick={() => setConfirmSubmit(true)}
                    disabled={!isDraft && !currentRow}
                    style={{
                      padding: '13px',
                      background: (!isDraft && !currentRow) ? '#F2F4F7' : 'linear-gradient(135deg, #027A48, #00917C)',
                      color: (!isDraft && !currentRow) ? '#A0AEBF' : 'white',
                      border: 'none', borderRadius: 12,
                      fontSize: 15, fontWeight: 600,
                      cursor: (!isDraft && !currentRow) ? 'not-allowed' : 'pointer',
                      fontFamily: "'Outfit', sans-serif",
                      boxShadow: (!isDraft && !currentRow) ? 'none' : '0 4px 12px rgba(2,122,72,0.25)'
                    }}>
                    {!isDraft && !currentRow ? 'Enregistrez d\'abord un brouillon' : '✅ Soumettre définitivement'}
                  </button>
                </div>
              )}
            </form>
          </>
        )}

        {/* ── VUE HISTORIQUE ── */}
        {view === 'history' && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#101828', marginBottom: 14 }}>
              {site.name} — {sortedRows.length} saisie{sortedRows.length !== 1 ? 's' : ''}
            </div>
            {sortedRows.length === 0
              ? <div style={{ textAlign: 'center', padding: 40, color: '#667085' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
                  <div style={{ fontWeight: 600 }}>Aucune saisie enregistrée</div>
                </div>
              : sortedRows.map(r => (
                <div key={r.date} onClick={() => { setSelectedDate(r.date); setView('form'); }}
                  style={{
                    ...cardStyle, cursor: 'pointer', marginBottom: 10,
                    borderLeft: `3px solid ${r.status === 'submitted' ? '#027A48' : '#F4720B'}`
                  }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#101828' }}>
                      {new Date(r.date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20,
                      background: r.status === 'submitted' ? '#ECFDF3' : '#FFF4EC',
                      color: r.status === 'submitted' ? '#027A48' : '#F4720B'
                    }}>
                      {r.status === 'submitted' ? '🔒 Soumis' : '✏️ Brouillon'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {[
                      { label: `P: ${r.pression} bars`, warn: r.pression < 2 },
                      { label: `Eau: ${r.cpt_eau?.toLocaleString('fr')} m³`, warn: false },
                      { label: `GE: ${r.carburant}%`, warn: r.carburant < 20 },
                      { label: `k1: ${r.k1} kWh`, warn: false },
                    ].map(({ label, warn }) => (
                      <span key={label} style={{
                        fontSize: 11, padding: '3px 8px', borderRadius: 20,
                        background: warn ? '#FFF1F0' : '#F9FAFB',
                        color: warn ? '#D92D20' : '#344054', fontWeight: 500
                      }}>{label}</span>
                    ))}
                  </div>
                  {r.obs && <div style={{ fontSize: 11, color: '#667085', marginTop: 6, fontStyle: 'italic' }}>{r.obs}</div>}
                </div>
              ))
            }
          </div>
        )}
      </div>

      {/* Modal confirmation soumission */}
      {confirmSubmit && (
        <div onClick={() => setConfirmSubmit(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(16,24,40,0.6)',
          display: 'flex', alignItems: 'flex-end', zIndex: 300,
          backdropFilter: 'blur(4px)'
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'white', borderRadius: '24px 24px 0 0',
            padding: '24px 24px 40px', width: '100%',
            boxShadow: '0 -8px 40px rgba(16,24,40,0.15)'
          }}>
            <div style={{ width: 36, height: 4, background: '#E4E7EC', borderRadius: 2, margin: '0 auto 20px' }} />
            <div style={{ fontSize: 18, fontWeight: 800, color: '#101828', marginBottom: 8 }}>⚠️ Soumettre définitivement ?</div>
            <p style={{ fontSize: 13, color: '#667085', marginBottom: 24 }}>
              Une fois soumise, la saisie du <strong>{selectedDate}</strong> ne pourra plus être modifiée.
              Assurez-vous que toutes les données sont correctes.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleSubmit} disabled={submitting} style={{
                flex: 1, padding: '13px',
                background: submitting ? '#A0AEBF' : 'linear-gradient(135deg, #027A48, #00917C)',
                color: 'white', border: 'none', borderRadius: 12,
                fontSize: 15, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer',
                fontFamily: "'Outfit', sans-serif"
              }}>
                {submitting ? 'Soumission...' : 'Confirmer la soumission'}
              </button>
              <button onClick={() => setConfirmSubmit(false)} style={{
                flex: 1, padding: '13px', background: '#F2F4F7',
                color: '#344054', border: 'none', borderRadius: 12,
                fontSize: 15, fontWeight: 600, cursor: 'pointer',
                fontFamily: "'Outfit', sans-serif"
              }}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      <Toast message={toast.msg} visible={toast.visible} />
    </div>
  );
}

function UserHeader({ profile, onLogout }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #003d7a, #0057A8)',
      color: 'white', padding: '12px 18px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      boxShadow: '0 2px 12px rgba(0,40,100,0.25)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: 'rgba(255,255,255,0.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16
        }}>💧</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800 }}>SiteWatch Pro</div>
          <div style={{ fontSize: 10, opacity: 0.65 }}>
            {profile?.full_name || profile?.email}
          </div>
        </div>
      </div>
      <button onClick={onLogout} style={{
        background: 'rgba(255,255,255,0.12)', border: 'none', color: 'white',
        borderRadius: 10, padding: '7px 14px', cursor: 'pointer',
        fontSize: 12, fontWeight: 600, fontFamily: "'Outfit', sans-serif"
      }}>↪ Sortir</button>
    </div>
  );
}
