"use client";

import { useState } from "react";
import { Upload, Image as ImageIcon, X, ChevronLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { mockGenres } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/client";

export default function NewSeriesPage() {
  const router = useRouter();
  const supabase = createClient();
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    author: "",
    artist: "",
    status: "ongoing",
    type: "manhwa",
  });

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onload = () => setCoverPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "title") {
      setFormData((prev) => ({
        ...prev,
        slug: value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      }));
    }
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
      let cover_image_url = null;

      // 1. Upload Cover Image if exists
      if (coverFile) {
        const fileExt = coverFile.name.split('.').pop();
        const fileName = `${formData.slug}-${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("covers")
          .upload(fileName, coverFile);

        if (uploadError) throw new Error("فشل رفع صورة الغلاف: " + uploadError.message);

        const { data: publicUrlData } = supabase.storage
          .from("covers")
          .getPublicUrl(fileName);
        cover_image_url = publicUrlData.publicUrl;
      }

      // 2. Insert Series
      const { data: seriesData, error: seriesError } = await supabase
        .from("series")
        .insert({
          title: formData.title,
          slug: formData.slug,
          description: formData.description,
          author: formData.author,
          artist: formData.artist,
          status: formData.status,
          type: formData.type,
          cover_image_url,
        })
        .select()
        .single();

      if (seriesError) throw new Error("فشل حفظ المانهوا: " + seriesError.message);

      // 3. Insert Genres (Fetch genre IDs based on slugs selected)
      if (selectedGenres.length > 0 && seriesData) {
        const { data: genresData } = await supabase
          .from("genres")
          .select("id, slug")
          .in("slug", selectedGenres);

        if (genresData && genresData.length > 0) {
          const seriesGenresToInsert = genresData.map((g) => ({
            series_id: seriesData.id,
            genre_id: g.id,
          }));

          await supabase.from("series_genres").insert(seriesGenresToInsert);
        }
      }

      alert("تمت الإضافة بنجاح!");
      router.push("/admin/series");
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

  return (
    <div className="page-transition max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
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
            أضف مانهوا جديدة فعلياً إلى قاعدة بيانات Supabase
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cover Image */}
        <div className="rounded-xl p-5" style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)" }}>
          <label className="text-sm font-semibold mb-3 block" style={{ color: "var(--text-primary)" }}>
            صورة الغلاف
          </label>
          <div className="flex items-start gap-4">
            {coverPreview ? (
              <div className="relative w-32 aspect-[3/4] rounded-xl overflow-hidden">
                <img src={coverPreview} alt="غلاف" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setCoverPreview(null);
                    setCoverFile(null);
                  }}
                  className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="upload-zone w-32 aspect-[3/4] rounded-xl flex flex-col items-center justify-center cursor-pointer">
                <ImageIcon className="w-8 h-8 mb-2" style={{ color: "var(--text-muted)" }} />
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>رفع صورة</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
              </label>
            )}
            <div className="flex-1">
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                يُفضل أن تكون الصورة بأبعاد 400×560 بكسل بصيغة JPG أو PNG. سيتم رفعها مباشرة إلى حاوية covers.
              </p>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="rounded-xl p-5 space-y-4" style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)" }}>
          <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>
            المعلومات الأساسية
          </h2>
          <div>
            <label className="text-sm mb-1.5 block" style={{ color: "var(--text-secondary)" }}>عنوان المانهوا *</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="مثال: صعود المحارب الأسطوري" className="w-full px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 transition-all" style={inputStyle} required disabled={isSubmitting} />
          </div>
          <div>
            <label className="text-sm mb-1.5 block" style={{ color: "var(--text-secondary)" }}>الرابط (Slug) *</label>
            <input type="text" name="slug" value={formData.slug} onChange={handleChange} placeholder="rise-of-legendary-warrior" dir="ltr" className="w-full px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 transition-all font-mono" style={inputStyle} required disabled={isSubmitting} />
          </div>
          <div>
            <label className="text-sm mb-1.5 block" style={{ color: "var(--text-secondary)" }}>الوصف</label>
            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="اكتب وصفاً موجزاً..." rows={4} className="w-full px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none" style={inputStyle} disabled={isSubmitting} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm mb-1.5 block" style={{ color: "var(--text-secondary)" }}>المؤلف</label>
              <input type="text" name="author" value={formData.author} onChange={handleChange} placeholder="اسم المؤلف" className="w-full px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 transition-all" style={inputStyle} disabled={isSubmitting} />
            </div>
            <div>
              <label className="text-sm mb-1.5 block" style={{ color: "var(--text-secondary)" }}>الرسام</label>
              <input type="text" name="artist" value={formData.artist} onChange={handleChange} placeholder="اسم الرسام" className="w-full px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 transition-all" style={inputStyle} disabled={isSubmitting} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm mb-1.5 block" style={{ color: "var(--text-secondary)" }}>النوع</label>
              <select name="type" value={formData.type} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 transition-all" style={inputStyle} disabled={isSubmitting}>
                <option value="manhwa">مانهوا (كورية)</option>
                <option value="manga">مانجا (يابانية)</option>
                <option value="manhua">مانها (صينية)</option>
              </select>
            </div>
            <div>
              <label className="text-sm mb-1.5 block" style={{ color: "var(--text-secondary)" }}>الحالة</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 transition-all" style={inputStyle} disabled={isSubmitting}>
                <option value="ongoing">مستمرة</option>
                <option value="completed">مكتملة</option>
                <option value="hiatus">متوقفة</option>
              </select>
            </div>
          </div>
        </div>

        {/* Genres */}
        <div className="rounded-xl p-5" style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)" }}>
          <h2 className="font-semibold mb-3" style={{ color: "var(--text-primary)" }}>التصنيفات</h2>
          <div className="flex flex-wrap gap-2">
            {mockGenres.map((genre) => {
              const isSelected = selectedGenres.includes(genre.slug);
              return (
                <button
                  key={genre.id}
                  type="button"
                  onClick={() => toggleGenre(genre.slug)}
                  disabled={isSubmitting}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                    isSelected ? "bg-primary-600 text-white shadow-[0_0_10px_rgba(43,127,255,0.3)]" : ""
                  } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                  style={!isSelected ? { background: "var(--bg-tertiary)", color: "var(--text-secondary)" } : undefined}
                >
                  {genre.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3 justify-end mt-4">
          <Link href="/admin/series" className="btn-secondary">
            إلغاء
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmitting ? "جاري الحفظ..." : "حفظ المانهوا"}
          </button>
        </div>
      </form>
    </div>
  );
}
