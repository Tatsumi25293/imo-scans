import { SeriesCard } from "@/components/series/SeriesCard";
import { getSeriesByGenre, mockGenres } from "@/lib/mock-data";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Grid3X3 } from "lucide-react";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const genre = mockGenres.find((g) => g.slug === slug);
  if (!genre) return { title: "غير موجود" };
  return {
    title: `تصنيف: ${genre.name}`,
    description: `تصفح مانهوا تصنيف ${genre.name} مترجمة إلى العربية`,
  };
}

export default async function GenrePage({ params }: PageProps) {
  const { slug } = await params;
  const genre = mockGenres.find((g) => g.slug === slug);

  if (!genre) {
    notFound();
  }

  const seriesList = getSeriesByGenre(slug);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 page-transition">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-gradient-to-br from-primary-500/20 to-primary-600/20">
          <Grid3X3 className="w-5 h-5 text-primary-400" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
          {genre.name}
        </h1>
      </div>
      <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
        جميع المانهوا في تصنيف {genre.name}
      </p>

      {/* Genre Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4 mb-6">
        {mockGenres.map((g) => (
          <Link
            key={g.id}
            href={`/genres/${g.slug}`}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 transition-colors ${
              g.slug === slug
                ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white"
                : ""
            }`}
            style={
              g.slug !== slug
                ? {
                    background: "var(--bg-tertiary)",
                    color: "var(--text-secondary)",
                    border: "1px solid var(--border-color)",
                  }
                : undefined
            }
          >
            {g.name}
          </Link>
        ))}
      </div>

      {/* Results */}
      {seriesList.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pb-20 md:pb-4">
          {seriesList.map((series, i) => (
            <div key={series.id} style={{ animation: `slide-up 0.4s ease-out ${i * 0.06}s both` }}>
              <SeriesCard series={series} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-lg" style={{ color: "var(--text-muted)" }}>
            لا توجد مانهوا في هذا التصنيف حالياً
          </p>
        </div>
      )}
    </div>
  );
}
