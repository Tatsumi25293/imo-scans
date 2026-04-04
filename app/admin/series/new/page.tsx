"use client";

import { useState, useRef } from "react";
import {
  Upload,
  Image as ImageIcon,
  X,
  ChevronLeft,
  Loader2,
  CheckCircle2,
  BookOpen,
  Pen,
  Tag,
  Globe2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { mockGenres } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/client";

export default function NewSeriesPage() {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isDraggingCover, setIsDraggingCover] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    author: "",
    artist: "",
    status: "ongoing",
    type: "manhwa",
  });

  const handleCoverChange = (file: File) => {
    setCoverFile(file);
    const reader = new FileReader();
    reader.onload = () => setCoverPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "title") {
        next.slug = value
          .toLowerCase()
          .trim()
          .replace(/\s+/g, "-") // Replace spaces with -
          .replace(/[^\u0600-\u06FFa-z0-9-]/g, ""); // Keep Arabic chars, letters, numbers and hyphens
      }
      return next;
    });
  };

  const toggleGenre = (genreSlug: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genreSlug)
        ? prev.filter((s) => s !== genreSlug)
        : [...prev, genreSlug]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const cleanSlug = formData.slug
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\u0600-\u06FFa-z0-9-]/g, "");

      let cover_image_url = null;

      // 1. Upload Cover Image to Vultr Object Storage
      if (coverFile) {
        const fileExt = coverFile.name.split(".").pop() || "jpg";
        const fileName = `${cleanSlug}-${Date.now()}.${fileExt}`;
        const uploadFormData = new FormData();
        uploadFormData.append("file", coverFile);
        uploadFormData.append("folder", "covers");
        uploadFormData.append("fileName", fileName);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(
            "فشل رفع صورة الغلاف: " + (err.error || "خطأ غير معروف")
          );
        }

        const { url } = await res.json();
        cover_image_url = url;
      }

      // 2. Insert Series
      const { data: seriesData, error: seriesError } = await supabase
        .from("series")
        .insert({
          title: formData.title,
          slug: cleanSlug,
          description: formData.description,
          author: formData.author,
          artist: formData.artist,
          status: formData.status,
          type: formData.type,
          cover_image_url,
        })
        .select()
        .single();

      if (seriesError)
        throw new Error("فشل حفظ المانهوا: " + seriesError.message);

      // 3. Insert Genres
      if (selectedGenres.length > 0 && seriesData) {
        const { data: genresData } = await supabase
          .from("genres")
          .select("id, slug")
          .in("slug", selectedGenres);

        if (genresData && genresData.length > 0) {
          await supabase.from("series_genres").insert(
            genresData.map((g) => ({
              series_id: seriesData.id,
              genre_id: g.id,
            }))
          );
        }
      }

      setIsDone(true);
      setTimeout(() => {
        router.push("/admin/series");
      }, 1500);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "حدث خطأ غير معروف");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = {
    background: "var(--bg-tertiary)",
    color: "var(--text-primary)",
    border: "1px solid var(--border-color)",
  };

  // Success overlay
  if (isDone) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
        <div className="rounded-2xl p-10 text-center max-w-sm w-full mx-4" style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)", animation: "slide-up 0.4s ease-out" }}>
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>تمت الإضافة بنجاح!</h2>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>جاري التحويل إلى قائمة المانهوا...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-transition max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/admin/series"
          className="p-2 rounded-lg hover:bg-[var(--card-hover)] transition-colors"
          style={{ color: "var(--text-secondary)" }}
        >
          <ChevronLeft className="w-5 h-5 flip-rtl" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            إضافة مانهوا جديدة
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            ستُرفع الصورة إلى Vultr Object Storage تلقائياً
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium flex items-start gap-2">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Cover Image ── */}
        <div
          className="rounded-2xl p-6"
          style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)" }}
        >
          <label className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <ImageIcon className="w-4 h-4 text-primary-400" />
            صورة الغلاف
          </label>
          <div className="flex items-start gap-5">
            {/* Preview or upload zone */}
            {coverPreview ? (
              <div className="relative w-28 aspect-[3/4] rounded-xl overflow-hidden flex-shrink-0 shadow-lg">
                <img src={coverPreview} alt="غلاف" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => { setCoverPreview(null); setCoverFile(null); }}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black/90 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div
                className={`w-28 aspect-[3/4] rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all flex-shrink-0 ${
                  isDraggingCover ? "border-primary-400 bg-primary-500/10 scale-105" : ""
                }`}
                style={{
                  borderColor: isDraggingCover ? "var(--color-primary-400)" : "var(--border-color)",
                  background: isDraggingCover ? "rgba(43,127,255,0.06)" : "var(--bg-tertiary)",
                }}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDraggingCover(true); }}
                onDragLeave={() => setIsDraggingCover(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingCover(false);
                  const f = e.dataTransfer.files[0];
                  if (f?.type.startsWith("image/")) handleCoverChange(f);
                }}
              >
                <Upload className="w-6 h-6 mb-1.5" style={{ color: "var(--text-muted)" }} />
                <span className="text-[10px] text-center px-2" style={{ color: "var(--text-muted)" }}>
                  اسحب أو انقر
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCoverChange(f); }}
                />
              </div>
            )}
            <div className="flex-1">
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                يُفضل أن تكون الصورة بأبعاد{" "}
                <strong style={{ color: "var(--text-secondary)" }}>400×560</strong> بكسل
                بصيغة JPG أو PNG.
              </p>
              <p className="text-xs mt-2 leading-relaxed" style={{ color: "var(--text-muted)" }}>
                ستُرفع الصورة مباشرة إلى{" "}
                <span className="text-primary-400 font-medium">Vultr Object Storage</span>{" "}
                بشكل آمن.
              </p>
              {!coverPreview && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 px-4 py-2 rounded-lg text-xs font-medium bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 transition-colors inline-flex items-center gap-2"
                >
                  <Upload className="w-3.5 h-3.5" />
                  رفع صورة
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Basic Info ── */}
        <div
          className="rounded-2xl p-6 space-y-4"
          style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)" }}
        >
          <h2 className="font-semibold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <BookOpen className="w-4 h-4 text-primary-400" />
            المعلومات الأساسية
          </h2>

          <div>
            <label className="text-sm mb-1.5 block" style={{ color: "var(--text-secondary)" }}>
              عنوان المانهوا <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="مثال: صعود المحارب الأسطوري"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              style={inputStyle}
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="text-sm mb-1.5 block" style={{ color: "var(--text-secondary)" }}>
              الرابط (Slug) <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              placeholder="rise-of-legendary-warrior"
              dir="ltr"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 transition-all font-mono"
              style={inputStyle}
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="text-sm mb-1.5 block" style={{ color: "var(--text-secondary)" }}>
              الوصف
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="اكتب وصفاً موجزاً للقصة..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none"
              style={inputStyle}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm mb-1.5 block" style={{ color: "var(--text-secondary)" }}>المؤلف</label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleChange}
                placeholder="اسم المؤلف"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                style={inputStyle}
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="text-sm mb-1.5 block" style={{ color: "var(--text-secondary)" }}>الرسام</label>
              <input
                type="text"
                name="artist"
                value={formData.artist}
                onChange={handleChange}
                placeholder="اسم الرسام"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                style={inputStyle}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm mb-1.5 flex items-center gap-1" style={{ color: "var(--text-secondary)" }}>
                <Globe2 className="w-3.5 h-3.5" /> النوع
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                style={inputStyle}
                disabled={isSubmitting}
              >
                <option value="manhwa">مانهوا (كورية) 🇰🇷</option>
                <option value="manga">مانجا (يابانية) 🇯🇵</option>
                <option value="manhua">مانها (صينية) 🇨🇳</option>
              </select>
            </div>
            <div>
              <label className="text-sm mb-1.5 block" style={{ color: "var(--text-secondary)" }}>الحالة</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                style={inputStyle}
                disabled={isSubmitting}
              >
                <option value="ongoing">🟢 مستمرة</option>
                <option value="completed">🔵 مكتملة</option>
                <option value="hiatus">🟡 متوقفة</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Genres ── */}
        <div
          className="rounded-2xl p-6"
          style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)" }}
        >
          <h2 className="font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <Tag className="w-4 h-4 text-primary-400" />
            التصنيفات
            {selectedGenres.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary-500/15 text-primary-400 font-bold">
                {selectedGenres.length}
              </span>
            )}
          </h2>
          <div className="flex flex-wrap gap-2">
            {mockGenres.map((genre) => {
              const isSelected = selectedGenres.includes(genre.slug);
              return (
                <button
                  key={genre.id}
                  type="button"
                  onClick={() => toggleGenre(genre.slug)}
                  disabled={isSubmitting}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isSelected
                      ? "bg-primary-600 text-white shadow-[0_0_12px_rgba(43,127,255,0.3)] scale-[1.03]"
                      : "hover:bg-[var(--card-hover)]"
                  } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                  style={
                    !isSelected
                      ? { background: "var(--bg-tertiary)", color: "var(--text-secondary)" }
                      : undefined
                  }
                >
                  {genre.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="flex items-center gap-3 justify-end pb-6">
          <Link href="/admin/series" className="btn-secondary">
            إلغاء
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed min-w-[160px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Pen className="w-4 h-4" />
                حفظ المانهوا
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
