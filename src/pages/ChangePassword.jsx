import React, { useState } from 'react';
import { dbChangePassword, dbMarkPasswordChanged } from '../utils/store.js';

export default function ChangePassword({ userId, isFirstLogin, onDone }) {
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await dbChangePassword(form.password);
      if (isFirstLogin && userId) {
        await dbMarkPasswordChanged(userId);
      }
      onDone();
    } catch (err) {
      setError('Erreur : ' + (err.message || 'Impossible de changer le mot de passe.'));
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    border: '1.5px solid #E4E7EC', borderRadius: 10,
    fontSize: 14, outline: 'none', fontFamily: "'Outfit', sans-serif",
    boxSizing: 'border-box'
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: 'linear-gradient(135deg, #003d7a 0%, #0057A8 55%, #007B6E 100%)',
      padding: 20
    }}>
      <div style={{
        background: 'white', borderRadius: 20, padding: 40,
        width: '100%', maxWidth: 400, boxShadow: '0 24px 48px rgba(0,30,80,0.2)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'linear-gradient(135deg, #0057A8, #00917C)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px', fontSize: 26, color: 'white'
          }}>
            🔐
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#101828', margin: 0 }}>
            {isFirstLogin ? 'Créer votre mot de passe' : 'Nouveau mot de passe'}
          </h2>
          <p style={{ fontSize: 13, color: '#667085', marginTop: 8 }}>
            {isFirstLogin
              ? 'Bienvenue ! Choisissez un mot de passe sécurisé pour votre compte.'
              : 'Entrez votre nouveau mot de passe.'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#344054', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Nouveau mot de passe
            </label>
            <input
              type="password"
              value={form.password}
              onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setError(''); }}
              placeholder="Minimum 8 caractères"
              required
              style={inputStyle}
            />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#344054', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              value={form.confirm}
              onChange={e => { setForm(f => ({ ...f, confirm: e.target.value })); setError(''); }}
              placeholder="••••••••"
              required
              style={inputStyle}
            />
          </div>

          {error && (
            <p style={{ fontSize: 13, color: '#D92D20', textAlign: 'center', margin: '10px 0' }}>{error}</p>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '12px', marginTop: 12,
            background: loading ? '#A0AEBF' : 'linear-gradient(135deg, #0057A8, #3381C8)',
            color: 'white', border: 'none', borderRadius: 10,
            fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: "'Outfit', sans-serif"
          }}>
            {loading ? 'Enregistrement...' : 'Enregistrer le mot de passe'}
          </button>
        </form>
      </div>
    </div>
  );
}
