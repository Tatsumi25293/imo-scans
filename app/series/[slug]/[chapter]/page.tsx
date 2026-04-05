import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, ChevronLeft, Home, List, Settings } from "lucide-react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import ViewTracker from "@/components/view-tracker";
import CommentSection from "@/components/comments/CommentSection";

interface PageProps {
  params: Promise<{ slug: string; chapter: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, chapter } = await params;
  const supabase = await createClient();
  const { data: series } = await supabase.from("series").select("title").eq("slug", slug).single();

  return {
    title: `الفصل ${chapter} | ${series?.title || "غير معروف"}`,
  };
}

export default async function ChapterReaderPage({ params }: PageProps) {
  const { slug, chapter } = await params;
  const chapterNumber = parseFloat(chapter);
  
  const supabase = await createClient();

  // Get series details
  const { data: series } = await supabase
    .from("series")
    .select("id, title, slug, chapters(id, chapter_number)")
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
    <div className="bg-[var(--bg-primary)] min-h-screen">
      <ViewTracker type="chapter" id={currentChapter.id} />
      {/* Reader Header */}
      <header
        className="sticky top-0 z-50 transition-transform duration-300"
        style={{
          background: "var(--header-bg)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid var(--border-color)",
        }}
      >
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/series/${series.slug}`}
              className="p-2 -ml-2 rounded-lg hover:bg-[var(--card-hover)] transition-colors"
            >
              <ChevronRight className="w-5 h-5 flip-rtl" style={{ color: "var(--text-secondary)" }} />
            </Link>
            <div className="min-w-0 flex flex-col justify-center">
              <h1 className="text-sm font-bold truncate" style={{ color: "var(--text-primary)" }}>
                {series.title}
              </h1>
              <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                الفصل {chapter}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="p-2 rounded-lg hover:bg-[var(--card-hover)] transition-colors hidden sm:block"
            >
              <Home className="w-5 h-5" style={{ color: "var(--text-secondary)" }} />
            </Link>
            <Link
              href={`/series/${series.slug}`}
              className="p-2 rounded-lg hover:bg-[var(--card-hover)] transition-colors"
            >
              <List className="w-5 h-5" style={{ color: "var(--text-secondary)" }} />
            </Link>
            <button className="p-2 rounded-lg hover:bg-[var(--card-hover)] transition-colors">
              <Settings className="w-5 h-5" style={{ color: "var(--text-secondary)" }} />
            </button>
          </div>
        </div>
      </header>

      {/* Reader Content */}
      <main className="max-w-3xl mx-auto w-full bg-black min-h-screen">
        {pages && pages.length > 0 ? (
          <div className="flex flex-col w-full justify-center">
            {pages.map((page, i) => (
              <div key={page.id} className="relative w-full">
                {/* 
                  Using standard HTML img for manhwa reading is often better for continuous scrolling
                  without artificial Next.js Image height constraints, but we can also use Next Image 
                  with layout="responsive" or width/height.
                */}
                <img
                  src={page.image_url}
                  alt={`صفحة ${page.page_number}`}
                  loading={i < 3 ? "eager" : "lazy"}
                  className="w-full h-auto block m-0 p-0 pointer-events-none"
                  style={{ display: "block" }}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-[50vh]">
            <p className="text-gray-400">لا توجد صور في هذا الفصل بعد.</p>
          </div>
        )}
      </main>

      {/* Reader Footer Navigation */}
      <footer
        className="py-6 mt-8"
        style={{
          background: "var(--header-bg)",
          borderTop: "1px solid var(--border-color)",
        }}
      >
        <div className="max-w-2xl mx-auto px-4 flex items-center justify-between">
          {prevChapter ? (
            <Link
              href={`/series/${series.slug}/${prevChapter}`}
              className="btn-secondary"
            >
              <ChevronRight className="w-5 h-5 flip-rtl" />
              الفصل السابق
            </Link>
          ) : (
            <div /> // Spacer
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
            <div className="px-6 py-2.5 text-sm text-gray-500 font-bold bg-white/5 rounded-full">نهاية الفصول</div>
          )}
        </div>
      </footer>

      {/* Discussion Area */}
      <div className="bg-black py-8">
        <CommentSection chapterId={currentChapter.id} />
      </div>
    </div>
  );
}
