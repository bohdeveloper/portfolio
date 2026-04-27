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
  ];
}