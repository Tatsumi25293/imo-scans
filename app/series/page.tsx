import { SeriesCard } from "@/components/series/SeriesCard";
import { mockGenres } from "@/lib/mock-data";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { CollectionJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://imo-scans.vercel.app";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const typeFilter = resolvedSearchParams.type;

  let title = "جميع المانجا والمانهوا المترجمة | IMO Scans";
  let description = "تصفح مكتبتنا الكاملة من المانجا والمانهوا والويبتون المترجمة إلى العربية بجودة عالية.";

  if (typeFilter === "manga") {
    title = "جميع المانجا المترجمة | IMO Scans";
    description = "تصفح مكتبتنا الكاملة من المانجا اليابانية المترجمة إلى العربية بجودة عالية.";
  } else if (typeFilter === "manhwa") {
    title = "جميع المانهوا المترجمة | IMO Scans";
    description = "تصفح مكتبتنا الكاملة من المانهوا الكورية المترجمة إلى العربية بجودة عالية.";
  } else if (typeFilter === "manhua") {
    title = "جميع المانها المترجمة | IMO Scans";
    description = "تصفح مكتبتنا الكاملة من المانها الصينية المترجمة إلى العربية بجودة عالية.";
  }

  return {
    title,
    description,
    openGraph: {
      type: "website",
      title,
      description,
      url: `${BASE_URL}/series${typeFilter ? `?type=${typeFilter}` : ""}`,
      siteName: "IMO Scans",
      locale: "ar_AR",
      images: [{ url: "/logo.png", width: 512, height: 512, alt: "IMO Scans" }],
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    alternates: {
      canonical: `${BASE_URL}/series${typeFilter ? `?type=${typeFilter}` : ""}`,
    },
  };
}

export default async function SeriesListPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const typeFilter = resolvedSearchParams.type as string | undefined;

  const supabase = await createClient();
  
  let query = supabase
    .from("series")
    .select(`*, genres:series_genres(genre:genres(*)), chapters(count)`);

  if (typeFilter === "manga" || typeFilter === "manhwa" || typeFilter === "manhua") {
    query = query.eq("type", typeFilter);
  }

  const { data: dbSeries } = await query.order("created_at", { ascending: false });

  const seriesList = dbSeries?.map(s => ({
    ...s,
    genres: s.genres?.map((g: any) => g.genre) || [],
    chapters_count: s.chapters?.[0]?.count || 0
  })) || [];

  let pageTitle = "جميع الأعمال";
  let pageDesc = "تصفح مكتبتنا الكاملة من الأعمال المترجمة";

  if (typeFilter === "manga") {
    pageTitle = "جميع المانجا";
    pageDesc = "تصفح مكتبتنا الكاملة من المانجا اليابانية المترجمة";
  } else if (typeFilter === "manhwa") {
    pageTitle = "جميع المانهوا";
    pageDesc = "تصفح مكتبتنا الكاملة من المانهوا الكورية المترجمة";
  } else if (typeFilter === "manhua") {
    pageTitle = "جميع المانها";
    pageDesc = "تصفح مكتبتنا الكاملة من المانها الصينية المترجمة";
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 page-transition">
      {/* SEO: Structured Data */}
      <CollectionJsonLd
        name={pageTitle}
        description={pageDesc}
        url={typeFilter ? `/series?type=${typeFilter}` : "/series"}
        numberOfItems={seriesList.length}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "الرئيسية", href: "/" },
          { name: "جميع الأعمال", href: "/series" },
          ...(typeFilter ? [{ name: pageTitle, href: `/series?type=${typeFilter}` }] : []),
        ]}
      />
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-gradient-to-br from-primary-500/20 to-primary-600/20">
          <BookOpen className="w-5 h-5 text-primary-400" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
          {pageTitle}
        </h1>
      </div>
      <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
        {pageDesc}
      </p>

      {/* Genre Filter */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4 mb-6">
        <Link
          href="/series"
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 transition-colors ${
            !typeFilter
              ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white"
              : ""
          }`}
          style={
            typeFilter
              ? {
                  background: "var(--bg-tertiary)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border-color)",
                }
              : undefined
          }
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
