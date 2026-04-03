import React, { useState, useCallback, useEffect } from 'react';
import Login from './pages/Login.jsx';
import ChangePassword from './pages/ChangePassword.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Saisie from './pages/Saisie.jsx';
import Graphiques from './pages/Graphiques.jsx';
import Rapports from './pages/Rapports.jsx';
import Sites from './pages/Sites.jsx';
import Admin from './pages/Admin.jsx';
import { Toast, AlertItem } from './components/UI.jsx';
import { computeAlerts } from './utils/store';
import {
  dbGetSession, dbLogout, dbGetProfile,
  dbFetchSites, dbAddSite, dbDeleteSite,
  dbFetchSaisies, dbUpsertSaisie
} from './utils/store';

const EMPTY_STATE = { sites: [], saisies: {} };

export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState('dashboard');
  const [currentSite, setCurrentSite] = useState(0);
  const [state, setState] = useState(EMPTY_STATE);
  const [toast, setToast] = useState({ msg: '', visible: false });
  const [alertsModal, setAlertsModal] = useState(false);
  const [appLoading, setAppLoading] = useState(true);

  // Check session on mount (handles password reset redirect too)
  useEffect(() => {
    dbGetSession().then(s => {
      if (s) {
        setSession(s);
        loadProfile(s.user.id);
      } else {
        setAppLoading(false);
      }
    });
  }, []);

  async function loadProfile(userId) {
    try {
      const p = await dbGetProfile(userId);
      setProfile(p);
      if (!p.must_change_password) {
        await loadAllData();
      }
    } catch {
      // profile not yet created (race condition), retry once
      setTimeout(() => loadProfile(userId), 1000);
    } finally {
      setAppLoading(false);
    }
  }

  async function loadAllData() {
    try {
      const sites = await dbFetchSites();
      const saisies = {};
      await Promise.all(sites.map(async site => {
        const rows = await dbFetchSaisies(site.id);
        saisies[site.id] = rows;
      }));
      setState({ sites, saisies });
    } catch (e) {
      console.error('Erreur chargement données', e);
    }
  }

  function showToast(msg) {
    setToast({ msg, visible: true });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2800);
  }

  const handleLogin = useCallback(async () => {
    const s = await dbGetSession();
    setSession(s);
    if (s) await loadProfile(s.user.id);
  }, []);

  const handlePasswordChanged = useCallback(async () => {
    if (session) {
      const p = await dbGetProfile(session.user.id);
      setProfile(p);
      await loadAllData();
    }
  }, [session]);

  const handleLogout = useCallback(async () => {
    await dbLogout();
    setSession(null);
    setProfile(null);
    setState(EMPTY_STATE);
    setCurrentSite(0);
    setTab('dashboard');
  }, []);

  const handleSave = useCallback(async (siteId, entry) => {
    try {
      await dbUpsertSaisie(siteId, entry);
      setState(prev => {
        const rows = [...(prev.saisies[siteId] || [])];
        const idx = rows.findIndex(r => r.date === entry.date);
        if (idx >= 0) rows[idx] = { ...rows[idx], ...entry };
        else rows.push(entry);
        rows.sort((a, b) => a.date.localeCompare(b.date));
        return { ...prev, saisies: { ...prev.saisies, [siteId]: rows } };
      });
    } catch {
      showToast('❌ Erreur lors de la sauvegarde');
    }
  }, []);

  const handleAddSite = useCallback(async ({ name, loc, status }) => {
    try {
      const newSite = await dbAddSite({ name, loc, status });
      setState(prev => ({
        ...prev,
        sites: [...prev.sites, newSite],
        saisies: { ...prev.saisies, [newSite.id]: [] }
      }));
    } catch {
      showToast('❌ Erreur lors de l\'ajout du site');
    }
  }, []);

  const handleDeleteSite = useCallback(async (idx) => {
    const site = state.sites[idx];
    if (!site) return;
    try {
      await dbDeleteSite(site.id);
      setState(prev => {
        const sites = prev.sites.filter((_, i) => i !== idx);
        const saisies = { ...prev.saisies };
        delete saisies[site.id];
        return { ...prev, sites, saisies };
      });
      setCurrentSite(c => Math.max(0, Math.min(c, state.sites.length - 2)));
    } catch {
      showToast('❌ Erreur lors de la suppression');
    }
  }, [state.sites]);

  const isAdmin = profile?.role === 'admin';

  const TABS = [
    { key: 'dashboard', label: '📊 Dashboard' },
    { key: 'saisie', label: '✏️ Saisie' },
    { key: 'graphiques', label: '📈 Graphiques' },
    { key: 'rapports', label: '📋 Rapports' },
    { key: 'sites', label: '🏗 Sites' },
    ...(isAdmin ? [{ key: 'admin', label: '👤 Admin' }] : []),
  ];

  const alerts = computeAlerts(state.sites, state.saisies);
  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  // Loading
  if (appLoading) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: '#F9FAFB', flexDirection: 'column', gap: 16
    }}>
      <div style={{ fontSize: 40 }}>💧</div>
      <p style={{ color: '#0057A8', fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>Chargement...</p>
    </div>
  );

  // Non connecté
  if (!session) return <Login onLogin={handleLogin} />;

  // 1er login ou reset de mot de passe → forcer le changement
  if (profile?.must_change_password) {
    return (
      <ChangePassword
        userId={session.user.id}
        isFirstLogin={true}
        onDone={handlePasswordChanged}
      />
    );
  }

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
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
          }}>💧</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1 }}>SiteWatch Pro</div>
            <div style={{ fontSize: 10, opacity: 0.75, marginTop: 2, textTransform: 'capitalize' }}>{dateStr}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {profile?.full_name && (
            <span style={{ fontSize: 12, opacity: 0.85 }}>{profile.full_name}</span>
          )}
          <button onClick={() => setAlertsModal(true)} style={{
            background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white',
            borderRadius: 8, padding: '6px 10px', cursor: 'pointer',
            fontSize: 13, fontFamily: "'Outfit', sans-serif",
            display: 'flex', alignItems: 'center', gap: 6
          }}>
            ⚠
            {alerts.length > 0 && (
              <span style={{
                background: '#F4720B', color: 'white', borderRadius: '50%',
                width: 18, height: 18, fontSize: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700
              }}>{alerts.length}</span>
            )}
          </button>
          <button onClick={handleLogout} style={{
            background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white',
            borderRadius: 8, padding: '6px 10px', cursor: 'pointer',
            fontSize: 13, fontFamily: "'Outfit', sans-serif"
          }}>↪ Sortir</button>
        </div>
      </div>

      {/* NAV TABS */}
      <div style={{
        background: 'white', borderBottom: '1px solid #E4E7EC',
        display: 'flex', overflowX: 'auto', padding: '0 16px', gap: 4,
        position: 'sticky', top: 64, zIndex: 99
      }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '11px 14px', border: 'none', background: 'none',
            fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 500,
            color: tab === t.key ? '#0057A8' : '#667085',
            cursor: 'pointer', whiteSpace: 'nowrap',
            borderBottom: tab === t.key ? '3px solid #0057A8' : '3px solid transparent',
            transition: 'all 0.2s'
          }}>{t.label}</button>
        ))}
      </div>

      {/* CONTENT */}
      <div style={{ padding: 16, flex: 1, maxWidth: 900, margin: '0 auto', width: '100%' }}>
        {tab === 'dashboard' && <Dashboard state={state} currentSite={currentSite} onSelectSite={setCurrentSite} />}
        {tab === 'saisie' && <Saisie state={state} currentSite={currentSite} onSelectSite={setCurrentSite} onSave={handleSave} showToast={showToast} />}
        {tab === 'graphiques' && <Graphiques state={state} currentSite={currentSite} onSelectSite={setCurrentSite} />}
        {tab === 'rapports' && <Rapports state={state} showToast={showToast} />}
        {tab === 'sites' && <Sites state={state} onAddSite={handleAddSite} onDeleteSite={handleDeleteSite} showToast={showToast} />}
        {tab === 'admin' && isAdmin && <Admin showToast={showToast} />}
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
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Alertes actives ({alerts.length})</div>
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
