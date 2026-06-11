import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, ChevronLeft, Home, List } from "lucide-react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import ViewTracker from "@/components/view-tracker";
import CommentSection from "@/components/comments/CommentSection";
import ScrollToTop from "@/components/ScrollToTop";
import { ChapterJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://imo-scans.vercel.app";

interface PageProps {
  params: Promise<{ slug: string; chapter: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, chapter } = await params;
  const supabase = await createClient();
  const { data: series } = await supabase
    .from("series")
    .select("title, cover_image_url, type")
    .eq("slug", slug)
    .single();

  const title = `الفصل ${chapter} - ${series?.title || "غير معروف"}`;
  const typeLabel = series?.type === "manhwa" ? "مانهوا" : series?.type === "manga" ? "مانجا" : "مانها";
  const description = `اقرأ الفصل ${chapter} من ${typeLabel} ${series?.title || ""} مترجم إلى العربية على IMO Scans. جودة عالية وتحديثات مستمرة.`;

  return {
    title,
    description,
    keywords: [
      series?.title || "",
      `الفصل ${chapter}`,
      `${series?.title} الفصل ${chapter}`,
      typeLabel,
      "مانهوا مترجمة",
      "فصل جديد",
    ].filter(Boolean),
    openGraph: {
      type: "article",
      title: `${title} | IMO Scans`,
      description,
      url: `${BASE_URL}/series/${slug}/${chapter}`,
      siteName: "IMO Scans",
      images: series?.cover_image_url
        ? [{ url: series.cover_image_url, width: 400, height: 560, alt: series.title }]
        : [],
      locale: "ar_AR",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | IMO Scans`,
      description,
      images: series?.cover_image_url ? [series.cover_image_url] : [],
    },
    alternates: {
      canonical: `${BASE_URL}/series/${slug}/${chapter}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function ChapterReaderPage({ params }: PageProps) {
  const { slug, chapter } = await params;
  const chapterNumber = parseFloat(chapter);
  
  const supabase = await createClient();

  // Get series details
  const { data: series } = await supabase
    .from("series")
    .select("id, title, slug, chapters(id, chapter_number, published_at, created_at)")
    .eq("slug", slug)
    .single();

  if (!series) notFound();

  // Find current chapter from series.chapters
  const currentChapter = series.chapters?.find(c => c.chapter_number === chapterNumber);
  
  if (!currentChapter) notFound();

  // Get chapter pages
  const { data: pages } = await supabase
    .from("chapter_pages")
    .select("*")
    .eq("chapter_id", currentChapter.id)
    .order("page_number", { ascending: true });

  // Determine prev/next chapters
  const allChaptersNums = series.chapters.map(c => c.chapter_number).sort((a,b) => a - b);
  const currentIndex = allChaptersNums.indexOf(chapterNumber);
  const nextChapter = currentIndex < allChaptersNums.length - 1 ? allChaptersNums[currentIndex + 1] : null;
  const prevChapter = currentIndex > 0 ? allChaptersNums[currentIndex - 1] : null;

  return (
    <>
      {/* Hide the global Header/Footer on the chapter reader */}
      <style>{`
        /* Hide the site-wide Header and Footer from root layout */
        body > .min-h-full > div > div > header.sticky,
        body > .min-h-full > div > div > footer,
        body header.sticky.glass-header,
        body > footer,
        body .min-h-full > div > div > header:first-child,
        body .min-h-full > div > div > footer:last-child {
          display: none !important;
        }
        /* Override root layout's main.flex-1 wrapper */
        body {
          overflow-x: hidden !important;
        }
        body > .min-h-full,
        body > .min-h-full > div,
        body > .min-h-full > div > div,
        body > .min-h-full > div > div > main {
          width: 100% !important;
          max-width: 100% !important;
          padding: 0 !important;
          margin: 0 !important;
          overflow-x: hidden !important;
        }
        /* Ensure the chapter page takes full width with no constraints */
        .chapter-reader-root {
          width: 100% !important;
          max-width: 100% !important;
          margin: 0 auto !important;
          padding: 0 !important;
          overflow-x: hidden !important;
          position: relative;
        }
        .chapter-reader-root img {
          display: block !important;
          width: 100% !important;
          height: auto !important;
          max-width: 800px !important;
          margin: 0 auto !important;
          padding: 0 !important;
          border: none !important;
          object-fit: contain !important;
        }
        .chapter-images-container {
          width: 100% !important;
          max-width: 800px !important;
          margin: 0 auto !important;
          padding: 0 !important;
          font-size: 0;
          line-height: 0;
        }
        .chapter-images-container > div {
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          font-size: 0;
          line-height: 0;
        }
      `}</style>

      <div className="chapter-reader-root" style={{ background: "#000", minHeight: "100vh" }}>
        <ViewTracker type="chapter" id={currentChapter.id} />
        {/* SEO: Structured Data */}
        <ChapterJsonLd
          seriesTitle={series.title}
          seriesSlug={series.slug}
          chapterNumber={chapterNumber}
          totalPages={pages?.length || 0}
          datePublished={currentChapter.published_at || currentChapter.created_at}
        />
        <BreadcrumbJsonLd
          items={[
            { name: "الرئيسية", href: "/" },
            { name: series.title, href: `/series/${series.slug}` },
            { name: `الفصل ${chapterNumber}`, href: `/series/${series.slug}/${chapterNumber}` },
          ]}
        />
        
        {/* Reader Header */}
        <header
          className="sticky top-0 z-50"
          style={{
            background: "rgba(0,0,0,0.9)",
            backdropFilter: "blur(16px)",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div style={{ maxWidth: "1024px", margin: "0 auto", padding: "0 16px", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", minWidth: 0 }}>
              <Link
                href={`/series/${series.slug}`}
                style={{ padding: "8px", borderRadius: "8px" }}
              >
                <ChevronRight className="w-5 h-5" style={{ color: "#aaa", transform: "scaleX(-1)" }} />
              </Link>
              <div style={{ minWidth: 0 }}>
                <h1 style={{ fontSize: "14px", fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {series.title}
                </h1>
                <p style={{ fontSize: "12px", color: "#888" }}>
                  الفصل {chapter}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Link
                href="/"
                style={{ padding: "8px", borderRadius: "8px", display: "none" }}
                className="sm:!flex"
              >
                <Home className="w-5 h-5" style={{ color: "#aaa" }} />
              </Link>
              <Link
                href={`/series/${series.slug}`}
                style={{ padding: "8px", borderRadius: "8px" }}
              >
                <List className="w-5 h-5" style={{ color: "#aaa" }} />
              </Link>
            </div>
          </div>
        </header>

        {/* Reader Content - Full Width Images */}
        <ScrollToTop />
        <div className="chapter-images-container">
          {pages && pages.length > 0 ? (
            pages.map((page, i) => (
              <div key={page.id}>
                <img
                  src={`/api/img/${slug}/${chapterNumber}/${page.page_number}`}
                  alt={`صفحة ${page.page_number}`}
                  loading={i < 3 ? "eager" : "lazy"}
                  className="w-full max-w-full h-auto object-contain mx-auto"
                />
              </div>
            ))
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "50vh" }}>
              <p style={{ color: "#888", fontSize: "14px" }}>لا توجد صور في هذا الفصل بعد.</p>
            </div>
          )}
        </div>

        {/* Reader Footer Navigation */}
        <footer
          style={{
            padding: "24px 0",
            background: "rgba(0,0,0,0.9)",
            borderTop: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div style={{ maxWidth: "640px", margin: "0 auto", padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {prevChapter ? (
              <Link
                href={`/series/${series.slug}/${prevChapter}`}
                className="btn-secondary"
              >
                <ChevronRight className="w-5 h-5 flip-rtl" />
                الفصل السابق
              </Link>
            ) : (
              <div />
            )}

            {nextChapter ? (
              <Link
                href={`/series/${series.slug}/${nextChapter}`}
                className="btn-primary"
              >
                الفصل التالي
                <ChevronLeft className="w-5 h-5 flip-rtl" />
              </Link>
            ) : (
              <div style={{ padding: "10px 24px", fontSize: "14px", color: "#666", fontWeight: 700, background: "rgba(255,255,255,0.05)", borderRadius: "9999px" }}>نهاية الفصول</div>
            )}
          </div>
        </footer>

        {/* Discussion Area */}
        <div style={{ background: "#000", padding: "32px 0" }}>
          <CommentSection chapterId={currentChapter.id} />
        </div>
      </div>
    </>
  );
}
