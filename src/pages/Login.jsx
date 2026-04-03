import React, { useState } from 'react';
import { dbLogin, dbForgotPassword } from '../utils/store.js';

export default function Login({ onLogin }) {
  const [view, setView] = useState('login'); // 'login' | 'forgot' | 'forgot_sent'
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await dbLogin(email, pass);
      onLogin();
    } catch {
      setError('Identifiants incorrects. Réessayez.');
    } finally {
      setLoading(false);
    }
  }

  async function handleForgot(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await dbForgotPassword(email);
      setView('forgot_sent');
    } catch {
      setError('Email introuvable ou erreur d\'envoi.');
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
  const labelStyle = {
    display: 'block', fontSize: 13, fontWeight: 600,
    color: '#344054', marginBottom: 6
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
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, #0057A8, #00917C)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px', fontSize: 30, color: 'white', fontWeight: 700
          }}>💧</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0057A8', margin: 0 }}>SiteWatch Pro</h1>
          <p style={{ fontSize: 13, color: '#667085', marginTop: 4 }}>
            Supervision hydraulique — SENEAU
          </p>
        </div>

        {/* Vue : connexion */}
        {view === 'login' && (
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Email</label>
              <input
                type="email" value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder="user@seneau.sn"
                autoComplete="email" required
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: 4 }}>
              <label style={labelStyle}>Mot de passe</label>
              <input
                type="password" value={pass}
                onChange={e => { setPass(e.target.value); setError(''); }}
                placeholder="••••••••"
                autoComplete="current-password" required
                style={inputStyle}
              />
            </div>
            <div style={{ textAlign: 'right', marginBottom: 8 }}>
              <button type="button" onClick={() => { setView('forgot'); setError(''); }} style={{
                background: 'none', border: 'none', color: '#0057A8',
                fontSize: 12, cursor: 'pointer', fontFamily: "'Outfit', sans-serif"
              }}>
                Mot de passe oublié ?
              </button>
            </div>
            {error && <p style={{ fontSize: 13, color: '#D92D20', textAlign: 'center', margin: '8px 0' }}>{error}</p>}
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '12px', marginTop: 4,
              background: loading ? '#A0AEBF' : 'linear-gradient(135deg, #0057A8, #3381C8)',
              color: 'white', border: 'none', borderRadius: 10,
              fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: "'Outfit', sans-serif"
            }}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        )}

        {/* Vue : mot de passe oublié */}
        {view === 'forgot' && (
          <form onSubmit={handleForgot}>
            <p style={{ fontSize: 13, color: '#667085', marginBottom: 16 }}>
              Entrez votre email. Vous recevrez un lien pour réinitialiser votre mot de passe.
            </p>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Email</label>
              <input
                type="email" value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder="user@seneau.sn"
                autoComplete="email" required
                style={inputStyle}
              />
            </div>
            {error && <p style={{ fontSize: 13, color: '#D92D20', textAlign: 'center', margin: '8px 0' }}>{error}</p>}
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '12px',
              background: loading ? '#A0AEBF' : 'linear-gradient(135deg, #0057A8, #3381C8)',
              color: 'white', border: 'none', borderRadius: 10,
              fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: "'Outfit', sans-serif"
            }}>
              {loading ? 'Envoi...' : 'Envoyer le lien'}
            </button>
            <button type="button" onClick={() => { setView('login'); setError(''); }} style={{
              width: '100%', marginTop: 10, padding: '10px',
              background: 'none', border: 'none', color: '#667085',
              fontSize: 13, cursor: 'pointer', fontFamily: "'Outfit', sans-serif"
            }}>
              ← Retour à la connexion
            </button>
          </form>
        )}

        {/* Vue : email envoyé */}
        {view === 'forgot_sent' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📧</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#101828', marginBottom: 8 }}>Email envoyé !</div>
            <p style={{ fontSize: 13, color: '#667085', marginBottom: 20 }}>
              Un lien de réinitialisation a été envoyé à <strong>{email}</strong>.
              Vérifiez votre boîte mail.
            </p>
            <button onClick={() => { setView('login'); setError(''); }} style={{
              width: '100%', padding: '11px',
              background: 'linear-gradient(135deg, #0057A8, #3381C8)',
              color: 'white', border: 'none', borderRadius: 10,
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              fontFamily: "'Outfit', sans-serif"
            }}>
              Retour à la connexion
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
