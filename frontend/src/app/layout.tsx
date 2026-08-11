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

  title: "Borja Olazabal | Desarrollador Java · Spring Boot · Vigo",
  description:
    "Desarrollador web con cinco años en proyectos de Administración Pública autonómica. Java, Spring Boot, Oracle, Angular y React. Portfolio, proyectos y experiencia. Disponible en Vigo y remoto.",

  keywords: [
    "desarrollador Java",
    "programador Java Vigo",
    "Spring Boot",
    "desarrollador backend Galicia",
    "programador web Pontevedra",
    "Java Oracle",
    "desarrollador fullstack remoto",
    "administración pública",
    "EJIE",
    "UDA",
    "Borja Olazabal",
  ],

  authors: [{ name: "Borja Olazabal" }],
  robots: "index, follow",

  alternates: {
    canonical: "https://bohdeveloper.com",
  },

  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }],
  },

  /* ---------- OPEN GRAPH ---------- */
  openGraph: {
    title: "Borja Olazabal | Desarrollador Java · Spring Boot · Vigo",
    description:
      "Cinco años desarrollando aplicaciones para la Administración Pública autonómica con Java, Spring Boot y Oracle. Portfolio, proyectos y experiencia. Disponible en Vigo y remoto.",
    url: "https://bohdeveloper.com",
    siteName: "bohdeveloper",
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: "/images/Borja-Olazabal.png",
        width: 1200,
        height: 630,
        alt: "Borja Olazabal, desarrollador Java y Spring Boot en Vigo",
      },
    ],
  },

  /* ---------- TWITTER ---------- */
  twitter: {
    card: "summary_large_image",
    title: "Borja Olazabal | Desarrollador Java · Spring Boot · Vigo",
    description:
      "Cinco años desarrollando aplicaciones para la Administración Pública autonómica con Java, Spring Boot y Oracle. Disponible en Vigo y remoto.",
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
              "url": "https://bohdeveloper.com",
              "image": "https://bohdeveloper.com/images/Borja-Olazabal.png",
              "jobTitle": "Desarrollador web · Java y Spring Boot",
              "email": "mailto:ohb.seven@gmail.com",
              "description":
                "Borja Olazabal es desarrollador web con cinco años de experiencia en proyectos de Administración Pública autonómica, especializado en Java, Spring Boot y Oracle.",
              "knowsAbout": [
                "Java", "Spring Boot", "Oracle SQL", "PL/SQL", "JSP", "JSTL",
                "framework UDA", "Jenkins", "SonarQube", "APIs REST",
                "Angular", "React", "Next.js", "TypeScript", "Docker", "Kubernetes",
                "tramitación electrónica", "Administración Pública"
              ],
              /* Ubicación declarada: es el criterio por el que se filtra en
                 búsquedas de empleo local (Vigo / Pontevedra). */
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Vigo",
                "addressRegion": "Pontevedra",
                "addressCountry": "ES"
              },
              "homeLocation": {
                "@type": "Place",
                "name": "Vigo, Pontevedra, Galicia, España"
              },
              "seeks": {
                "@type": "Demand",
                "name": "Posiciones de desarrollo backend o fullstack con Java y Spring Boot en Galicia o en remoto"
              },
              "alumniOf": [
                {
                  "@type": "EducationalOrganization",
                  "name": "Ipartek",
                  "description": "Certificado de Profesionalidad IFCD0112 (Nivel 3) — Programación con lenguajes orientados a objetos y bases de datos relacionales"
                },
                {
                  "@type": "EducationalOrganization",
                  "name": "CEINPRO Centro Informático Profesional",
                  "description": "Confección y Publicación de Páginas Web"
                }
              ],
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
              "url": "https://bohdeveloper.com",
              "description":
                "Portfolio profesional de Borja Olazabal, desarrollador web especializado en Java, Spring Boot y Oracle.",
              "inLanguage": "es-ES",
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
