import { SeriesCard } from "@/components/series/SeriesCard";
import { mockGenres } from "@/lib/mock-data";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { CollectionJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://imo-scans.vercel.app";

export const metadata: Metadata = {
  title: "جميع المانهوا والويبتون المترجمة",
  description: "تصفح مكتبتنا الكاملة من المانهوا والويبتون والمانجا المترجمة إلى العربية. أكشن، رومانسي، خيال، مغامرات والمزيد. تحديثات يومية على IMO Scans.",
  keywords: [
    "جميع المانهوا", "مانهوا مترجمة", "ويبتون مترجم",
    "مكتبة مانهوا", "قائمة مانجا", "مانهوا عربي",
    "imo scans",
  ],
  openGraph: {
    type: "website",
    title: "جميع المانهوا والويبتون | IMO Scans",
    description: "تصفح مكتبتنا الكاملة من المانهوا والويبتون المترجمة إلى العربية.",
    url: `${BASE_URL}/series`,
    siteName: "IMO Scans",
    locale: "ar_AR",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "IMO Scans" }],
  },
  twitter: {
    card: "summary",
    title: "جميع المانهوا | IMO Scans",
    description: "تصفح مكتبتنا الكاملة من المانهوا والويبتون المترجمة إلى العربية.",
  },
  alternates: {
    canonical: `${BASE_URL}/series`,
  },
};

export default async function SeriesListPage() {
  const supabase = await createClient();
  const { data: dbSeries } = await supabase
    .from("series")
    .select(`*, genres:series_genres(genre:genres(*)), chapters(count)`)
    .order("created_at", { ascending: false });

  const seriesList = dbSeries?.map(s => ({
    ...s,
    genres: s.genres?.map((g: any) => g.genre) || [],
    chapters_count: s.chapters?.[0]?.count || 0
  })) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 page-transition">
      {/* SEO: Structured Data */}
      <CollectionJsonLd
        name="جميع المانهوا والويبتون"
        description="مكتبة كاملة من المانهوا والويبتون المترجمة إلى العربية"
        url="/series"
        numberOfItems={seriesList.length}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "الرئيسية", href: "/" },
          { name: "جميع الأعمال", href: "/series" },
        ]}
      />
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-gradient-to-br from-primary-500/20 to-primary-600/20">
          <BookOpen className="w-5 h-5 text-primary-400" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
          جميع المانهوا
        </h1>
      </div>
      <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
        تصفح مكتبتنا الكاملة من المانهوا والويبتون المترجمة
      </p>

      {/* Genre Filter */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4 mb-6">
        <Link
          href="/series"
          className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 bg-gradient-to-r from-primary-500 to-primary-600 text-white"
        >
          الكل
        </Link>
        {mockGenres.map((genre) => (
          <Link
            key={genre.id}
            href={`/genres/${genre.slug}`}
            className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 transition-colors"
            style={{
              background: "var(--bg-tertiary)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border-color)",
            }}
          >
            {genre.name}
          </Link>
        ))}
      </div>

      {/* Series Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pb-20 md:pb-4">
        {seriesList.length > 0 ? seriesList.map((series, i) => (
          <div key={series.id} style={{ animation: `slide-up 0.4s ease-out ${i * 0.06}s both` }}>
            <SeriesCard series={series} />
          </div>
        )) : (
          <div className="col-span-full py-20 text-center">
            <p className="text-lg" style={{ color: "var(--text-muted)" }}>لا توجد أعمال متاحة حالياً.</p>
          </div>
        )}
      </div>
    </div>
  );
}
