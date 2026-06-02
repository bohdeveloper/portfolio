'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

/* ── Per-app icons ── */
function TrackerIcon({ size = 28 }: { size?: number }) {
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
function BlogIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="2" width="13" height="18" rx="2" />
      <path d="M6 7h7M6 11h7M6 15h4" />
      <path d="M15 14l4 4-2 2-4-4 .5-2.5z" fill="currentColor" stroke="none" opacity=".85" />
    </svg>
  );
}
function MonetaIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v1m0 8v1" strokeLinecap="round" />
      <path d="M9.5 10a2.5 2.5 0 0 1 5 0c0 1.5-1.5 2-2.5 2.5s-2.5 1-2.5 2.5a2.5 2.5 0 0 0 5 0" />
    </svg>
  );
}
function UsersIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function JuegosIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="6" width="20" height="12" rx="3" />
      <path d="M6 12h4M8 10v4" />
      <circle cx="15" cy="11" r="1" fill="currentColor" stroke="none" />
      <circle cx="18" cy="13" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function ProyectosIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
      <path d="M7 8h4M7 11h6" />
    </svg>
  );
}
function TintAIIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3C8 3 5 6 5 10c0 2.5 1.2 4.7 3 6l1 4h6l1-4c1.8-1.3 3-3.5 3-6 0-4-3-7-7-7z" />
      <path d="M9 17h6" strokeWidth={1} />
      <path d="M10 20h4" strokeWidth={1} opacity=".6" />
    </svg>
  );
}
function BiOptimaIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-3.314 3.582-6 8-6s8 2.686 8 6" />
      <path d="M12 14v2M9 17h6" strokeWidth={1} opacity=".5" />
    </svg>
  );
}

const APP_ICONS: Record<string, React.FC<{ size?: number }>> = {
  Tracker:   TrackerIcon,
  Blog:      BlogIcon,
  Moneta:    MonetaIcon,
  Usuarios:  UsersIcon,
  Juegos:    JuegosIcon,
  Proyectos: ProyectosIcon,
  Bioptima:  BiOptimaIcon,
  TintAI:    TintAIIcon,
};

/* ── App registry — add new tools here ── */
const APPS = [
  {
    name: 'Tracker',
    desc: 'Rutinas y hábitos semanales',
    path: '/admin/dashboard/tracker',
  },
  {
    name: 'Blog',
    desc: 'Artículos técnicos del portfolio',
    path: '/admin/dashboard/blog',
  },
  {
    name: 'Moneta',
    desc: 'Control de ingresos y gastos',
    path: '/admin/dashboard/moneta',
  },
  {
    name: 'Juegos',
    desc: 'Gestión de minijuegos del portfolio',
    path: '/admin/dashboard/juegos',
  },
  {
    name: 'Proyectos',
    desc: 'Gestión de proyectos del portfolio',
    path: '/admin/dashboard/proyectos',
  },
  {
    name: 'Bioptima',
    desc: 'Seguimiento dietético-deportivo',
    path: '/admin/dashboard/bioptima',
  },
  {
    name: 'TintAI',
    desc: 'Ebooks didácticos con Claude',
    path: '/admin/dashboard/tintai',
  },
  {
    name: 'Usuarios',
    desc: 'Gestión de usuarios del sistema',
    path: '/admin/dashboard/usuarios',
  },
] as const;

/* ── Canvas animado de red neuronal ────────────────────────────────────────
   50 nodos con velocidad aleatoria rebotan en los bordes.
   Los nodos cercanos (< MAX_DIST px) se conectan con líneas semitransparentes.
   La opacidad de cada línea es inversamente proporcional a la distancia.
   El color se lee cada frame de la clase del <html> para responder
   al cambio de tema sin re-renders de React.
   ─────────────────────────────────────────────────────────────────────────── */
