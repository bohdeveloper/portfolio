'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AdminThemeCtx } from './AdminThemeCtx';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [isDark,   setIsDark]   = useState(true);

  /* ── theme ── */
  useEffect(() => {
    setIsDark(!document.documentElement.classList.contains('light'));
  }, []);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    const t = next ? 'dark' : 'light';
    localStorage.setItem('theme', t);
    document.documentElement.classList.toggle('dark', next);
    document.documentElement.classList.toggle('light', !next);
  }

  /* ── auth ── */
  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => { if (!r.ok) router.replace('/admin/login'); })
      .catch(() => router.replace('/admin/login'))
      .finally(() => setChecking(false));
  }, [router]);

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <span style={{ color: 'var(--adm-muted)', fontSize: '13px' }}>Verificando sesión...</span>
      </div>
    );
  }

  /* ── inside an app (tracker, etc.) — hide portfolio navbar, show minimal bar ── */
  const isInApp = pathname !== '/admin/dashboard';
  const navBg   = isDark ? '#111' : '#fff';
  const border  = isDark ? '#1e1e1e' : '#e0e0e0';
  const text    = isDark ? '#e8e6e0' : '#1a1a1a';
  const muted   = isDark ? '#555' : '#888';
  const bg      = isDark ? '#0f0f0f' : '#f5f5f5';

  if (isInApp) {
    return (
      <AdminThemeCtx.Provider value={{ isDark, toggle: toggleTheme }}>
        {/* hide portfolio navbar while inside an app */}
        <style dangerouslySetInnerHTML={{ __html: `#portfolio-nav { display: none !important; }` }} />

        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: bg, fontFamily: 'system-ui, sans-serif' }}>
          {/* Minimal app bar */}
          <div style={{
            height: '44px',
            background: navBg,
            borderBottom: `1px solid ${border}`,
            display: 'flex',
            alignItems: 'center',
            padding: '0 1rem',
            gap: '8px',
            flexShrink: 0,
            position: 'sticky',
            top: 0,
            zIndex: 100,
          }}>
            <button
              onClick={() => router.push('/admin/dashboard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: 'none',
                border: `1px solid ${border}`,
                borderRadius: '6px',
                color: muted,
                fontSize: '12px',
                padding: '4px 10px',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              ← Dashboard
            </button>

            <div style={{ flex: 1 }} />

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
                border: `1px solid ${border}`,
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                lineHeight: 1,
              }}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>

          <div style={{ flex: 1 }}>
            {children}
          </div>
        </div>
      </AdminThemeCtx.Provider>
    );
  }

  /* ── dashboard home — portfolio navbar handles theme, just provide context ── */
  return (
    <AdminThemeCtx.Provider value={{ isDark, toggle: toggleTheme }}>
      {children}
    </AdminThemeCtx.Provider>
  );
}
