// app/sitemap.ts
import { MetadataRoute } from "next";

/**
 * Necesario porque el proyecto usa `output: "export"`
 */
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://bohdeveloper.com";

  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    /* Los CV entran en el sitemap: son PDF indexables y contienen las mismas
       palabras clave por las que se busca el perfil. */
    {
      url: `${baseUrl}/cv/borja-olazabal-backend-sector-publico.pdf`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/cv/borja-olazabal-fullstack-producto.pdf`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
}