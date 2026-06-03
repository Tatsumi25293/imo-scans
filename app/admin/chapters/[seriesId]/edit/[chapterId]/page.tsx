"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Loader2, CheckCircle2, AlertCircle, Pen, Layers } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function EditChapterPage({
  params,
}: {
  params: Promise<{ seriesId: string; chapterId: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const supabase = createClient();

  const [series, setSeries] = useState<any>(null);
  const [chapterNumber, setChapterNumber] = useState("");
  const [chapterTitle, setChapterTitle] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDone, setIsDone] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchData();
  }, [resolvedParams.seriesId, resolvedParams.chapterId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: seriesData } = await supabase
        .from("series")
        .select("title")
        .eq("id", resolvedParams.seriesId)
        .single();
      
      setSeries(seriesData);

      const { data: chapterData, error } = await supabase
        .from("chapters")
        .select("*")
        .eq("id", resolvedParams.chapterId)
        .single();
      
      if (error) throw error;
      if (chapterData) {
        setChapterNumber(chapterData.chapter_number?.toString() || "");
        setChapterTitle(chapterData.title || "");
        setIsPublished(chapterData.is_published);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("حدث خطأ أثناء جلب بيانات الفصل.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapterNumber) {
      setErrorMsg("يرجى إدخال رقم الفصل.");
      return;
    }

    setIsUploading(true);
    setErrorMsg("");

    try {
      const { error } = await supabase
        .from("chapters")
        .update({
          chapter_number: parseFloat(chapterNumber),
          title: chapterTitle || null,
          is_published: isPublished,
        })
        .eq("id", resolvedParams.chapterId);

      if (error) {
        if (error.code === "23505")
          throw new Error("رقم الفصل هذا موجود مسبقاً لهذا العمل.");
        throw new Error("فشل تعديل الفصل: " + error.message);
      }

      setIsDone(true);
      setTimeout(() => {
        router.push(`/admin/chapters/${resolvedParams.seriesId}`);
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "حدث خطأ غير معروف.");
    } finally {
      setIsUploading(false);
    }
  };

  const inputStyle = {
    background: "var(--bg-tertiary)",
    color: "var(--text-primary)",
    border: "1px solid var(--border-color)",
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="page-transition max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href={`/admin/chapters/${resolvedParams.seriesId}`}
          className="p-2 rounded-lg hover:bg-[var(--card-hover)] transition-colors"
          style={{ color: "var(--text-secondary)" }}
        >
          <ChevronLeft className="w-5 h-5 flip-rtl" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            تعديل معلومات الفصل
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            العمل: <strong className="text-primary-400">{series?.title}</strong>
          </p>
        </div>
      </div>

      {/* Success overlay */}
      {isDone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
          <div className="rounded-2xl p-8 text-center max-w-sm w-full mx-4" style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)", animation: "slide-up 0.4s ease-out" }}>
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>تم التعديل بنجاح!</h2>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>جاري التحويل لقائمة الفصول...</p>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium flex items-start gap-2">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleUpdate} className="rounded-xl p-6 space-y-6" style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)" }}>
        <h2 className="font-semibold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <Layers className="w-4 h-4 text-primary-400" />
          البيانات الأساسية للفصل
        </h2>
        
        <div>
          <label className="text-sm mb-1.5 block" style={{ color: "var(--text-secondary)" }}>
            رقم الفصل *
          </label>
          <input
            type="number"
            step="0.1"
            value={chapterNumber}
            onChange={(e) => setChapterNumber(e.target.value)}
            placeholder="مثال: 12"
            className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            style={inputStyle}
            disabled={isUploading}
            required
          />
        </div>
        
        <div>
          <label className="text-sm mb-1.5 block" style={{ color: "var(--text-secondary)" }}>
            عنوان الفصل (اختياري)
          </label>
          <input
            type="text"
            value={chapterTitle}
            onChange={(e) => setChapterTitle(e.target.value)}
            placeholder="يوميات البطل"
            className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            style={inputStyle}
            disabled={isUploading}
          />
        </div>

        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              disabled={isUploading}
              className="w-5 h-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
            />
            <span className="text-sm" style={{ color: "var(--text-primary)" }}>
              نشر الفصل مباشرة وتفعيله في الموقع
            </span>
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t" style={{ borderColor: "var(--border-color)" }}>
          <Link href={`/admin/chapters/${resolvedParams.seriesId}`} className="btn-secondary">
            إلغاء
          </Link>
          <button type="submit" disabled={isUploading} className="btn-primary min-w-[160px]">
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Pen className="w-4 h-4" />
                تحديث الفصل
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
