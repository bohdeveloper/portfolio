import "../styles/globals.css";

export const metadata = {
  title: "Borja Olazabal | Portfolio",
  description: "Portfolio personal de Borja Olazabal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
