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
        <section className="relative overflow-hidden" style={{ background: "var(--bg-secondary)" }}>
          <div className="relative h-[65vh] min-h-[500px] w-full flex items-center justify-center overflow-hidden">
            {/* Background blurred image */}
            <div className="absolute inset-0 w-full h-full">
              <Image
                src={featured[0]?.cover_image_url || "/placeholder.png"}
                alt="Background"
                fill
                className="object-cover opacity-30 md:opacity-40 blur-sm scale-105"
                priority
              />
              <div className="absolute inset-0 gradient-overlay" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col lg:flex-row items-center gap-8 pt-10">
              <div className="w-full lg:w-1/2 text-center lg:text-right">
                <span className="inline-block px-3 py-1 rounded-full bg-primary-500/20 text-primary-400 text-xs font-bold mb-4 backdrop-blur-md border border-primary-500/30">
                  ⭐ أحدث الإضافات
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 leading-tight text-white drop-shadow-xl text-glow">
                  {featured[0]?.title}
                </h1>
                <p className="text-base md:text-lg text-gray-300 mb-8 max-w-2xl mx-auto lg:mx-0 line-clamp-3">
                  {featured[0]?.description || "لا يوجد وصف متاح لهذه المانهوا حالياً."}
                </p>
                
                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                  <Link
                    href={`/series/${featured[0]?.slug}`}
                    className="btn-primary !px-8 !py-3.5 !text-base"
                  >
                    ابدأ القراءة
                    <ArrowLeft className="w-4 h-4" />
                  </Link>
                  <div className="flex items-center gap-4 text-sm text-gray-300 bg-white/5 px-4 py-2.5 rounded-xl backdrop-blur-md border border-white/10">
                    <span className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="font-bold text-white">{featured[0]?.rating}</span>
                    </span>
                    <span className="w-1 h-1 rounded-full bg-gray-500" />
                    <span className="flex items-center gap-1.5">
                      <Eye className="w-4 h-4" />
                      {formatNumber(featured[0]?.views_count || 0)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="hidden lg:block w-1/3 max-w-[320px] relative perspective-1000">
                <div className="aspect-[3/4] relative rounded-2xl overflow-hidden premium-shadow transform rotate-y-[-10deg] rotate-x-[5deg] hover:rotate-y-0 transition-transform duration-500">
                  <Image
                    src={featured[0]?.cover_image_url || "/placeholder.png"}
                    alt={featured[0]?.title}
                    fill
                    className="object-cover"
                    sizes="320px"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Decorative gradient line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent" />
        </section>
      ) : (
        <section className="relative overflow-hidden">
          <div className="relative h-[50vh] min-h-[400px] w-full flex items-center justify-center overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-primary)]"></div>
             <div className="relative z-10 text-center px-4">
                <div className="w-20 h-20 mx-auto mb-6 bg-primary-500/10 rounded-2xl flex items-center justify-center rotate-3 border border-primary-500/20">
                   <Sparkles className="w-10 h-10 text-primary-500" />
                </div>
                <h1 className="text-3xl lg:text-4xl font-black mb-4">لا توجد أعمال حالياً!</h1>
                <p className="text-[var(--text-muted)] max-w-md mx-auto mb-8 text-lg">
                   تم إعداد المنصة بنجاح. ابدأ بإضافة عمل جديد ليظهر هنا لزوار موقعك.
                </p>
                <Link href="/admin/series/new" className="btn-primary">
                   الذهاب إلى لوحة الإدارة
                </Link>
             </div>
          </div>
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
