import { createClient } from "@/lib/supabase/server";
import { SeriesCard } from "@/components/series/SeriesCard";
import { Search } from "lucide-react";
import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://imo-scans.vercel.app";

export const dynamic = "force-dynamic";

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const resolved = await searchParams;
  const q = resolved.q as string;

  if (!q) {
    return {
      title: "البحث في المانهوا",
      description: "ابحث عن أفضل المانهوا والويبتون المترجمة إلى العربية على IMO Scans.",
      robots: { index: false, follow: true },
    };
  }

  return {
    title: `نتائج البحث: ${q}`,
    description: `نتائج البحث عن "${q}" - اعثر على المانهوا والويبتون المترجمة على IMO Scans.`,
    openGraph: {
      title: `البحث عن: ${q} | IMO Scans`,
      description: `نتائج البحث عن "${q}" في مكتبة المانهوا والويبتون المترجمة.`,
      url: `${BASE_URL}/search?q=${encodeURIComponent(q)}`,
      siteName: "IMO Scans",
      locale: "ar_AR",
    },
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const q = resolvedSearchParams.q as string;
  const supabase = await createClient();

  let series: any[] = [];
  let error = null;

  if (q) {
    const { data, error: dbError } = await supabase
      .from("series")
      .select("*, genres:series_genres(genre:genres(*))")
      .ilike("title", `%${q}%`);
      
    if (dbError) {
      error = dbError.message;
    } else {
      series = data?.map(s => ({
        ...s,
        genres: s.genres?.map((g: any) => g.genre) || []
      })) || [];
    }
  }

  return (
    <div className="page-transition min-h-[60vh] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
      
      {/* Search Header */}
      <div className="mb-10 text-center space-y-4 pt-8">
         <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(43,127,255,0.4)]">
             <Search className="w-8 h-8 text-white" />
         </div>
         <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
           نتائج البحث
         </h1>
         <p style={{ color: "var(--text-secondary)" }}>
            النتائج المطابقة لـ: <span className="font-bold text-primary-500 text-lg">"{q || ''}"</span>
         </p>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-center">
          حدث خطأ أثناء البحث: {error}
        </div>
      )}

      {/* No Query / Empty State */}
      {!q ? (
        <div className="text-center py-20">
          <p style={{ color: "var(--text-muted)" }}>الرجاء إدخال كلمة بحث للبدء.</p>
        </div>
      ) : series.length === 0 && !error ? (
        <div className="text-center py-20 rounded-2xl border" style={{ background: "var(--card-bg)", borderColor: "var(--border-color)" }}>
           <h3 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>لم نتمكن من العثور على أي نتائج</h3>
           <p style={{ color: "var(--text-muted)" }}>حاول البحث باستخدام كلمات مفتاحية أخرى أو تحقق من الإملاء.</p>
        </div>
      ) : (
        /* Results Grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 lg:gap-4">
          {series.map((item, i) => (
            <div key={item.id} style={{ animation: `slide-up 0.3s ease-out ${i * 0.04}s both` }}>
              <SeriesCard series={item} />
            </div>
          ))}
        </div>
      )}
      
    </div>
  );
}
