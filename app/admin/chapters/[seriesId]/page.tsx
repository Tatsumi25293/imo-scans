"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ChevronLeft, Plus, Trash2, Edit, Loader2, Eye, EyeOff, Layers } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";

const getS3KeyFromUrl = (url: string) => {
  if (!url) return "";
  const cdnUrl = "https://imo-scans.ams1.vultrobjects.com";
  if (url.startsWith(cdnUrl)) {
    return url.replace(`${cdnUrl}/`, "");
  }
  if (url.includes("storage.jetbackup.com")) {
    try {
      const parsed = new URL(url);
      return parsed.pathname.replace(/^\/imoscans\//, "").replace(/^\//, "");
    } catch {}
  }
  if (url.includes("vultrobjects.com")) {
    try {
      const parsed = new URL(url);
      return parsed.pathname.replace(/^\/imo-scans\//, "").replace(/^\/imoscans\//, "").replace(/^\//, "");
    } catch {}
  }
  if (url.startsWith("/api/images/")) {
    return url.replace("/api/images/", "");
  }
  return url;
};

export default function SeriesChaptersPage({ params }: { params: Promise<{ seriesId: string }> }) {
  const resolvedParams = use(params);
  const supabase = createClient();
  const [chapters, setChapters] = useState<any[]>([]);
  const [series, setSeries] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [resolvedParams.seriesId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch series detail
      const { data: seriesData, error: seriesError } = await supabase
        .from("series")
        .select("title")
        .eq("id", resolvedParams.seriesId)
        .single();
      
      if (seriesError) throw seriesError;
      setSeries(seriesData);

      // Fetch chapters
      const { data: chaptersData, error: chaptersError } = await supabase
        .from("chapters")
        .select(`
          *,
          chapter_pages (count)
        `)
        .eq("series_id", resolvedParams.seriesId)
        .order("chapter_number", { ascending: false });

      if (chaptersError) throw chaptersError;
      setChapters(chaptersData || []);
    } catch (err) {
      console.error("Error fetching chapters:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, number: number) => {
    if (!confirm(`هل أنت متأكد من حذف الفصل ${number} نهائياً بجميع صوره؟`)) return;
    try {
      // Fetch pages first to delete from S3
      const { data: pages } = await supabase
        .from("chapter_pages")
        .select("image_url")
        .eq("chapter_id", id);

      if (pages && pages.length > 0) {
        for (const page of pages) {
          const key = getS3KeyFromUrl(page.image_url);
          if (key) {
            await fetch("/api/delete-file", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ key }),
            });
          }
        }
      }

      // Delete chapter record
      const { error } = await supabase.from("chapters").delete().eq("id", id);
      if (error) throw error;
      setChapters((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Error deleting chapter:", err);
      alert("حدث خطأ أثناء الحذف.");
    }
  };

  const togglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("chapters")
        .update({
          is_published: !currentStatus,
          published_at: !currentStatus ? new Date().toISOString() : null,
        })
        .eq("id", id);

      if (error) throw error;
      setChapters((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, is_published: !currentStatus } : c
        )
      );
    } catch (err) {
      console.error("Error toggling publish:", err);
      alert("حدث خطأ أثناء تغيير حالة النشر.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="page-transition max-w-5xl">
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/admin/series"
          className="p-2 rounded-lg hover:bg-[var(--card-hover)] transition-colors"
          style={{ color: "var(--text-secondary)" }}
        >
          <ChevronLeft className="w-5 h-5 flip-rtl" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <Layers className="w-6 h-6 text-primary-500" />
            إدارة فصول: {series?.title}
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {chapters.length} فصل في قاعدة البيانات
          </p>
        </div>
        <Link
          href={`/admin/chapters/${resolvedParams.seriesId}/new`}
          className="btn-primary flex items-center gap-2 px-4 py-2"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">إضافة فصل</span>
        </Link>
      </div>

      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)" }}
      >
        {chapters.length === 0 ? (
          <div className="text-center p-12">
            <p className="text-lg font-medium mb-2" style={{ color: "var(--text-primary)" }}>لا توجد فصول حالياً</p>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>قم بإضافة فصول لهذا العمل.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                  <th className="px-5 py-3.5 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>رقم الفصل</th>
                  <th className="px-5 py-3.5 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>عنوان الفصل</th>
                  <th className="px-5 py-3.5 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>عدد الصور</th>
                  <th className="px-5 py-3.5 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>الحالة</th>
                  <th className="px-5 py-3.5 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>تاريخ الإضافة</th>
                  <th className="px-5 py-3.5 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border-color)" }}>
                {chapters.map((c) => (
                  <tr key={c.id} className="hover:bg-[var(--card-hover)] transition-colors group">
                    <td className="px-5 py-3.5 font-bold text-primary-400">
                      {c.chapter_number}
                    </td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: "var(--text-primary)" }}>
                      {c.title || "-"}
                    </td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                      {c.chapter_pages?.[0]?.count || 0} صورة
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => togglePublish(c.id, c.is_published)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors ${
                          c.is_published
                            ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                            : "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
                        }`}
                        title="تغييرالة النشر"
                      >
                        {c.is_published ? <><Eye className="w-3 h-3" /> منشور</> : <><EyeOff className="w-3 h-3" /> مسودة</>}
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-xs whitespace-nowrap" style={{ color: "var(--text-muted)" }}>
                      {formatDate(c.created_at)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/admin/chapters/${resolvedParams.seriesId}/edit/${c.id}`}
                          className="p-2 rounded-lg hover:bg-primary-500/10 text-primary-400 transition-colors"
                          title="تعديل الفصل"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(c.id, c.chapter_number)}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                          title="حذف الفصل"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
