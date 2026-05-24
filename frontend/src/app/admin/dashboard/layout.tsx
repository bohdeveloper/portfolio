'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const NAV_ITEMS = [
  { name: 'Tracker', path: '/admin/dashboard/tracker', icon: '📅' },
  // Nueva herramienta → añadir aquí: { name: 'Nombre', path: '/admin/dashboard/ruta', icon: '🔧' }
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => { if (!r.ok) router.replace('/admin/login'); })
      .catch(() => router.replace('/admin/login'))
      .finally(() => setChecking(false));
  }, [router]);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/admin/login');
  }

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f0f0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#555', fontSize: '13px' }}>Verificando sesión...</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f0f0f', fontFamily: 'system-ui, sans-serif' }}>
      {/* Sidebar */}
      <aside style={{
        width: '200px',
        flexShrink: 0,
        background: '#111',
        borderRight: '1px solid #1e1e1e',
        display: 'flex',
        flexDirection: 'column',
        padding: '1rem 0',
      }}>
        <div style={{ padding: '0 1rem 1rem', borderBottom: '1px solid #1e1e1e', marginBottom: '0.5rem' }}>
          <div style={{ color: '#e8e6e0', fontSize: '13px', fontWeight: 500 }}>Panel Admin</div>
          <div style={{ color: '#444', fontSize: '11px', marginTop: '2px' }}>bohdeveloper.com</div>
        </div>

        <nav style={{ flex: 1, padding: '0.25rem 0' }}>
          {NAV_ITEMS.map(item => {
            const active = pathname === item.path || pathname.startsWith(item.path + '/');
            return (
              <a
                key={item.path}
                href={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 1rem',
                  fontSize: '13px',
                  color: active ? '#e8e6e0' : '#666',
                  background: active ? '#1a1a1a' : 'transparent',
                  borderLeft: active ? '2px solid #5DCAA5' : '2px solid transparent',
                  textDecoration: 'none',
                  transition: 'color 0.15s',
                }}
              >
                <span>{item.icon}</span>
                {item.name}
              </a>
            );
          })}
        </nav>

        <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid #1e1e1e' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '7px 0',
              background: 'none',
              border: '1px solid #2a2a2a',
              borderRadius: '6px',
              color: '#666',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            Salir
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
