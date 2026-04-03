// src/pages/Sites.js
import React, { useState } from 'react';
import { Section, Modal } from '../components/UI.jsx';
import { getLatest } from '../utils/store.js';

export default function Sites({ state, onAddSite, onDeleteSite, showToast }) {
  const { sites, saisies } = state;
  const [modalOpen, setModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newLoc, setNewLoc] = useState('');
  const [newStatus, setNewStatus] = useState('online');

  function handleAdd() {
    if (!newName.trim()) return;
    onAddSite({ name: newName.trim(), loc: newLoc.trim(), status: newStatus });
    showToast('✅ Site "' + newName + '" créé');
    setNewName(''); setNewLoc(''); setNewStatus('online');
    setModalOpen(false);
  }

  function handleDelete(i) {
    if (sites.length <= 1) { showToast('❌ Impossible — au moins un site requis'); return; }
    const name = sites[i].name;
    onDeleteSite(i);
    showToast('Site supprimé: ' + name);
  }

  const inputStyle = {
    padding: '9px 12px', border: '1.5px solid #E4E7EC', borderRadius: 9,
    fontSize: 14, outline: 'none', background: 'white', width: '100%',
    fontFamily: "'Outfit', sans-serif", marginTop: 4, boxSizing: 'border-box'
  };
  const labelStyle = { fontSize: 11, fontWeight: 600, color: '#344054', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block' };

  const statusColors = { online: '#027A48', warn: '#F4720B', offline: '#D92D20' };
  const statusLabels = { online: 'En ligne', warn: 'Attention', offline: 'Hors ligne' };

  return (
    <div>
      {sites.map((site, i) => {
        const latest = getLatest(saisies, site.id);
        return (
          <Section key={site.id}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: '#E8F2FF', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 20, flexShrink: 0
                }}>💧</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{site.name}</div>
                  <div style={{ fontSize: 12, color: '#667085' }}>{site.loc}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: statusColors[site.status] || '#027A48',
                      display: 'inline-block'
                    }} />
                    <span style={{ fontSize: 11, color: statusColors[site.status], fontWeight: 600 }}>
                      {statusLabels[site.status] || 'En ligne'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleDelete(i)}
                style={{
                  background: '#FEE4E2', color: '#D92D20', border: 'none',
                  borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 12
                }}
              >✕</button>
            </div>

            {latest && (
              <div style={{
                marginTop: 12, padding: '10px 12px', background: '#F9FAFB',
                borderRadius: 10, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8
              }}>
                <div>
                  <div style={{ fontSize: 10, color: '#667085', fontWeight: 600 }}>PRESSION</div>
                  <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'Space Mono', monospace", color: latest.pression < 2 ? '#D92D20' : '#0057A8' }}>
                    {latest.pression} <span style={{ fontSize: 10, fontWeight: 400 }}>bars</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: '#667085', fontWeight: 600 }}>CARBURANT</div>
                  <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'Space Mono', monospace", color: latest.carburant < 20 ? '#D92D20' : '#027A48' }}>
                    {latest.carburant}<span style={{ fontSize: 10, fontWeight: 400 }}>%</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: '#667085', fontWeight: 600 }}>DERNIÈRE</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#1D2939' }}>{latest.date}</div>
                </div>
              </div>
            )}
          </Section>
        );
      })}

      <button
        onClick={() => setModalOpen(true)}
        style={{
          background: 'linear-gradient(135deg,#0057A8,#3381C8)', color: 'white',
          border: 'none', borderRadius: 10, padding: '13px 20px',
          fontSize: 14, fontWeight: 600, width: '100%', cursor: 'pointer',
          fontFamily: "'Outfit', sans-serif", boxShadow: '0 4px 12px rgba(0,87,168,0.3)'
        }}
      >
        + Ajouter un nouveau site
      </button>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nouveau site hydraulique">
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Nom du site</label>
          <input
            type="text" value={newName} onChange={e => setNewName(e.target.value)}
            placeholder="Ex: Forage F4 Ziguinchor" style={inputStyle}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Localisation</label>
          <input
            type="text" value={newLoc} onChange={e => setNewLoc(e.target.value)}
            placeholder="Ex: Ziguinchor" style={inputStyle}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Statut initial</label>
          <select value={newStatus} onChange={e => setNewStatus(e.target.value)} style={inputStyle}>
            <option value="online">En ligne</option>
            <option value="warn">Attention</option>
            <option value="offline">Hors ligne</option>
          </select>
        </div>
        <button
          onClick={handleAdd}
          style={{
            background: 'linear-gradient(135deg,#0057A8,#3381C8)', color: 'white',
            border: 'none', borderRadius: 10, padding: '12px', fontSize: 14,
            fontWeight: 600, width: '100%', cursor: 'pointer', fontFamily: "'Outfit', sans-serif"
          }}
        >
          Créer le site
        </button>
      </Modal>
    </div>
  );
}
