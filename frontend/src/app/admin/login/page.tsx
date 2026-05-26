'use client';

import { useState, useEffect, useRef } from 'react';

/* ── App registry (mirrored from AdminNavbar) ── */
const ADMIN_APPS = [
  { name: 'Tracker', desc: 'Rutinas y hábitos semanales', path: '/admin/dashboard/tracker' },
] as const;

/* ── Tracker icon ── */
function TrackerIcon({ size = 18 }: { size?: number }) {
  const h = Math.round(size * 0.75);
  return (
    <svg width={size} height={h} viewBox="0 0 16 12" fill="currentColor" aria-hidden="true">
      <rect x="0"  y="0" width="4" height="4" rx="0.75" />
      <rect x="6"  y="0" width="4" height="4" rx="0.75" />
      <rect x="12" y="0" width="4" height="4" rx="0.75" />
      <rect x="0"  y="8" width="4" height="4" rx="0.75" />
      <rect x="6"  y="8" width="4" height="4" rx="0.75" />
      <rect x="12" y="8" width="4" height="4" rx="0.75" opacity="0.3" />
    </svg>
  );
}

/* ── Neural network canvas (more nodes for the login page) ── */
interface NNode { x: number; y: number; vx: number; vy: number; r: number; pulse: number }

function NeuralCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0, h = 0, animId: number;

    function resize() {
      w = canvas!.offsetWidth;
      h = canvas!.offsetHeight;
      canvas!.width  = w * window.devicePixelRatio;
      canvas!.height = h * window.devicePixelRatio;
      ctx!.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    resize();
    window.addEventListener('resize', resize);

    const MAX_DIST = 150;
    const nodes: NNode[] = Array.from({ length: 110 }, () => ({
      x:     Math.random() * w,
      y:     Math.random() * h,
      vx:    (Math.random() - 0.5) * 0.3,
      vy:    (Math.random() - 0.5) * 0.3,
      r:     Math.random() * 1.8 + 0.8,
      pulse: Math.random() * Math.PI * 2,
    }));

    function draw() {
      const isLight = document.documentElement.classList.contains('light');
      const [r, g, b] = isLight ? [0, 168, 191] : [0, 231, 235];

      ctx!.clearRect(0, 0, w, h);

      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy; n.pulse += 0.016;
        if (n.x < 0 || n.x > w) { n.vx *= -1; n.x = Math.max(0, Math.min(w, n.x)); }
        if (n.y < 0 || n.y > h) { n.vy *= -1; n.y = Math.max(0, Math.min(h, n.y)); }
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < MAX_DIST) {
            ctx!.beginPath();
            ctx!.moveTo(nodes[i].x, nodes[i].y);
            ctx!.lineTo(nodes[j].x, nodes[j].y);
            ctx!.strokeStyle = `rgba(${r},${g},${b},${(1 - d / MAX_DIST) * 0.28})`;
            ctx!.lineWidth   = 0.6;
            ctx!.stroke();
          }
        }
      }

      for (const n of nodes) {
        const p = (Math.sin(n.pulse) + 1) / 2;
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, n.r + p * 0.7, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${r},${g},${b},${0.3 + p * 0.5})`;
        ctx!.fill();
      }

      animId = requestAnimationFrame(draw);
    }

    animId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
    />
  );
}

/* ── Login page ── */
export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        /* Hard navigation so CF Pages middleware validates the new cookie */
        window.location.href = '/admin/dashboard';
      } else {
        setLoading(false);
        setError('Credenciales incorrectas');
      }
    } catch {
      setLoading(false);
      setError('Error de conexión');
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '8px',
    padding: '10px 12px',
    color: '#e8e6e0',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  };

  return (
    <>
      <style>{`
        .login-wrapper {
          position: relative;
          min-height: calc(100vh - 88px);
          display: flex;
          overflow: hidden;
          background: #0a0a0a;
          font-family: system-ui, sans-serif;
        }
        html.light .login-wrapper { background: #f0f0f0; }

        .login-left {
          position: relative;
          z-index: 1;
          width: 50%;
          min-width: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2.5rem 2rem;
          background: rgba(8, 8, 8, 0.88);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
        }
        html.light .login-left { background: rgba(245,245,245,0.90); }

        .login-right {
          position: relative;
          z-index: 1;
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2.5rem 2rem;
          gap: 1.5rem;
        }

        .login-form-box {
          width: 100%;
          max-width: 340px;
        }

        .login-app-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          width: 100%;
          max-width: 280px;
        }

        .login-app-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 1rem 1.25rem;
          border: 1px solid rgba(0, 231, 235, 0.18);
          border-radius: 10px;
          background: rgba(0, 231, 235, 0.04);
          backdrop-filter: blur(4px);
          transition: border-color 0.2s, background 0.2s;
          cursor: default;
        }
        .login-app-item:hover {
          border-color: rgba(0, 231, 235, 0.35);
          background: rgba(0, 231, 235, 0.08);
        }
        html.light .login-app-item {
          border-color: rgba(0, 168, 191, 0.2);
          background: rgba(0, 168, 191, 0.05);
        }
        html.light .login-app-item:hover {
          border-color: rgba(0, 168, 191, 0.4);
          background: rgba(0, 168, 191, 0.1);
        }

        @media (max-width: 640px) {
          .login-left  { width: 100%; min-width: 0; background: rgba(8,8,8,0.82); }
          .login-right { display: none; }
        }
        html.light .login-input-focus:focus { border-color: rgba(0,168,191,0.5) !important; }
        .login-input-focus:focus { border-color: rgba(0,231,235,0.45) !important; }
      `}</style>

      <div className="login-wrapper">
        <NeuralCanvas />

        {/* ── Left: login form ── */}
        <div className="login-left">
          <div className="login-form-box">
            <p style={{ color: 'var(--primary)', fontSize: '10px', letterSpacing: '2.5px', textTransform: 'uppercase', marginBottom: '0.75rem', fontWeight: 500 }}>
              Panel Admin
            </p>
            <h1 style={{ color: '#e8e6e0', fontSize: '22px', fontWeight: 300, letterSpacing: '-0.3px', marginBottom: '0.35rem' }}>
              Acceso privado
            </h1>
            <p style={{ color: '#444', fontSize: '12px', marginBottom: '1.75rem' }}>
              bohdeveloper.com
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', color: '#666', fontSize: '11px', letterSpacing: '0.5px', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Usuario
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  className="login-input-focus"
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', color: '#666', fontSize: '11px', letterSpacing: '0.5px', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="login-input-focus"
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
                  background: loading ? 'rgba(255,255,255,0.04)' : '#1D6B45',
                  border: `1px solid ${loading ? 'rgba(255,255,255,0.08)' : '#1D6B45'}`,
                  borderRadius: '8px',
                  color: loading ? '#444' : '#fff',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  transition: 'background 0.2s',
                }}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          </div>
        </div>

        {/* ── Right: neural network + app list ── */}
        <div className="login-right">
          <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
            <p style={{ color: 'var(--primary)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 500, marginBottom: '6px' }}>
              Herramientas
            </p>
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px' }}>
              Disponibles tras el acceso
            </p>
          </div>

          <div className="login-app-list">
            {ADMIN_APPS.map(app => (
              <div key={app.path} className="login-app-item">
                <span style={{ color: 'var(--primary)', marginTop: '2px', flexShrink: 0 }}>
                  <TrackerIcon size={18} />
                </span>
                <div>
                  <div style={{ color: 'var(--primary)', fontSize: '13px', fontWeight: 500, marginBottom: '2px' }}>
                    {app.name}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>
                    {app.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
