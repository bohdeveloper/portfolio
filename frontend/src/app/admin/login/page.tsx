'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setIsDark(localStorage.getItem('theme') !== 'light');
  }, []);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    const t = next ? 'dark' : 'light';
    localStorage.setItem('theme', t);
    document.documentElement.classList.toggle('dark', next);
    document.documentElement.classList.toggle('light', !next);
  }

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

  const C = {
    bg:     isDark ? '#0f0f0f' : '#f5f5f5',
    card:   isDark ? '#1a1a1a' : '#ffffff',
    border: isDark ? '#2a2a2a' : '#e0e0e0',
    input:  isDark ? '#111'    : '#f8f8f8',
    text:   isDark ? '#e8e6e0' : '#1a1a1a',
    label:  isDark ? '#888'    : '#666',
    muted:  isDark ? '#555'    : '#999',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: C.bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
      position: 'relative',
    }}>
      <button
        onClick={toggleTheme}
        title={isDark ? 'Modo claro' : 'Modo oscuro'}
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'none',
          border: `1px solid ${C.border}`,
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '15px',
        }}
      >
        {isDark ? '☀️' : '🌙'}
      </button>

      <div style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: '12px',
        padding: '2rem',
        width: '100%',
        maxWidth: '360px',
      }}>
        <h1 style={{ color: C.text, fontSize: '18px', fontWeight: 500, marginBottom: '4px' }}>
          Panel Admin
        </h1>
        <p style={{ color: C.muted, fontSize: '12px', marginBottom: '1.5rem' }}>
          bohdeveloper.com
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', color: C.label, fontSize: '12px', marginBottom: '6px' }}>
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoComplete="username"
              style={{
                width: '100%',
                background: C.input,
                border: `1px solid ${C.border}`,
                borderRadius: '8px',
                padding: '10px 12px',
                color: C.text,
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', color: C.label, fontSize: '12px', marginBottom: '6px' }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={{
                width: '100%',
                background: C.input,
                border: `1px solid ${C.border}`,
                borderRadius: '8px',
                padding: '10px 12px',
                color: C.text,
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
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
              background: loading ? (isDark ? '#1a1a1a' : '#f0f0f0') : '#1D6B45',
              border: `1px solid ${loading ? C.border : '#1D6B45'}`,
              borderRadius: '8px',
              color: loading ? C.muted : '#fff',
              fontSize: '14px',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
