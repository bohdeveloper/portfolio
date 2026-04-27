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
   METADATA SEO GLOBAL
============================ */
export const metadata = {
  metadataBase: new URL("https://www.bohdeveloper.com"),

  title: "Borja Olazabal | Programador Web y Desarrollador Full Stack",
  description:
    "Borja Olazabal, programador web especializado en desarrollo frontend y backend. Descubre mi portfolio, proyectos y experiencia profesional.",

  keywords: [
    "Borja Olazabal",
    "programador web",
    "desarrollador web",
    "full stack",
    "portfolio",
    "Next.js",
    "TypeScript",
    "Prisma"
  ],

  authors: [{ name: "Borja Olazabal" }],
  robots: "index, follow",

  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }],
  },

  /* ---------- OPEN GRAPH ---------- */
  openGraph: {
    title: "Borja Olazabal | Programador Web",
    description:
      "Portfolio profesional de Borja Olazabal, programador web y desarrollador full stack. Proyectos, código y experiencia real.",
    url: "https://www.bohdeveloper.com",
    siteName: "bohdeveloper",
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: "/images/Borja-Olazabal.png",
        width: 1200,
        height: 630,
        alt: "Borja Olazabal - Programador web",
      },
    ],
  },

  /* ---------- TWITTER ---------- */
  twitter: {
    card: "summary_large_image",
    title: "Borja Olazabal | Programador Web",
    description:
      "Portfolio profesional de Borja Olazabal, programador web y desarrollador full stack.",
    images: ["/images/Borja-Olazabal.png"],
  },
};

/* ============================
   ROOT LAYOUT
============================ */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} transition-colors duration-300`}>

        {/* ============================
           JSON-LD: PERSON
        ============================ */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              "name": "Borja Olazabal",
              "url": "https://www.bohdeveloper.com",
              "image": "https://www.bohdeveloper.com/images/Borja-Olazabal.png",
              "jobTitle": "Programador web",
              "description":
                "Borja Olazabal es programador web y desarrollador full stack especializado en desarrollo frontend y backend.",
              "sameAs": [
                "https://github.com/bohdeveloper",
                "https://www.linkedin.com/in/bolazabal"
              ]
            }),
          }}
        />

        {/* ============================
           JSON-LD: WEBSITE
        ============================ */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "bohdeveloper",
              "url": "https://www.bohdeveloper.com",
              "description":
                "Portfolio profesional de Borja Olazabal, programador web y desarrollador full stack.",
              "publisher": {
                "@type": "Person",
                "name": "Borja Olazabal",
              },
            }),
          }}
        />

        {/* ============================
           SCRIPT ANTI-FLICKER (THEME)
        ============================ */}
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

        <SocialPanel />
        <EmailPanel />
        <Footer />
      </body>
    </html>
  );
}
