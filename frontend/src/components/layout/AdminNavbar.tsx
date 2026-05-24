'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

/* ── Tracker icon — 3×2 habit grid ── */
function TrackerIcon({ size = 16 }: { size?: number }) {
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

/* ── App registry — add new admin tools here ── */
const ADMIN_APPS = [
  { name: 'Tracker', path: '/admin/dashboard/tracker', Icon: TrackerIcon },
] as const;

export default function AdminNavbar() {
  const pathname = usePathname();
  const router   = useRouter();

  /* Any route deeper than /admin/dashboard (i.e. /admin/dashboard/tracker) */
  const isInApp = pathname.startsWith('/admin/dashboard/');

  return (
    <>
      <header className="navbar fixed top-0 left-0 w-full z-50 bg-white/85 dark:bg-[#0d0d0d]/85 backdrop-blur-3xl border-b border-gray-200 dark:border-gray-800">
        <nav className="max-w-full mx-auto flex justify-between items-center py-4 px-6">

          {/* Logo → always goes to admin dashboard */}
          <Link href="/admin/dashboard" aria-label="Panel admin">
            <img
              src="/images/bohdeveloper-desarrollador-web.png"
              alt="Borja Olazabal"
              className="h-14 w-auto logo-filter"
            />
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {isInApp ? (
              /* Inside an app: show ← Dashboard button */
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="px-4 py-2 border border-primary text-primary rounded hover:bg-primary hover:text-black transition text-sm font-medium"
              >
                ← Dashboard
              </button>
            ) : (
              /* Login / dashboard home: show app links */
              <ul className="flex items-center gap-6 text-lg font-medium">
                {ADMIN_APPS.map(({ name, path, Icon }) => {
                  const active = pathname === path || pathname.startsWith(path + '/');
                  return (
                    <li key={path}>
                      <Link
                        href={path}
                        className={`flex items-center gap-2 transition hover:text-primary ${active ? 'text-primary' : ''}`}
                      >
                        <span className="text-primary">
                          <Icon size={15} />
                        </span>
                        {name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}

            <ThemeToggle />
          </div>

        </nav>
      </header>

      {/* Spacer so content doesn't go under the fixed navbar */}
      <div className="h-[88px]" />
    </>
  );
}
