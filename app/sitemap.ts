import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { mockGenres } from "@/lib/mock-data";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://atlus.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/series`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
  ];

  // Genre pages
  const genrePages: MetadataRoute.Sitemap = mockGenres.map((genre) => ({
    url: `${BASE_URL}/genres/${genre.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Series pages (dynamic from DB)
  let seriesPages: MetadataRoute.Sitemap = [];
  let chapterPages: MetadataRoute.Sitemap = [];

  const { data: allSeries } = await supabase
    .from("series")
    .select("slug, updated_at, chapters(chapter_number, updated_at, is_published)")
    .order("updated_at", { ascending: false });

  if (allSeries) {
    seriesPages = allSeries.map((series) => ({
      url: `${BASE_URL}/series/${series.slug}`,
      lastModified: new Date(series.updated_at),
      changeFrequency: "daily" as const,
      priority: 0.8,
    }));

    // Chapter pages
    chapterPages = allSeries.flatMap((series) =>
      (series.chapters || [])
        .filter((ch: any) => ch.is_published)
        .map((chapter: any) => ({
          url: `${BASE_URL}/series/${series.slug}/${chapter.chapter_number}`,
          lastModified: new Date(chapter.updated_at),
          changeFrequency: "monthly" as const,
          priority: 0.6,
        }))
    );
  }

  return [...staticPages, ...genrePages, ...seriesPages, ...chapterPages];
}
