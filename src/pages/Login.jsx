import React, { useState } from 'react';
import { dbLogin } from '../utils/store.js';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await dbLogin(email, pass);
      onLogin();
    } catch (err) {
      setError('Identifiants incorrects. Réessayez.');
    } finally {
      setLoading(false);
    }
  }

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
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, #0057A8, #00917C)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px', fontSize: 30, color: 'white', fontWeight: 700
          }}>
            💧
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0057A8' }}>SiteWatch Pro</h1>
          <p style={{ fontSize: 13, color: '#667085', marginTop: 4 }}>
            Supervision hydraulique — SENEAU
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#344054', marginBottom: 6 }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              placeholder="admin@seneau.sn"
              autoComplete="email"
              required
              style={{
                width: '100%', padding: '10px 14px',
                border: '1.5px solid #E4E7EC', borderRadius: 10,
                fontSize: 14, outline: 'none', fontFamily: "'Outfit', sans-serif",
                boxSizing: 'border-box'
              }}
            />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#344054', marginBottom: 6 }}>
              Mot de passe
            </label>
            <input
              type="password"
              value={pass}
              onChange={e => { setPass(e.target.value); setError(''); }}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              style={{
                width: '100%', padding: '10px 14px',
                border: '1.5px solid #E4E7EC', borderRadius: 10,
                fontSize: 14, outline: 'none', fontFamily: "'Outfit', sans-serif",
                boxSizing: 'border-box'
              }}
            />
          </div>

          {error && (
            <p style={{ fontSize: 13, color: '#D92D20', textAlign: 'center', margin: '8px 0' }}>{error}</p>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '12px', marginTop: 12,
            background: loading ? '#A0AEBF' : 'linear-gradient(135deg, #0057A8, #3381C8)',
            color: 'white', border: 'none', borderRadius: 10,
            fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: "'Outfit', sans-serif"
          }}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}
