import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Star, Eye, TrendingUp, Clock, Flame, Sparkles } from "lucide-react";
import { SeriesCard } from "@/components/series/SeriesCard";
import { TrendingCard } from "@/components/series/TrendingCard";
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
        <section className="relative overflow-hidden w-full bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
          <div className="relative min-h-[480px] lg:min-h-[550px] w-full flex items-center justify-center overflow-hidden py-10 px-4 md:px-8">
            
            {/* Background blurred cover */}
            <div className="absolute inset-0 w-full h-full z-0 select-none pointer-events-none">
              <Image
                src={featured[0].cover_image_url || "/placeholder.png"}
                alt="Backdrop"
                fill
                className="object-cover opacity-20 blur-[30px] scale-110"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/80 to-[var(--bg-primary)]/40" />
            </div>

            {/* Inner Content Grid */}
            <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
              
              {/* Text Info */}
              <div className="flex-1 text-center md:text-right flex flex-col items-center md:items-start min-w-0">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 text-white text-xs font-bold mb-4 border border-white/20 backdrop-blur-md">
                  <Sparkles className="w-3.5 h-3.5" />
                  العمل المميز اليوم
                </span>
                
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4 leading-tight text-white drop-shadow-md text-glow">
                  {featured[0].title}
                </h1>
                
                <p className="text-sm md:text-base leading-relaxed text-gray-300 max-w-xl mb-6 line-clamp-3 font-medium">
                  {featured[0].description || "اقرأ هذا العمل المميز مترجماً بالكامل بجودة عالية على IMO Scans."}
                </p>

                {/* Meta details */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-6">
                  <span className="px-3 py-1 rounded-full bg-white/5 text-xs text-gray-300 border border-white/10 font-semibold">
                    {featured[0].type === "manhwa" ? "مانهوا" : featured[0].type === "manga" ? "مانجا" : "مانها"}
                  </span>
                  
                  <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 text-xs text-amber-400 border border-white/10 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {featured[0].rating}
                  </span>

                  <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 text-xs text-gray-400 border border-white/10 font-semibold">
                    <Eye className="w-3.5 h-3.5" />
                    {formatNumber(featured[0].views_count || 0)} مشاهدة
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto justify-center md:justify-start">
                  <Link
                    href={`/series/${featured[0].slug}`}
                    className="w-full sm:w-auto px-8 py-3 rounded-full text-sm font-semibold text-white bg-[#ff0000] hover:bg-[#cc0000] transition-all duration-200 inline-flex items-center justify-center gap-2 shadow-[0_0_18px_rgba(255,0,0,0.45)]"
                  >
                    ابدأ القراءة
                    <ArrowLeft className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`/series/${featured[0].slug}`}
                    className="w-full sm:w-auto px-6 py-3 rounded-full text-sm font-semibold text-white border border-white/20 hover:bg-white/5 transition-all duration-200 text-center"
                  >
                    تفاصيل العمل
                  </Link>
                </div>
              </div>

              {/* Cover Card - floating premium layout */}
              <div className="w-full max-w-[220px] md:max-w-[280px] shrink-0 z-10 select-none">
                <div className="aspect-[3/4] relative rounded-[28px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border-2 border-white/10 group hover:scale-[1.02] transition-transform duration-300">
                  <Image
                    src={featured[0].cover_image_url || "/placeholder.png"}
                    alt={featured[0].title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 220px, 280px"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                </div>
              </div>

            </div>
          </div>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {popular.map((series, i) => (
              <div key={series.id} style={{ animation: `slide-up 0.4s ease-out ${i * 0.08}s both` }}>
                <TrendingCard series={series} />
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
