import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://pixvertesa.znxios.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-11-22");

  return [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/pp`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];
}
