import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, Eye, BookOpen, User, Paintbrush, ArrowLeft, Clock, Users } from "lucide-react";
import { formatNumber, formatDate, getStatusLabel, getStatusColor, getTypeLabel } from "@/lib/utils";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import ViewTracker from "@/components/view-tracker";
import CommentSection from "@/components/comments/CommentSection";
import { SeriesJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://atlus.vercel.app";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: series } = await supabase
    .from("series")
    .select("title, description, cover_image_url, author, artist, staff, type, status, rating")
    .eq("slug", slug)
    .single();

  if (!series) return { title: "غير موجود" };

  const title = series.title;
  const description = series.description || `اقرأ ${title} مترجمة إلى العربية على ATLUS. تحديثات مستمرة وجودة ترجمة عالية.`;
  const typeLabel = series.type === "manhwa" ? "مانهوا" : series.type === "manga" ? "مانجا" : "مانها";

  return {
    title: `${title} - اقرأ ${typeLabel} مترجمة`,
    description: description.slice(0, 160),
    keywords: [
      title,
      `${title} مترجمة`,
      `${title} عربي`,
      `قراءة ${title}`,
      typeLabel,
      `${typeLabel} ${series.status === "ongoing" ? "مستمرة" : "مكتملة"}`,
      series.author || "",
      "مانهوا مترجمة",
      "ATLUS",
    ].filter(Boolean),
    openGraph: {
      type: "article",
      title: `${title} - ${typeLabel} مترجمة | ATLUS`,
      description,
      url: `${BASE_URL}/series/${slug}`,
      siteName: "ATLUS",
      images: series.cover_image_url
        ? [
            {
              url: series.cover_image_url,
              width: 400,
              height: 560,
              alt: title,
            },
          ]
        : [],
      locale: "ar_AR",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ATLUS`,
      description: description.slice(0, 200),
      images: series.cover_image_url ? [series.cover_image_url] : [],
    },
    alternates: {
      canonical: `${BASE_URL}/series/${slug}`,
    },
  };
}

export default async function SeriesDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  
  const { data: series } = await supabase
    .from("series")
    .select(`
      *,
      genres:series_genres(genre:genres(*)),
      chapters (*)
    `)
    .eq("slug", slug)
    .single();

  if (!series) notFound();

  const formattedSeries = {
    ...series,
    genres: series.genres?.map((g: any) => g.genre) || []
  };

  // Sort chapters
  const sortedChapters = [...(formattedSeries.chapters || [])].sort((a, b) => b.chapter_number - a.chapter_number);
  const chaptersCount = formattedSeries.chapters?.length || 0;

  return (
    <div className="page-transition">
      <ViewTracker type="series" id={series.id} />
      {/* SEO: Structured Data */}
      <SeriesJsonLd
        title={formattedSeries.title}
        slug={formattedSeries.slug}
        description={formattedSeries.description}
        author={formattedSeries.author}
        artist={formattedSeries.artist}
        coverImage={formattedSeries.cover_image_url}
        rating={formattedSeries.rating}
        status={formattedSeries.status}
        type={formattedSeries.type}
        genres={formattedSeries.genres}
        chaptersCount={chaptersCount}
        datePublished={formattedSeries.published_at}
        dateModified={formattedSeries.updated_at}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "الرئيسية", href: "/" },
          { name: "الأعمال", href: "/series" },
          { name: formattedSeries.title, href: `/series/${formattedSeries.slug}` },
        ]}
      />
      {/* Hero Banner */}
      <div className="relative h-[280px] lg:h-[350px]">
        <Image
          src={series.banner_image_url || series.cover_image_url || "/placeholder.png"}
          alt={series.title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/60 to-[var(--bg-primary)]/20" />
      </div>

      {/* Series Info */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-36 relative z-10">
        <div className="absolute top-0 left-0 w-full h-[60vh] z-0 opacity-15 overflow-hidden blur-[40px] pointer-events-none">
          <Image
            src={series.cover_image_url || "/placeholder.png"}
            alt="Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--bg-primary)]/80 to-[var(--bg-primary)]"></div>
        </div>
        <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
          {/* Cover */}
          <div className="w-40 md:w-48 lg:w-52 flex-shrink-0 mx-auto md:mx-0">
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-2xl ring-4 ring-[var(--bg-primary)]">
              <Image
                src={formattedSeries.cover_image_url || "/placeholder.png"}
                alt={formattedSeries.title}
                fill
                className="object-cover"
                sizes="208px"
                priority
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-right pt-0 md:pt-8 lg:pt-10 min-w-0">
            {/* Badges */}
            <div className="flex items-center gap-2 justify-center md:justify-start mb-3 flex-wrap">
              <span className={`px-3 py-1 rounded-lg text-xs font-bold text-white ${getStatusColor(formattedSeries.status)}`}>
                {getStatusLabel(formattedSeries.status)}
              </span>
              <span className="px-3 py-1 rounded-lg text-xs font-medium" style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}>
                {getTypeLabel(formattedSeries.type)}
              </span>
              <span className="flex items-center gap-1 text-sm text-amber-400">
                <Star className="w-4 h-4 fill-amber-400" />
                {formattedSeries.rating}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 leading-tight text-glow" style={{ color: "var(--text-primary)" }}>
              {formattedSeries.title}
            </h1>

            {/* Meta */}
            <div className="flex items-center gap-5 justify-center md:justify-start mb-5 flex-wrap text-sm" style={{ color: "var(--text-secondary)" }}>
              {formattedSeries.author && (
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  <User className="w-4 h-4 flex-shrink-0" /> {formattedSeries.author}
                </span>
              )}
              {formattedSeries.artist && (
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  <Paintbrush className="w-4 h-4 flex-shrink-0" /> {formattedSeries.artist}
                </span>
              )}
              {formattedSeries.staff && (
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  <Users className="w-4 h-4 flex-shrink-0" /> العاملون: {formattedSeries.staff}
                </span>
              )}
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <Eye className="w-4 h-4 flex-shrink-0" /> {formatNumber(formattedSeries.views_count)}
              </span>
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <BookOpen className="w-4 h-4 flex-shrink-0" /> {chaptersCount} فصل
              </span>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-5">
              {formattedSeries.genres?.map((genre: any) => (
                <Link
                  key={genre.id}
                  href={`/genres/${genre.slug}`}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-primary-500/15 hover:text-primary-400"
                  style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}
                >
                  {genre.name}
                </Link>
              ))}
            </div>

            {/* Description */}
            <p className="text-sm leading-[1.8] mb-6 max-w-2xl" style={{ color: "var(--text-secondary)" }}>
              {formattedSeries.description}
            </p>

            {/* CTA */}
            <div className="flex items-center gap-3 justify-center md:justify-start flex-wrap">
              {sortedChapters.length > 0 && (
                <Link
                  href={`/series/${formattedSeries.slug}/${sortedChapters[sortedChapters.length - 1].chapter_number}`}
                  className="btn-primary flex-1 sm:flex-none !px-8 !py-3.5 !text-base"
                >
                  <BookOpen className="w-4 h-4" />
                  بدأ القراءة
                </Link>
              )}
              {sortedChapters[0] && (
                <Link
                  href={`/series/${formattedSeries.slug}/${sortedChapters[0].chapter_number}`}
                  className="btn-secondary"
                >
                  آخر فصل ({sortedChapters[0].chapter_number})
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chapters List */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24 md:pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <BookOpen className="w-5 h-5 text-primary-400" />
            قائمة الفصول
          </h2>
          <span className="text-sm" style={{ color: "var(--text-muted)" }}>
            {chaptersCount} فصل
          </span>
        </div>

        {sortedChapters.length === 0 ? (
          <div className="text-center p-12 rounded-xl" style={{ border: "1px solid var(--border-color)" }}>
            <p className="text-lg" style={{ color: "var(--text-muted)" }}>لا توجد فصول متاحة حالياً.</p>
          </div>
        ) : (
          <div
            className="rounded-xl overflow-hidden"
            style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)" }}
          >
            {sortedChapters.map((chapter, i) => (
              <Link
                key={chapter.id}
                href={`/series/${series.slug}/${chapter.chapter_number}`}
                className="flex items-center justify-between px-5 py-4 transition-all hover:bg-[var(--card-hover)]"
                style={{
                  borderBottom: i < sortedChapters.length - 1 ? "1px solid var(--border-color)" : "none",
                }}
              >
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-primary-400 w-10 text-center flex-shrink-0">
                    {chapter.chapter_number}
                  </span>
                  <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    الفصل {chapter.chapter_number}
                    {chapter.title ? ` – ${chapter.title}` : ""}
                  </span>
                </div>
                <div className="flex items-center gap-5 flex-shrink-0">
                  <span className="hidden sm:flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                    <Eye className="w-3.5 h-3.5" />
                    {formatNumber(chapter.views_count)}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs whitespace-nowrap" style={{ color: "var(--text-muted)" }}>
                    <Clock className="w-3.5 h-3.5" />
                    {formatDate(chapter.published_at || chapter.created_at)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Comments Area */}
      <CommentSection seriesId={series.id} />
    </div>
  );
}
