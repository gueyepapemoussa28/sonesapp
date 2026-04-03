import React, { useState, useCallback, useEffect } from 'react';
import Login from './pages/Login.jsx';
import ChangePassword from './pages/ChangePassword.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Saisie from './pages/Saisie.jsx';
import Graphiques from './pages/Graphiques.jsx';
import Rapports from './pages/Rapports.jsx';
import Sites from './pages/Sites.jsx';
import Admin from './pages/Admin.jsx';
import { Toast, AlertItem, Modal } from './components/UI.jsx';
import { computeAlerts } from './utils/store';
import {
  dbGetSession, dbLogout, dbGetProfile,
  dbFetchSites, dbAddSite, dbDeleteSite,
  dbFetchSaisies, dbUpsertSaisie
} from './utils/store';

const EMPTY_STATE = { sites: [], saisies: {} };

// Nav items config
const NAV = [
  { key: 'dashboard',  label: 'Dashboard',  icon: '◉' },
  { key: 'saisie',     label: 'Saisie',     icon: '✏' },
  { key: 'graphiques', label: 'Graphiques', icon: '↗' },
  { key: 'rapports',   label: 'Rapports',   icon: '≡' },
  { key: 'sites',      label: 'Sites',      icon: '◈' },
];

export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState('dashboard');
  const [currentSite, setCurrentSite] = useState(0);
  const [state, setState] = useState(EMPTY_STATE);
  const [toast, setToast] = useState({ msg: '', visible: false });
  const [alertsModal, setAlertsModal] = useState(false);
  const [appLoading, setAppLoading] = useState(true);

  useEffect(() => {
    dbGetSession().then(s => {
      if (s) { setSession(s); loadProfile(s.user.id); }
      else setAppLoading(false);
    });
  }, []);

  async function loadProfile(userId) {
    try {
      const p = await dbGetProfile(userId);
      setProfile(p);
      if (!p.must_change_password) await loadAllData();
    } catch {
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
        saisies[site.id] = await dbFetchSaisies(site.id);
      }));
      setState({ sites, saisies });
    } catch (e) { console.error(e); }
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
    setSession(null); setProfile(null);
    setState(EMPTY_STATE); setCurrentSite(0); setTab('dashboard');
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
    } catch { showToast('❌ Erreur lors de la sauvegarde'); }
  }, []);

  const handleAddSite = useCallback(async ({ name, loc, status }) => {
    try {
      const newSite = await dbAddSite({ name, loc, status });
      setState(prev => ({
        ...prev, sites: [...prev.sites, newSite],
        saisies: { ...prev.saisies, [newSite.id]: [] }
      }));
    } catch { showToast('❌ Erreur lors de l\'ajout du site'); }
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
    } catch { showToast('❌ Erreur lors de la suppression'); }
  }, [state.sites]);

  const isAdmin = profile?.role === 'admin';
  const navItems = isAdmin ? [...NAV, { key: 'admin', label: 'Admin', icon: '⚙' }] : NAV;
  const alerts = computeAlerts(state.sites, state.saisies);
  const now = new Date();

  // Loading screen
  if (appLoading) return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '100vh',
      background: 'linear-gradient(135deg, #003d7a 0%, #0057A8 60%, #007B6E 100%)',
      gap: 16
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        background: 'rgba(255,255,255,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 32, animation: 'pulse-dot 1.5s infinite'
      }}>💧</div>
      <p style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600, fontFamily: "'Outfit', sans-serif", fontSize: 15 }}>
        Chargement...
      </p>
    </div>
  );

  if (!session) return <Login onLogin={handleLogin} />;
  if (profile?.must_change_password) return (
    <ChangePassword userId={session.user.id} isFirstLogin={true} onDone={handlePasswordChanged} />
  );

  const pageTitle = {
    dashboard: 'Tableau de bord', saisie: 'Saisie des données',
    graphiques: 'Graphiques', rapports: 'Rapports', sites: 'Gestion des sites', admin: 'Administration'
  }[tab];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#F0F5FC' }}>

      {/* ── HEADER ── */}
      <div style={{
        background: 'linear-gradient(135deg, #003d7a 0%, #0057A8 100%)',
        color: 'white', padding: '12px 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 2px 12px rgba(0,40,100,0.25)'
      }}>
        {/* Left: logo + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'rgba(255,255,255,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 700, backdropFilter: 'blur(8px)'
          }}>💧</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-0.3px', lineHeight: 1 }}>SiteWatch Pro</div>
            <div style={{ fontSize: 10, opacity: 0.65, marginTop: 2 }}>
              {now.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
            </div>
          </div>
        </div>

        {/* Right: alerts + user */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => setAlertsModal(true)} style={{
            background: 'rgba(255,255,255,0.12)', border: 'none', color: 'white',
            borderRadius: 10, width: 36, height: 36, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, position: 'relative'
          }}>
            🔔
            {alerts.length > 0 && (
              <span style={{
                position: 'absolute', top: 4, right: 4,
                width: 8, height: 8, borderRadius: '50%',
                background: '#F4720B', border: '1.5px solid #0057A8'
              }} />
            )}
          </button>

          <button onClick={handleLogout} style={{
            background: 'rgba(255,255,255,0.12)', border: 'none', color: 'white',
            borderRadius: 10, padding: '0 12px', height: 36, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600,
            fontFamily: "'Outfit', sans-serif"
          }}>
            <div style={{
              width: 20, height: 20, borderRadius: '50%',
              background: 'rgba(255,255,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 700
            }}>
              {(profile?.full_name || profile?.email || '?').charAt(0).toUpperCase()}
            </div>
            <span style={{ display: 'none' }}>{profile?.full_name?.split(' ')[0]}</span>
            ↪
          </button>
        </div>
      </div>

      {/* ── PAGE TITLE BAR ── */}
      <div style={{
        background: 'white', borderBottom: '1px solid #EAECF0',
        padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 8
      }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#101828' }}>{pageTitle}</span>
        {alerts.length > 0 && tab === 'dashboard' && (
          <span style={{
            background: '#FEF0E5', color: '#F4720B', fontSize: 10,
            fontWeight: 700, padding: '2px 7px', borderRadius: 20
          }}>{alerts.length} alerte{alerts.length > 1 ? 's' : ''}</span>
        )}
      </div>

      {/* ── CONTENT ── */}
      <div className="page-content">
        {tab === 'dashboard'  && <Dashboard state={state} currentSite={currentSite} onSelectSite={setCurrentSite} />}
        {tab === 'saisie'     && <Saisie state={state} currentSite={currentSite} onSelectSite={setCurrentSite} onSave={handleSave} showToast={showToast} />}
        {tab === 'graphiques' && <Graphiques state={state} currentSite={currentSite} onSelectSite={setCurrentSite} />}
        {tab === 'rapports'   && <Rapports state={state} showToast={showToast} />}
        {tab === 'sites'      && <Sites state={state} onAddSite={handleAddSite} onDeleteSite={handleDeleteSite} showToast={showToast} />}
        {tab === 'admin' && isAdmin && <Admin showToast={showToast} />}
      </div>

      {/* ── BOTTOM NAV ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.96)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid #EAECF0',
        display: 'flex', alignItems: 'stretch',
        boxShadow: '0 -4px 20px rgba(16,24,40,0.08)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)'
      }}>
        {navItems.map(item => {
          const active = tab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 3, padding: '10px 4px',
                border: 'none', background: 'none', cursor: 'pointer',
                color: active ? '#0057A8' : '#98A2B3',
                transition: 'color 0.2s',
                fontFamily: "'Outfit', sans-serif",
                position: 'relative'
              }}
            >
              {active && (
                <div style={{
                  position: 'absolute', top: 0, left: '50%',
                  transform: 'translateX(-50%)',
                  width: 24, height: 3, borderRadius: '0 0 4px 4px',
                  background: '#0057A8'
                }} />
              )}
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: active ? '#EBF3FF' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, transition: 'background 0.2s'
              }}>
                {item.icon}
              </div>
              <span style={{ fontSize: 10, fontWeight: active ? 700 : 500 }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── ALERTS MODAL ── */}
      <Modal open={alertsModal} onClose={() => setAlertsModal(false)} title={`Alertes actives (${alerts.length})`}>
        {alerts.length === 0
          ? <div style={{ textAlign: 'center', padding: '24px 0', color: '#667085' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Aucune alerte active</div>
            </div>
          : alerts.map((a, i) => <AlertItem key={i} {...a} />)
        }
      </Modal>

      <Toast message={toast.msg} visible={toast.visible} />
    </div>
  );
}
