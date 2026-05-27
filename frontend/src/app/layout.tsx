import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SocialPanel from "@/components/ui/SocialPanel";
import EmailPanel from "@/components/ui/EmailPanel";
import BlogPanel from "@/components/ui/BlogPanel";
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
  metadataBase: new URL("https://bohdeveloper.com"),

  title: "Borja Olazabal | Programador Web Full Stack & Desarrollo con IA",
  description:
    "Borja Olazabal, programador web full stack especializado en desarrollo frontend, backend e integración de inteligencia artificial con Claude. Portfolio, proyectos y experiencia profesional.",

  keywords: [
    "Borja Olazabal",
    "programador web",
    "desarrollador web",
    "full stack",
    "portfolio",
    "Next.js",
    "TypeScript",
    "Cloudflare",
    "Cloudflare Workers",
    "inteligencia artificial",
    "Claude AI",
    "desarrollo web con IA",
    "agentes IA",
    "automatización desarrollo",
    "IA developer",
    "Claude Anthropic"
  ],

  authors: [{ name: "Borja Olazabal" }],
  robots: "index, follow",

  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }],
  },

  /* ---------- OPEN GRAPH ---------- */
  openGraph: {
    title: "Borja Olazabal | Programador Web Full Stack & IA",
    description:
      "Portfolio profesional de Borja Olazabal, programador web full stack con integración de IA (Claude). Proyectos, código y experiencia real.",
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
    title: "Borja Olazabal | Programador Web Full Stack & IA",
    description:
      "Portfolio profesional de Borja Olazabal, programador web full stack con integración de IA (Claude).",
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
              "jobTitle": "Programador web Full Stack & IA Developer",
              "description":
                "Borja Olazabal es programador web full stack especializado en desarrollo frontend, backend e integración de inteligencia artificial con Claude de Anthropic.",
              "knowsAbout": ["desarrollo web", "React", "Angular", "Spring Boot", "inteligencia artificial", "Claude AI", "automatización", "agentes IA"],
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

        <div id="portfolio-nav"><Navbar /></div>
        <main>{children}</main>

        <BlogPanel />

        <div id="portfolio-footer">
          <SocialPanel />
          <EmailPanel />
          <Footer />
        </div>
      </body>
    </html>
  );
}
