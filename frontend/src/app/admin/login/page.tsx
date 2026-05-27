'use client';

import { useState, useEffect, useRef } from 'react';

const ADMIN_APPS = [
  { name: 'Tracker' },
  { name: 'Blog' },
  { name: 'Moneta' },
] as const;

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

interface AppPos {
  top: string; left: string;
  phase: number; speedX: number; speedY: number; ampX: number; ampY: number;
}

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [checking, setChecking] = useState(true);
  const [appPositions, setAppPositions] = useState<AppPos[] | null>(null);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);

  /* Redirect to dashboard if session already valid */
  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then((res: { ok: boolean }) => {
        if (res.ok) window.location.href = '/admin/dashboard';
        else setChecking(false);
      })
      .catch(() => setChecking(false));
  }, []);

  useEffect(() => {
    setAppPositions(
      ADMIN_APPS.map(() => ({
        top:    `${15 + Math.random() * 62}%`,
        left:   `${8  + Math.random() * 68}%`,
        phase:  Math.random() * Math.PI * 2,
        speedX: 0.007 + Math.random() * 0.006,
        speedY: 0.005 + Math.random() * 0.007,
        ampX:   18 + Math.random() * 28,
        ampY:   12 + Math.random() * 22,
      }))
    );
  }, []);

  /* Drift animation — moves labels directly via DOM to avoid React re-renders */
  useEffect(() => {
    if (!appPositions) return;
    let animId: number;
    let t = 0;
    function animate() {
      t += 1;
      appPositions!.forEach((pos, i) => {
        const el = labelRefs.current[i];
        if (!el) return;
        const tx = Math.sin(t * pos.speedX + pos.phase) * pos.ampX;
        const ty = Math.cos(t * pos.speedY + pos.phase * 0.8) * pos.ampY;
        el.style.transform = `translate(${tx}px, ${ty}px)`;
      });
      animId = requestAnimationFrame(animate);
    }
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [appPositions]);

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

  if (checking) return (
    <div style={{ minHeight: 'calc(100vh - 88px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', fontFamily: 'system-ui, sans-serif' }}>
      <p style={{ color: '#555', fontSize: '13px' }}>Verificando sesión...</p>
    </div>
  );

  return (
    <>
      <style>{`
        .login-wrapper {
          position: relative; min-height: calc(100vh - 88px);
          display: flex; overflow: hidden;
          background: #0a0a0a; font-family: system-ui, sans-serif;
        }
        html.light .login-wrapper { background: #f0f0f0; }

        .login-left {
          position: relative; z-index: 1; width: 50%; min-width: 300px;
          display: flex; align-items: center; justify-content: center;
          padding: 2.5rem 2rem;
          background: rgba(8,8,8,0.88);
          backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
        }
        html.light .login-left { background: rgba(245,245,245,0.92); }

        .login-right {
          position: relative; z-index: 1; flex: 1; overflow: hidden;
        }

        .login-form-box { width: 100%; max-width: 340px; }

        .login-title {
          color: #e8e6e0; font-size: 22px; font-weight: 300;
          letter-spacing: -0.3px; margin: 0 0 0.35rem;
        }
        html.light .login-title { color: #1a1a1a; }

        .login-domain { color: #555; font-size: 12px; margin: 0 0 1.75rem; }
        html.light .login-domain { color: #666; }

        .login-label {
          display: block; color: #555; font-size: 11px;
          letter-spacing: 0.5px; margin-bottom: 6px; text-transform: uppercase;
        }
        html.light .login-label { color: #666; }

        .login-input {
          width: 100%; border-radius: 8px; padding: 10px 12px;
          color: #e8e6e0; font-size: 14px; outline: none;
          box-sizing: border-box; font-family: inherit;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          transition: border-color 0.15s;
        }
        html.light .login-input {
          background: rgba(0,0,0,0.05);
          border-color: rgba(0,0,0,0.15);
          color: #1a1a1a;
        }
        .login-input:focus { border-color: rgba(0,231,235,0.45); outline: none; }
        html.light .login-input:focus { border-color: rgba(0,168,191,0.5); }

        .login-btn {
          width: 100%; padding: 10px;
          background: transparent; border: 1px solid var(--primary);
          border-radius: 8px; color: var(--primary);
          font-size: 14px; font-weight: 500; cursor: pointer;
          font-family: inherit; transition: background 0.2s, color 0.2s;
        }
        .login-btn:hover:not(:disabled) { background: var(--primary); color: #000; }
        .login-btn:disabled {
          opacity: 0.4; cursor: not-allowed;
          border-color: rgba(255,255,255,0.08); color: #555;
        }
        html.light .login-btn:disabled { border-color: rgba(0,0,0,0.1); }

        .login-back {
          background: none; border: none; color: #555; font-size: 12px;
          cursor: pointer; font-family: inherit;
          display: flex; align-items: center; gap: 5px;
          padding: 0; margin-top: 1.25rem; transition: color 0.15s;
        }
        .login-back:hover { color: var(--primary); }
        html.light .login-back { color: #777; }

        .login-app-float {
          position: absolute;
          color: var(--primary); font-size: 13px; font-weight: 500; letter-spacing: 0.5px;
          pointer-events: none; opacity: 0.65; white-space: nowrap;
          text-shadow: 0 0 24px rgba(0,231,235,0.4);
        }
        html.light .login-app-float { text-shadow: 0 0 18px rgba(0,168,191,0.3); }

        @media (max-width: 640px) {
          .login-left  { width: 100%; min-width: 0; background: rgba(8,8,8,0.82); }
          .login-right { display: none; }
        }
      `}</style>

      <div className="login-wrapper">
        <NeuralCanvas />

        {/* ── Left: login form ── */}
        <div className="login-left">
          <div className="login-form-box">
            <p style={{ color: 'var(--primary)', fontSize: '10px', letterSpacing: '2.5px', textTransform: 'uppercase', marginBottom: '0.75rem', fontWeight: 500 }}>
              Panel Admin
            </p>
            <h1 className="login-title">Acceso privado</h1>
            <p className="login-domain">bohdeveloper.com</p>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="login-label">Usuario</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  className="login-input"
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="login-label">Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="login-input"
                />
              </div>

              {error && (
                <p style={{ color: '#D85A30', fontSize: '12px', marginBottom: '1rem' }}>{error}</p>
              )}

              <button type="submit" disabled={loading} className="login-btn">
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>

            <button onClick={() => { window.location.href = '/'; }} className="login-back">
              ← Volver al portfolio
            </button>
          </div>
        </div>

        {/* ── Right: floating app labels over the neural network ── */}
        <div className="login-right">
          {appPositions && ADMIN_APPS.map((app, i) => (
            <span
              key={app.name}
              ref={el => { labelRefs.current[i] = el; }}
              className="login-app-float"
              style={{ top: appPositions[i].top, left: appPositions[i].left }}
            >
              {app.name}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
