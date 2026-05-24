'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push('/admin/dashboard');
    } else {
      setError('Credenciales incorrectas');
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--adm-input)',
    border: '1px solid var(--adm-border)',
    borderRadius: '8px',
    padding: '10px 12px',
    color: 'var(--adm-text)',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  };

  return (
    /* push below the fixed portfolio navbar (~73px) */
    <div style={{
      minHeight: 'calc(100vh - 73px)',
      marginTop: '73px',
      background: 'var(--adm-bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
      padding: '2rem 1rem',
    }}>
      <div style={{
        background: 'var(--adm-card)',
        border: '1px solid var(--adm-border)',
        borderRadius: '12px',
        padding: '2rem',
        width: '100%',
        maxWidth: '360px',
      }}>
        <h1 style={{ color: 'var(--adm-text)', fontSize: '18px', fontWeight: 500, marginBottom: '4px' }}>
          Panel Admin
        </h1>
        <p style={{ color: 'var(--adm-muted)', fontSize: '12px', marginBottom: '1.5rem' }}>
          bohdeveloper.com
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', color: 'var(--adm-label)', fontSize: '12px', marginBottom: '6px' }}>
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoComplete="username"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', color: 'var(--adm-label)', fontSize: '12px', marginBottom: '6px' }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={inputStyle}
            />
          </div>

          {error && (
            <p style={{ color: '#D85A30', fontSize: '12px', marginBottom: '1rem' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px',
              background: loading ? 'var(--adm-card)' : '#1D6B45',
              border: `1px solid ${loading ? 'var(--adm-border)' : '#1D6B45'}`,
              borderRadius: '8px',
              color: loading ? 'var(--adm-muted)' : '#fff',
              fontSize: '14px',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