interface Node { x: number; y: number; vx: number; vy: number; r: number; pulse: number; }

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
      canvas!.width  = w;
      canvas!.height = h;
    }
    resize();
    window.addEventListener('resize', resize);

    const MAX_DIST = 120;
    const nodes: Node[] = Array.from({ length: 50 }, () => ({
      x:     Math.random() * w,
      y:     Math.random() * h,
      vx:    (Math.random() - 0.5) * 0.35,
      vy:    (Math.random() - 0.5) * 0.35,
      r:     Math.random() * 1.5 + 1,
      /* Fase inicial aleatoria para que el pulso no esté sincronizado entre nodos */
      pulse: Math.random() * Math.PI * 2,
    }));

    function draw() {
      /* Lee el tema en cada frame para reaccionar al toggle sin re-render */
      const isLight = document.documentElement.classList.contains('light');
      const [r, g, b] = isLight ? [0, 168, 191] : [0, 231, 235];

      ctx!.clearRect(0, 0, w, h);

      /* Actualiza posición y rebota en bordes */
      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy; n.pulse += 0.018;
        if (n.x < 0 || n.x > w) { n.vx *= -1; n.x = Math.max(0, Math.min(w, n.x)); }
        if (n.y < 0 || n.y > h) { n.vy *= -1; n.y = Math.max(0, Math.min(h, n.y)); }
      }

      /* Dibuja aristas entre pares de nodos dentro del radio máximo */
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < MAX_DIST) {
            ctx!.beginPath();
            ctx!.moveTo(nodes[i].x, nodes[i].y);
            ctx!.lineTo(nodes[j].x, nodes[j].y);
            /* Opacidad: máxima cuando la distancia es 0, cero en MAX_DIST */
            ctx!.strokeStyle = `rgba(${r},${g},${b},${(1 - d / MAX_DIST) * 0.22})`;
            ctx!.lineWidth   = 0.5;
            ctx!.stroke();
          }
        }
      }

      /* Dibuja cada nodo con un pulso senoidal que varía su tamaño y opacidad */
      for (const n of nodes) {
        const p = (Math.sin(n.pulse) + 1) / 2; // valor normalizado [0, 1]
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, n.r + p * 0.6, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${r},${g},${b},${0.35 + p * 0.45})`;
        ctx!.fill();
      }

      animId = requestAnimationFrame(draw);
    }

    animId = requestAnimationFrame(draw);
    /* Limpia la animación y el listener al desmontar el componente */
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

/* ── Dashboard home ── */
export default function DashboardPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then((res: { ok: boolean; username?: string; role?: string }) => {
        if (res.ok) {
          setUsername(res.username || '');
          setRole(res.role || '');
        } else {
          setRole('');
        }
      })
      .catch(() => setRole(''));
  }, []);

  const visibleApps = role === null
    ? []
    : role === 'super_admin'
      ? APPS
      : APPS.filter(a => a.name !== 'Blog' && a.name !== 'Usuarios' && a.name !== 'Juegos' && a.name !== 'Proyectos');

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  }

  return (
    <div style={{
      position: 'relative',
      minHeight: 'calc(100vh - 88px)',
      background: 'var(--adm-bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <NeuralCanvas />

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '2rem 1.5rem' }}>
        <p style={{
          color: 'var(--primary)',
          fontSize: '10px',
          letterSpacing: '2.5px',
          textTransform: 'uppercase',
          marginBottom: '1rem',
          fontWeight: 500,
        }}>
          Panel Admin
        </p>

        <h1 style={{ color: 'var(--adm-text)', fontSize: '26px', fontWeight: 300, letterSpacing: '-0.3px', marginBottom: '0.5rem' }}>
          {username ? `Hola, ${username}` : ' '}
        </h1>

        <p style={{ color: 'var(--adm-muted)', fontSize: '13px', marginBottom: '2.5rem' }}>
          Selecciona una herramienta
        </p>

        {/* App cards */}
        <style>{`
          .dash-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.875rem; max-width: 480px; margin: 0 auto; }
          @media (min-width: 640px) { .dash-grid { grid-template-columns: repeat(3, 1fr); max-width: 680px; } }
        `}</style>
        <div className="dash-grid">
          {visibleApps.map(app => (
            <button
              key={app.path}
              onClick={() => router.push(app.path)}
              style={{
                background: 'var(--adm-card)',
                border: '1px solid var(--primary)',
                borderRadius: '12px',
                padding: '1.25rem 1.25rem',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                transition: 'transform 0.15s, box-shadow 0.2s',
                fontFamily: 'inherit',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget;
                el.style.transform  = 'translateY(-3px)';
                el.style.boxShadow  = '0 8px 30px rgba(0,168,191,0.15)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget;
                el.style.transform  = 'translateY(0)';
                el.style.boxShadow  = 'none';
              }}
            >
              <div style={{ color: 'var(--primary)', marginBottom: '0.75rem' }}>
                {(() => { const Icon = APP_ICONS[app.name] ?? TrackerIcon; return <Icon size={28} />; })()}
              </div>
              <div style={{ color: 'var(--primary)', fontSize: '14px', fontWeight: 500 }}>{app.name}</div>
              <div style={{ color: 'var(--adm-muted)', fontSize: '11px', marginTop: '3px' }}>{app.desc}</div>
            </button>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            marginTop: '2.5rem',
            background: 'none',
            border: 'none',
            color: 'var(--adm-muted)',
            fontSize: '12px',
            cursor: 'pointer',
            fontFamily: 'inherit',
            textDecoration: 'underline',
            textUnderlineOffset: '3px',
          }}
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
