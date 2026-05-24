import AdminNavbar from '@/components/layout/AdminNavbar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        #portfolio-nav, #portfolio-footer { display: none !important; }
        html.dark  { --adm-bg:#0f0f0f; --adm-card:#1a1a1a; --adm-border:#2a2a2a; --adm-input:#111111; --adm-text:#e8e6e0; --adm-label:#888888; --adm-muted:#555555; }
        html.light { --adm-bg:#f5f5f5; --adm-card:#ffffff; --adm-border:#e0e0e0; --adm-input:#f8f8f8; --adm-text:#1a1a1a; --adm-label:#666666; --adm-muted:#999999; }
        html:not(.dark):not(.light) { --adm-bg:#0f0f0f; --adm-card:#1a1a1a; --adm-border:#2a2a2a; --adm-input:#111111; --adm-text:#e8e6e0; --adm-label:#888888; --adm-muted:#555555; }
      `}</style>
      <AdminNavbar />
      {children}
    </>
  );
}
