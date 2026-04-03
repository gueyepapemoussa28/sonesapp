// src/App.js
import React, { useState, useCallback } from 'react';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Saisie from './pages/Saisie.jsx';
import Graphiques from './pages/Graphiques.jsx';
import Rapports from './pages/Rapports.jsx';
import Sites from './pages/Sites.jsx';
import { Toast, Modal, AlertItem } from './components/UI.jsx';
import { loadState, saveState, computeAlerts } from './utils/store';

const TABS = [
  { key: 'dashboard', label: '📊 Dashboard' },
  { key: 'saisie', label: '✏️ Saisie' },
  { key: 'graphiques', label: '📈 Graphiques' },
  { key: 'rapports', label: '📋 Rapports' },
  { key: 'sites', label: '🏗 Sites' },
];

export default function App() {
  const [logged, setLogged] = useState(false);
  const [tab, setTab] = useState('dashboard');
  const [currentSite, setCurrentSite] = useState(0);
  const [state, setState] = useState(() => loadState());
  const [toast, setToast] = useState({ msg: '', visible: false });
  const [alertsModal, setAlertsModal] = useState(false);

  function showToast(msg) {
    setToast({ msg, visible: true });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2800);
  }

  function updateState(newState) {
    setState(newState);
    saveState(newState);
  }

  const handleSave = useCallback((siteId, entry) => {
    setState(prev => {
      const saisies = { ...prev.saisies };
      const rows = [...(saisies[siteId] || [])];
      const idx = rows.findIndex(r => r.date === entry.date);
      if (idx >= 0) rows[idx] = entry;
      else rows.push(entry);
      rows.sort((a, b) => a.date.localeCompare(b.date));
      const next = { ...prev, saisies: { ...saisies, [siteId]: rows } };
      saveState(next);
      return next;
    });
  }, []);

  const handleAddSite = useCallback(({ name, loc, status }) => {
    setState(prev => {
      const id = Date.now();
      const next = {
        ...prev,
        sites: [...prev.sites, { id, name, loc, status }],
        saisies: { ...prev.saisies, [id]: [] }
      };
      saveState(next);
      return next;
    });
  }, []);

  const handleDeleteSite = useCallback((idx) => {
    setState(prev => {
      const sites = prev.sites.filter((_, i) => i !== idx);
      const next = { ...prev, sites };
      saveState(next);
      return next;
    });
    setCurrentSite(c => Math.min(c, state.sites.length - 2));
  }, [state.sites.length]);

  const alerts = computeAlerts(state.sites, state.saisies);

  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  if (!logged) return <Login onLogin={() => setLogged(true)} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* HEADER */}
      <div style={{
        background: 'linear-gradient(135deg, #003d7a, #0057A8)',
        color: 'white', padding: '14px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 4px 12px rgba(0,60,130,0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18
          }}>💧</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1 }}>SiteWatch Pro</div>
            <div style={{ fontSize: 10, opacity: 0.75, marginTop: 2, textTransform: 'capitalize' }}>{dateStr}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => setAlertsModal(true)}
            style={{
              background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white',
              borderRadius: 8, padding: '6px 10px', cursor: 'pointer',
              fontSize: 13, fontFamily: "'Outfit', sans-serif",
              display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            ⚠
            {alerts.length > 0 && (
              <span style={{
                background: '#F4720B', color: 'white', borderRadius: '50%',
                width: 18, height: 18, fontSize: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700
              }}>{alerts.length}</span>
            )}
          </button>
          <button
            onClick={() => setLogged(false)}
            style={{
              background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white',
              borderRadius: 8, padding: '6px 10px', cursor: 'pointer',
              fontSize: 13, fontFamily: "'Outfit', sans-serif"
            }}
          >↪ Sortir</button>
        </div>
      </div>

      {/* NAV TABS */}
      <div style={{
        background: 'white', borderBottom: '1px solid #E4E7EC',
        display: 'flex', overflowX: 'auto', padding: '0 16px', gap: 4,
        position: 'sticky', top: 64, zIndex: 99
      }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '11px 14px', border: 'none', background: 'none',
              fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 500,
              color: tab === t.key ? '#0057A8' : '#667085',
              cursor: 'pointer', whiteSpace: 'nowrap',
              borderBottom: tab === t.key ? '3px solid #0057A8' : '3px solid transparent',
              transition: 'all 0.2s'
            }}
          >{t.label}</button>
        ))}
      </div>

      {/* CONTENT */}
      <div style={{ padding: 16, flex: 1, maxWidth: 900, margin: '0 auto', width: '100%' }}>
        {tab === 'dashboard' && (
          <Dashboard state={state} currentSite={currentSite} onSelectSite={setCurrentSite} />
        )}
        {tab === 'saisie' && (
          <Saisie state={state} currentSite={currentSite} onSelectSite={setCurrentSite}
            onSave={handleSave} showToast={showToast} />
        )}
        {tab === 'graphiques' && (
          <Graphiques state={state} currentSite={currentSite} onSelectSite={setCurrentSite} />
        )}
        {tab === 'rapports' && (
          <Rapports state={state} showToast={showToast} />
        )}
        {tab === 'sites' && (
          <Sites state={state} onAddSite={handleAddSite}
            onDeleteSite={handleDeleteSite} showToast={showToast} />
        )}
      </div>

      {/* ALERTS MODAL */}
      {alertsModal && (
        <div onClick={() => setAlertsModal(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'flex-end', zIndex: 200
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'white', borderRadius: '20px 20px 0 0',
            padding: 24, width: '100%', maxHeight: '70vh', overflowY: 'auto'
          }}>
            <div style={{ width: 36, height: 4, background: '#E4E7EC', borderRadius: 2, margin: '0 auto 16px' }} />
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
              Alertes actives ({alerts.length})
            </div>
            {alerts.length === 0
              ? <p style={{ fontSize: 13, color: '#667085' }}>✅ Aucune alerte active</p>
              : alerts.map((a, i) => <AlertItem key={i} {...a} />)
            }
          </div>
        </div>
      )}

      <Toast message={toast.msg} visible={toast.visible} />
    </div>
  );
}
