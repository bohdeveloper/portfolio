import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SocialPanel from "@/components/ui/SocialPanel";
import EmailPanel from "@/components/ui/EmailPanel";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

/* ============================
   VIEWPORT
============================ */
export const viewport = {
  themeColor: "#0d0d0d",
};

/* ============================
   METADATA (solo lo necesario)
============================ */
export const metadata = {
  metadataBase: new URL("https://www.bohdeveloper.com"),

  title: "Borja Olazabal | Desarrollador Web Fullstack",
  description:
    "Portfolio de Borja Olazabal, desarrollador web fullstack especializado en crear aplicaciones modernas, rápidas y escalables.",
  keywords: [
    "Borja Olazabal",
    "desarrollador web",
    "fullstack",
    "programador",
    "Next.js",
    "TypeScript",
    "Prisma",
    "portfolio",
  ],
  authors: [{ name: "Borja Olazabal" }],
  robots: "index, follow",

  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }],
  },
};

/* ============================
   ROOT LAYOUT
============================ */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} transition-colors duration-300`}>
        
        {/* SCRIPT ANTI-FLICKER — AHORA EN EL SITIO CORRECTO */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme') || 'light';
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                  } else {
                    document.documentElement.classList.add('light');
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />

        <Navbar />
        <main>{children}</main>

        {/* Paneles fijos */}
        <SocialPanel />
        <EmailPanel />

        <Footer />
      </body>
    </html>
  );
}
