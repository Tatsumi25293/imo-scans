"use client";

import { useState, useCallback, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Upload, X, GripVertical, ChevronLeft, Image as ImageIcon, CheckCircle2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function NewChapterPage({ params }: { params: Promise<{ seriesId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const supabase = createClient();

  const [series, setSeries] = useState<any>(null);
  const [chapterNumber, setChapterNumber] = useState("");
  const [chapterTitle, setChapterTitle] = useState("");
  const [images, setImages] = useState<Array<{ id: string; file: File; preview: string }>>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    supabase
      .from("series")
      .select("id, title")
      .eq("id", resolvedParams.seriesId)
      .single()
      .then(({ data }) => setSeries(data));
  }, [resolvedParams.seriesId, supabase]);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!e.dataTransfer.files) return;
    addFiles(Array.from(e.dataTransfer.files));
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    addFiles(Array.from(e.target.files));
  };

  const addFiles = (files: File[]) => {
    const validFiles = files.filter(f => f.type.startsWith("image/"));
    
    // Sort files by name naturally if possible (e.g. 1.jpg, 2.jpg... 10.jpg)
    const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
    validFiles.sort((a, b) => collator.compare(a.name, b.name));

    const newImages = validFiles.map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    if (index + direction < 0 || index + direction >= images.length) return;
    const newImages = [...images];
    const temp = newImages[index];
    newImages[index] = newImages[index + direction];
    newImages[index + direction] = temp;
    setImages(newImages);
  };

  const cancelUpload = () => {
    if (confirm("هل أنت متأكد من الإلغاء؟ سيتم فقدان كل الصور المحددة.")) {
      router.push("/admin/series");
    }
  };

  const handleUpload = async (publish: boolean) => {
    if (!chapterNumber || images.length === 0) {
      setErrorMsg("يرجى إدخال رقم الفصل وإضافة صورة واحدة على الأقل.");
      return;
    }

    setIsUploading(true);
    setErrorMsg("");
    setUploadProgress(0);

    try {
      // 1. Create chapter record first to get an ID
      const { data: chapterData, error: chapterError } = await supabase
        .from("chapters")
        .insert({
          series_id: resolvedParams.seriesId,
          chapter_number: parseFloat(chapterNumber),
          title: chapterTitle || null,
          is_published: publish,
          published_at: publish ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (chapterError) {
        if (chapterError.code === "23505") {
          throw new Error("رقم الفصل هذا موجود مسبقاً لهذه المانهوا.");
        }
        throw new Error("فشل إنشاء الفصل: " + chapterError.message);
      }

      const chapterId = chapterData.id;
      const uploadedPages = [];

      // 2. Upload images sequentially to show smooth progress and avoid overloading
      for (let i = 0; i < images.length; i++) {
        const item = images[i];
        const fileExt = item.file.name.split('.').pop() || 'jpg';
        const fileName = `${resolvedParams.seriesId}/${chapterId}/page_${i + 1}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("chapters")
          .upload(fileName, item.file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw new Error(`فشل رفع الصورة رقم ${i + 1}: ` + uploadError.message);

        const { data: publicUrlData } = supabase.storage
          .from("chapters")
          .getPublicUrl(fileName);

        uploadedPages.push({
          chapter_id: chapterId,
          page_number: i + 1,
          image_url: publicUrlData.publicUrl,
        });

        setUploadProgress(Math.round(((i + 1) / images.length) * 100));
      }

      // 3. Save pages in DB
      const { error: pagesError } = await supabase
        .from("chapter_pages")
        .insert(uploadedPages);

      if (pagesError) throw new Error("فشل حفظ الروابط: " + pagesError.message);

      alert(`تم ${publish ? "نشر" : "حفظ"} الفصل بنجاح بنسبة 100%!`);
      router.push("/admin/series");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  if (!series && !errorMsg) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="page-transition max-w-4xl">
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
            إضافة فصل جديد
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            المانهوا: <strong className="text-primary-400">{series?.title}</strong>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar details */}
        <div className="lg:col-span-1 space-y-6">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">
              {errorMsg}
            </div>
          )}

          <div className="rounded-xl p-5 space-y-4" style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)" }}>
            <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>معلومات الفصل</h2>
            <div>
              <label className="text-sm mb-1.5 block" style={{ color: "var(--text-secondary)" }}>رقم الفصل *</label>
              <input
                type="number"
                step="0.1"
                value={chapterNumber}
                onChange={(e) => setChapterNumber(e.target.value)}
                placeholder="مثال: 12"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                style={inputStyle}
                disabled={isUploading}
              />
            </div>
            <div>
              <label className="text-sm mb-1.5 block" style={{ color: "var(--text-secondary)" }}>عنوان الفصل (اختياري)</label>
              <input
                type="text"
                value={chapterTitle}
                onChange={(e) => setChapterTitle(e.target.value)}
                placeholder="يوميات البطل"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                style={inputStyle}
                disabled={isUploading}
              />
            </div>
            <div className="pt-4 border-t border-dashed" style={{ borderColor: "var(--border-color)" }}>
              <div className="flex justify-between text-sm mb-4">
                <span style={{ color: "var(--text-secondary)" }}>عدد الصور</span>
                <span className="font-bold text-primary-400">{images.length}</span>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => handleUpload(true)}
                  disabled={isUploading || images.length === 0}
                  className="w-full py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                  {isUploading ? "جاري الرفع..." : "نشر الفصل"}
                </button>
                <button
                  onClick={() => handleUpload(false)}
                  disabled={isUploading || images.length === 0}
                  className="w-full py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: "var(--bg-tertiary)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  حفظ كمسودة
                </button>
                <button
                  onClick={cancelUpload}
                  disabled={isUploading}
                  className="w-full py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                >
                  إلغاء
                </button>
              </div>

              {/* Progress UI */}
              {isUploading && (
                <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--border-color)" }}>
                  <div className="flex justify-between text-xs mb-1.5 font-medium">
                    <span style={{ color: "var(--text-primary)" }}>تقدم الرفع</span>
                    <span className="text-primary-400">{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "var(--bg-tertiary)" }}>
                    <div
                      className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Upload Zone */}
        <div className="lg:col-span-2 space-y-4">
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              isUploading ? "opacity-50 pointer-events-none" : ""
            }`}
            style={{
              borderColor: "var(--border-color)",
              background: "var(--card-bg)",
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
          >
            <div className="w-16 h-16 rounded-full bg-primary-500/10 flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-primary-500" />
            </div>
            <h3 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>
              اسحب وأفلت الصور هنا
            </h3>
            <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
              يدعم JPG, PNG (يفضل التسمية الرقمية للترتيب التلقائي 1,2,3...)
            </p>
            <label className="inline-flex cursor-pointer">
              <span className="px-6 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-primary-500/20 text-primary-400 bg-primary-500/10">
                تصفح الملفات
              </span>
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileInput} />
            </label>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((img, index) => (
              <div
                key={img.id}
                className="group relative aspect-[3/4] rounded-xl overflow-hidden shadow-md"
                style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-color)" }}
              >
                <img src={img.preview} alt={`Page ${index + 1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                  <div className="flex justify-between">
                    <span className="w-6 h-6 rounded bg-black/60 text-white text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    {!isUploading && (
                      <button
                        onClick={() => removeImage(img.id)}
                        className="w-6 h-6 rounded bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  {!isUploading && (
                    <div className="flex justify-between">
                      <button onClick={() => moveImage(index, -1)} disabled={index === 0} className="w-6 h-6 rounded bg-black/60 text-white disabled:opacity-30">
                        ↑
                      </button>
                      <button onClick={() => moveImage(index, 1)} disabled={index === images.length - 1} className="w-6 h-6 rounded bg-black/60 text-white disabled:opacity-30">
                        ↓
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
