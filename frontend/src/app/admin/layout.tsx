export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `#portfolio-nav, #portfolio-footer { display: none !important; }`
      }} />
      {children}
    </>
  );
}
