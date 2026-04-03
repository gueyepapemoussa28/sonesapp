import React, { useState, useEffect } from 'react';
import { dbFetchUsers, dbInviteUser, dbUpdateUserRole, dbDeleteUser } from '../utils/store.js';

const ROLE_LABELS = { admin: 'Administrateur', user: 'Utilisateur' };
const ROLE_COLORS = { admin: { bg: '#EFF8FF', color: '#0057A8' }, user: { bg: '#F9FAFB', color: '#344054' } };

export default function Admin({ showToast }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ email: '', full_name: '', role: 'user' });
  const [sending, setSending] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    setLoading(true);
    try {
      const data = await dbFetchUsers();
      setUsers(data);
    } catch (e) {
      showToast('❌ Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  }

  async function handleInvite(e) {
    e.preventDefault();
    setSending(true);
    try {
      await dbInviteUser(form);
      showToast('✅ Invitation envoyée à ' + form.email);
      setForm({ email: '', full_name: '', role: 'user' });
      setShowForm(false);
      await loadUsers();
    } catch (err) {
      showToast('❌ Erreur : ' + (err.message || 'Invitation échouée'));
    } finally {
      setSending(false);
    }
  }

  async function handleRoleChange(userId, role) {
    try {
      await dbUpdateUserRole(userId, role);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
      showToast('✅ Rôle mis à jour');
    } catch {
      showToast('❌ Erreur lors du changement de rôle');
    }
  }

  async function handleDelete(userId) {
    try {
      await dbDeleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      showToast('✅ Utilisateur supprimé');
    } catch {
      showToast('❌ Erreur lors de la suppression');
    } finally {
      setConfirmDelete(null);
    }
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px',
    border: '1.5px solid #E4E7EC', borderRadius: 9,
    fontSize: 14, outline: 'none', fontFamily: "'Outfit', sans-serif",
    boxSizing: 'border-box'
  };
  const labelStyle = {
    display: 'block', fontSize: 12, fontWeight: 600,
    color: '#344054', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.4px'
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#101828' }}>Gestion des utilisateurs</div>
          <div style={{ fontSize: 13, color: '#667085', marginTop: 2 }}>{users.length} utilisateur(s) enregistré(s)</div>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          style={{
            background: 'linear-gradient(135deg, #0057A8, #3381C8)',
            color: 'white', border: 'none', borderRadius: 10,
            padding: '10px 16px', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: "'Outfit', sans-serif"
          }}
        >+ Inviter un utilisateur</button>
      </div>

      {/* Formulaire invitation */}
      {showForm && (
        <div style={{
          background: 'white', borderRadius: 14, padding: 20,
          border: '1.5px solid #E4E7EC', marginBottom: 20,
          boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0057A8', marginBottom: 16 }}>
            Nouvel utilisateur
          </div>
          <form onSubmit={handleInvite}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>Nom complet</label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                  placeholder="Ex: Mamadou Diallo"
                  required
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="user@seneau.sn"
                  required
                  style={inputStyle}
                />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Rôle</label>
              <select
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                style={inputStyle}
              >
                <option value="user">Utilisateur</option>
                <option value="admin">Administrateur</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" disabled={sending} style={{
                flex: 1, padding: '11px', background: sending ? '#A0AEBF' : 'linear-gradient(135deg, #0057A8, #3381C8)',
                color: 'white', border: 'none', borderRadius: 9,
                fontSize: 14, fontWeight: 600, cursor: sending ? 'not-allowed' : 'pointer',
                fontFamily: "'Outfit', sans-serif"
              }}>
                {sending ? 'Envoi...' : '📧 Envoyer l\'invitation'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} style={{
                padding: '11px 16px', background: '#F2F4F7', color: '#344054',
                border: 'none', borderRadius: 9, fontSize: 14,
                cursor: 'pointer', fontFamily: "'Outfit', sans-serif"
              }}>Annuler</button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des utilisateurs */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#667085' }}>Chargement...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {users.map(user => (
            <div key={user.id} style={{
              background: 'white', borderRadius: 12, padding: '14px 16px',
              border: '1px solid #E4E7EC', display: 'flex',
              alignItems: 'center', justifyContent: 'space-between', gap: 12,
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0057A8, #00917C)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 700, fontSize: 16, flexShrink: 0
                }}>
                  {(user.full_name || user.email).charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#101828' }}>
                    {user.full_name || '—'}
                  </div>
                  <div style={{ fontSize: 12, color: '#667085' }}>{user.email}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {user.must_change_password && (
                  <span style={{
                    fontSize: 10, padding: '3px 8px', borderRadius: 20,
                    background: '#FEF0E5', color: '#F4720B', fontWeight: 600
                  }}>1er login</span>
                )}
                <select
                  value={user.role}
                  onChange={e => handleRoleChange(user.id, e.target.value)}
                  style={{
                    padding: '5px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                    border: '1.5px solid #E4E7EC', cursor: 'pointer',
                    background: ROLE_COLORS[user.role]?.bg || '#F9FAFB',
                    color: ROLE_COLORS[user.role]?.color || '#344054',
                    fontFamily: "'Outfit', sans-serif"
                  }}
                >
                  <option value="user">Utilisateur</option>
                  <option value="admin">Administrateur</option>
                </select>
                <button
                  onClick={() => setConfirmDelete(user)}
                  style={{
                    background: '#FEE4E2', border: 'none', color: '#D92D20',
                    borderRadius: 8, padding: '6px 10px', fontSize: 12,
                    cursor: 'pointer', fontFamily: "'Outfit', sans-serif", fontWeight: 600
                  }}
                >Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal confirmation suppression */}
      {confirmDelete && (
        <div onClick={() => setConfirmDelete(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: 20
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'white', borderRadius: 16, padding: 28, maxWidth: 360, width: '100%'
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Confirmer la suppression</div>
            <p style={{ fontSize: 14, color: '#667085', marginBottom: 20 }}>
              Supprimer <strong>{confirmDelete.full_name || confirmDelete.email}</strong> ? Cette action est irréversible.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => handleDelete(confirmDelete.id)} style={{
                flex: 1, padding: '10px', background: '#D92D20', color: 'white',
                border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600,
                cursor: 'pointer', fontFamily: "'Outfit', sans-serif"
              }}>Supprimer</button>
              <button onClick={() => setConfirmDelete(null)} style={{
                flex: 1, padding: '10px', background: '#F2F4F7', color: '#344054',
                border: 'none', borderRadius: 9, fontSize: 14,
                cursor: 'pointer', fontFamily: "'Outfit', sans-serif"
              }}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
