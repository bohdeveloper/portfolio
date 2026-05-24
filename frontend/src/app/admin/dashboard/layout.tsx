'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AdminThemeCtx } from './AdminThemeCtx';

const NAV_ITEMS = [
  { name: 'Tracker', path: '/admin/dashboard/tracker', icon: '📅' },
  // Nueva herramienta → añadir aquí: { name: 'Nombre', path: '/admin/dashboard/ruta', icon: '🔧' }
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [isDark,   setIsDark]   = useState(true);

  useEffect(() => {
    setIsDark(localStorage.getItem('theme') !== 'light');
  }, []);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => { if (!r.ok) router.replace('/admin/login'); })
      .catch(() => router.replace('/admin/login'))
      .finally(() => setChecking(false));
  }, [router]);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    const t = next ? 'dark' : 'light';
    localStorage.setItem('theme', t);
    document.documentElement.classList.toggle('dark', next);
    document.documentElement.classList.toggle('light', !next);
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/admin/login');
  }

  const C = {
    bg:       isDark ? '#0f0f0f' : '#f5f5f5',
    nav:      isDark ? '#111111' : '#ffffff',
    border:   isDark ? '#1e1e1e' : '#e0e0e0',
    text:     isDark ? '#e8e6e0' : '#1a1a1a',
    muted:    isDark ? '#555555' : '#888888',
    activeBg: isDark ? '#1a1a1a' : '#f0f0f0',
    accent:   '#5DCAA5',
  };

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: C.muted, fontSize: '13px', fontFamily: 'system-ui, sans-serif' }}>
          Verificando sesión...
        </span>
      </div>
    );
  }

  return (
    <AdminThemeCtx.Provider value={{ isDark, toggle: toggleTheme }}>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: C.bg, fontFamily: 'system-ui, sans-serif' }}>

        {/* ── Top navbar ── */}
        <header style={{
          height: '48px',
          background: C.nav,
          borderBottom: `1px solid ${C.border}`,
          display: 'flex',
          alignItems: 'center',
          padding: '0 1.25rem',
          gap: '1rem',
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}>

          {/* Logo */}
          <a href="/admin/dashboard" style={{
            color: C.text,
            fontSize: '13px',
            fontWeight: 600,
            textDecoration: 'none',
            letterSpacing: '0.5px',
            flexShrink: 0,
          }}>
            BOH<span style={{ color: C.accent }}>.</span>admin
          </a>

          <div style={{ width: '1px', height: '18px', background: C.border, flexShrink: 0 }} />

          {/* App links */}
          <nav style={{ display: 'flex', gap: '2px', flex: 1 }}>
            {NAV_ITEMS.map(item => {
              const active = pathname === item.path || pathname.startsWith(item.path + '/');
              return (
                <a
                  key={item.path}
                  href={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '4px 10px',
                    fontSize: '12px',
                    color: active ? C.text : C.muted,
                    background: active ? C.activeBg : 'transparent',
                    borderRadius: '6px',
                    border: `1px solid ${active ? C.border : 'transparent'}`,
                    textDecoration: 'none',
                    fontWeight: active ? 500 : 400,
                    transition: 'color 0.15s',
                  }}
                >
                  <span style={{ fontSize: '13px' }}>{item.icon}</span>
                  {item.name}
                </a>
              );
            })}
          </nav>

          {/* Right: theme + logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            <button
              onClick={toggleTheme}
              title={isDark ? 'Modo claro' : 'Modo oscuro'}
              style={{
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'none',
                border: `1px solid ${C.border}`,
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                lineHeight: 1,
              }}
            >
              {isDark ? '☀️' : '🌙'}
            </button>

            <button
              onClick={handleLogout}
              style={{
                padding: '5px 12px',
                background: 'none',
                border: `1px solid ${C.border}`,
                borderRadius: '6px',
                color: C.muted,
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              Salir
            </button>
          </div>
        </header>

        {/* ── Content ── */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {children}
        </div>

      </div>
    </AdminThemeCtx.Provider>
  );
}
