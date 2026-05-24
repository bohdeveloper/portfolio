'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminTheme } from './AdminThemeCtx';

/* ── App registry — add new tools here ── */
const APPS = [
  {
    name: 'Tracker',
    icon: '📅',
    desc: 'Rutinas y hábitos semanales',
    path: '/admin/dashboard/tracker',
  },
] as const;

/* ── Neural network canvas ── */
interface Node { x: number; y: number; vx: number; vy: number; r: number; pulse: number; }

function NeuralCanvas({ isDark }: { isDark: boolean }) {
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
      canvas!.width  = w;
      canvas!.height = h;
    }
    resize();
    window.addEventListener('resize', resize);

    const MAX_DIST = 120;
    const [r, g, b] = isDark ? [93, 202, 165] : [29, 107, 69];

    const nodes: Node[] = Array.from({ length: 50 }, () => ({
      x:     Math.random() * w,
      y:     Math.random() * h,
      vx:    (Math.random() - 0.5) * 0.35,
      vy:    (Math.random() - 0.5) * 0.35,
      r:     Math.random() * 1.5 + 1,
      pulse: Math.random() * Math.PI * 2,
    }));

    function draw() {
      ctx!.clearRect(0, 0, w, h);

      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy; n.pulse += 0.018;
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
            ctx!.strokeStyle = `rgba(${r},${g},${b},${(1 - d / MAX_DIST) * 0.22})`;
            ctx!.lineWidth   = 0.5;
            ctx!.stroke();
          }
        }
      }

      for (const n of nodes) {
        const p = (Math.sin(n.pulse) + 1) / 2;
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, n.r + p * 0.6, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${r},${g},${b},${0.35 + p * 0.45})`;
        ctx!.fill();
      }

      animId = requestAnimationFrame(draw);
    }

    animId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
    />
  );
}

/* ── Dashboard home ── */
export default function DashboardPage() {
  const router = useRouter();
  const { isDark } = useAdminTheme();

  const bg         = isDark ? '#0f0f0f' : '#f0f0f0';
  const text       = isDark ? '#e8e6e0' : '#1a1a1a';
  const muted      = isDark ? '#555555' : '#777777';
  const cardBg     = isDark ? 'rgba(17,17,17,0.85)' : 'rgba(255,255,255,0.90)';
  const cardBorder = isDark ? '#1e1e1e'              : '#e0e0e0';

  return (
    <div style={{
      position: 'relative',
      minHeight: 'calc(100vh - 48px)',
      background: bg,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <NeuralCanvas isDark={isDark} />

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 1.5rem' }}>
        <p style={{
          color: '#5DCAA5',
          fontSize: '10px',
          letterSpacing: '2.5px',
          textTransform: 'uppercase',
          marginBottom: '1rem',
          fontWeight: 500,
        }}>
          Panel Admin
        </p>

        <h1 style={{ color: text, fontSize: '26px', fontWeight: 300, letterSpacing: '-0.3px', marginBottom: '0.5rem' }}>
          Bienvenido, Borja
        </h1>

        <p style={{ color: muted, fontSize: '13px', marginBottom: '2.5rem' }}>
          Selecciona una herramienta
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {APPS.map(app => (
            <button
              key={app.path}
              onClick={() => router.push(app.path)}
              style={{
                background: cardBg,
                border: `1px solid ${cardBorder}`,
                borderRadius: '12px',
                padding: '1.5rem 2rem',
                cursor: 'pointer',
                textAlign: 'left',
                minWidth: '180px',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                transition: 'border-color 0.2s, transform 0.15s, box-shadow 0.2s',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.borderColor = '#5DCAA5';
                el.style.transform   = 'translateY(-3px)';
                el.style.boxShadow   = isDark ? '0 8px 30px rgba(93,202,165,0.10)' : '0 8px 30px rgba(93,202,165,0.15)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.borderColor = cardBorder;
                el.style.transform   = 'translateY(0)';
                el.style.boxShadow   = 'none';
              }}
            >
              <div style={{ fontSize: '28px', marginBottom: '0.75rem' }}>{app.icon}</div>
              <div style={{ color: text,  fontSize: '14px', fontWeight: 500 }}>{app.name}</div>
              <div style={{ color: muted, fontSize: '11px', marginTop: '3px' }}>{app.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
