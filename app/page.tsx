import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Star, Eye, TrendingUp, Clock, Flame, Sparkles } from "lucide-react";
import { SeriesCard } from "@/components/series/SeriesCard";
import { mockGenres } from "@/lib/mock-data";
import { formatNumber } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { WebsiteJsonLd, OrganizationJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";

// ISR: يُحدّث كل دقيقة بدل ما يكون ديناميكي كل مرة
export const revalidate = 60;

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch from Supabase
  const { data: featuredData } = await supabase
    .from("series")
    .select(`*, genres:series_genres(genre:genres(*)), chapters(id, chapter_number, title, published_at, created_at)`)
    .limit(4)
    .order("views_count", { ascending: false });

  const { data: popularData } = await supabase
    .from("series")
    .select(`*, genres:series_genres(genre:genres(*)), chapters(id, chapter_number, title, published_at, created_at)`)
    .limit(6)
    .order("views_count", { ascending: false });

  const { data: latestData } = await supabase
    .from("series")
    .select(`*, genres:series_genres(genre:genres(*)), chapters(id, chapter_number, title, published_at, created_at)`)
    .limit(8)
    .order("updated_at", { ascending: false });

  const formatSeriesList = (data: any[]) => data?.map(s => {
    const sortedChapters = s.chapters
      ? [...s.chapters].sort((a: any, b: any) => b.chapter_number - a.chapter_number)
      : [];
    return {
      ...s,
      genres: s.genres?.map((g: any) => g.genre) || [],
      chapters_count: s.chapters?.length || 0,
      latest_chapters: sortedChapters.slice(0, 2)
    };
  }) || [];

  const featured = formatSeriesList(featuredData || []);
  const popular = formatSeriesList(popularData || []);
  const latest = formatSeriesList(latestData || []);

  const hasFeatured = featured.length > 0;

  return (
    <div className="page-transition">
      {/* SEO: Structured Data */}
      <WebsiteJsonLd />
      <OrganizationJsonLd />
      <BreadcrumbJsonLd items={[{ name: "الرئيسية", href: "/" }]} />
      {/* ============================================= */}
      {/* Hero Section */}
      {/* ============================================= */}
      {featured.length > 0 ? (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full select-none">
          <Link
            href={`/series/${featured[0].slug}`}
            className="group relative block w-full aspect-[3/4] md:aspect-[16/7] rounded-[32px] overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.5)] border border-[var(--border-color)] hover:translate-y-[-2px] transition-all duration-300 animate-fade-in"
          >
            {/* Background Image */}
            <Image
              src={featured[0].cover_image_url || "/placeholder.png"}
              alt={featured[0].title}
              fill
              className="object-cover transition-transform duration-750 group-hover:scale-102"
              priority
              sizes="(max-width: 1024px) 100vw, 1200px"
            />
            
            {/* Dark overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent transition-opacity duration-300 group-hover:via-black/50" />

            {/* Top Left Badge (Type) */}
            <div className="absolute top-5 left-5 z-10 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-bold text-white border border-white/10">
              {featured[0].type === "manhwa" ? "مانهوا" : featured[0].type === "manga" ? "مانجا" : "مانها"}
            </div>

            {/* Center/Bottom Overlay (Azora Style) */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center mt-10">
              {/* Trending/Featured Badge */}
              <div className="inline-flex items-center gap-1.5 px-4.5 py-1.5 rounded-full bg-[#f59e0b] text-black text-[11px] font-black uppercase mb-3 shadow-lg">
                <span>🔥 رائج</span>
              </div>

              {/* Title */}
              <h1 className="text-white text-3xl md:text-4xl lg:text-5xl font-black mb-4 leading-tight drop-shadow-md text-glow max-w-2xl">
                {featured[0].title}
              </h1>

              {/* Genres List */}
              <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl">
                {featured[0].genres?.slice(0, 3).map((g: any) => (
                  <span
                    key={g.id}
                    className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-bold text-gray-200 border border-white/5"
                  >
                    {g.name}
                  </span>
                ))}
                {(!featured[0].genres || featured[0].genres.length === 0) && (
                  <span className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-bold text-gray-200 border border-white/5">
                    أخرى
                  </span>
                )}
              </div>
            </div>
          </Link>
        </section>
      ) : (
        <section className="relative overflow-hidden w-full bg-[var(--bg-secondary)] py-16 px-4 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-primary-500/10 rounded-2xl flex items-center justify-center border border-primary-500/20 text-primary-400">
            <Sparkles className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-black mb-2">لا توجد أعمال حالياً!</h1>
          <p className="text-sm max-w-sm mx-auto mb-6" style={{ color: "var(--text-muted)" }}>
            تم إعداد المنصة بنجاح. ابدأ بإضافة عمل جديد ليظهر هنا لزوار موقعك.
          </p>
          <Link href="/admin/series/new" className="btn-primary">
            إضافة عمل جديد
          </Link>
        </section>
      )}

      {/* ============================================= */}
      {/* Trending Now */}
      {/* ============================================= */}
      {popular.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-accent-500/15 to-accent-600/15">
                <Flame className="w-5 h-5 text-accent-500" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                  الأكثر رواجاً
                </h2>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                  أكثر المانهوا مشاهدة هذا الأسبوع
                </p>
              </div>
            </div>
            <Link
              href="/series"
              className="text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1"
            >
              عرض الكل
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-5">
            {popular.map((series, i) => (
              <div key={series.id} style={{ animation: `slide-up 0.4s ease-out ${i * 0.08}s both` }}>
                <SeriesCard series={series} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ============================================= */}
      {/* Latest Updates */}
      {/* ============================================= */}
      {latest.length > 0 && (
        <section style={{ background: "var(--bg-secondary)" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/15 to-emerald-600/15">
                  <Clock className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                    آخر التحديثات
                  </h2>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                    فصول جديدة أُضيفت مؤخراً
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {latest.map((series, i) => (
                <div key={series.id} style={{ animation: `slide-up 0.4s ease-out ${i * 0.06}s both` }}>
                  <SeriesCard series={series} variant="wide" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================= */}
      {/* Browse by Genre - Remanga Pill Style */}
      {/* ============================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 pb-24 md:pb-16">
        <div className="flex flex-col gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            تصفح حسب التصنيف
          </h2>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {mockGenres.map((genre) => (
              <Link
                key={genre.id}
                href={`/genres/${genre.slug}`}
                className="px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors hover:bg-primary-600 hover:text-white"
                style={{
                  background: "var(--bg-tertiary)",
                  color: "var(--text-secondary)",
                }}
              >
                {genre.name}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
