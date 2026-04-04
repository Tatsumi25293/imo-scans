"use client";

import { useState, useCallback, useEffect, use, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Upload,
  X,
  ChevronLeft,
  Image as ImageIcon,
  Loader2,
  FileArchive,
  ImagePlus,
  CheckCircle2,
  AlertCircle,
  Layers,
  Eye,
  Trash2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type UploadMode = "images" | "zip";
type ImageItem = { id: string; file: File; preview: string };

export default function NewChapterPage({
  params,
}: {
  params: Promise<{ seriesId: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  const [series, setSeries] = useState<any>(null);
  const [chapterNumber, setChapterNumber] = useState("");
  const [chapterTitle, setChapterTitle] = useState("");
  const [uploadMode, setUploadMode] = useState<UploadMode>("images");

  // Image mode state
  const [images, setImages] = useState<ImageItem[]>([]);

  // ZIP mode state
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [zipPreviewCount, setZipPreviewCount] = useState<number | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    supabase
      .from("series")
      .select("id, title, cover_image_url")
      .eq("id", resolvedParams.seriesId)
      .single()
      .then(({ data }) => setSeries(data));
  }, [resolvedParams.seriesId]);

  /* ─── Image handlers ─── */
  const addFiles = (files: File[]) => {
    const validFiles = files.filter((f) => f.type.startsWith("image/"));
    const collator = new Intl.Collator(undefined, {
      numeric: true,
      sensitivity: "base",
    });
    validFiles.sort((a, b) => collator.compare(a.name, b.name));
    const newImages = validFiles.map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (id: string) =>
    setImages((prev) => prev.filter((img) => img.id !== id));

  const moveImage = (index: number, direction: -1 | 1) => {
    if (index + direction < 0 || index + direction >= images.length) return;
    const arr = [...images];
    [arr[index], arr[index + direction]] = [arr[index + direction], arr[index]];
    setImages(arr);
  };

  /* ─── Drag & Drop (images) ─── */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  const handleDragLeave = useCallback(() => setIsDragging(false), []);
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (uploadMode === "images") {
        addFiles(Array.from(e.dataTransfer.files));
      } else {
        const zips = Array.from(e.dataTransfer.files).filter((f) =>
          f.name.endsWith(".zip")
        );
        if (zips.length > 0) handleZipSelected(zips[0]);
      }
    },
    [uploadMode]
  );

  /* ─── ZIP handler ─── */
  const handleZipSelected = async (file: File) => {
    setZipFile(file);
    setZipPreviewCount(null);
    // Quick count using JSZip in the browser
    try {
      const jszipModule = await import("jszip");
      const JSZipConstructor = jszipModule.default || jszipModule;
      const JSZipInstance = new (JSZipConstructor as any)();
      const zip = await JSZipInstance.loadAsync(file);
      const imgCount = Object.values(zip.files).filter(
        (f: any) =>
          !f.dir &&
          !f.name.startsWith("__MACOSX") &&
          /\.(jpg|jpeg|png|webp)$/i.test(f.name)
      ).length;
      setZipPreviewCount(imgCount);
    } catch {
      setZipPreviewCount(0);
    }
  };

  /* ─── Create chapter record ─── */
  const createChapter = async (publish: boolean) => {
    const { data, error } = await supabase
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

    if (error) {
      if (error.code === "23505")
        throw new Error("رقم الفصل هذا موجود مسبقاً لهذه المانهوا.");
      throw new Error("فشل إنشاء الفصل: " + error.message);
    }
    return data;
  };

  /* ─── Upload Images One by One ─── */
  const uploadImages = async (chapterData: any) => {
    const uploadedPages = [];

    for (let i = 0; i < images.length; i++) {
      const item = images[i];
      const formData = new FormData();
      const ext = item.file.name.split(".").pop() || "jpg";
      formData.append("file", item.file);
      formData.append(
        "folder",
        `chapters/${resolvedParams.seriesId}/${chapterData.id}`
      );
      formData.append("fileName", `page_${i + 1}.${ext}`);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(`فشل رفع الصورة ${i + 1}: ` + err.error);
      }

      const { url } = await res.json();
      uploadedPages.push({
        chapter_id: chapterData.id,
        page_number: i + 1,
        image_url: url,
      });

      setUploadProgress(Math.round(((i + 1) / images.length) * 100));
    }

    return uploadedPages;
  };

  /* ─── Upload ZIP (Extracted locally via JSZip) ─── */
  const uploadZip = async (chapterData: any) => {
    if (!zipFile) throw new Error("لم يتم اختيار ملف ZIP");

    setUploadProgress(5);
    const jszipModule = await import("jszip");
    const JSZipConstructor = jszipModule.default || jszipModule;
    const JSZipInstance = new (JSZipConstructor as any)();
    const zip = await JSZipInstance.loadAsync(zipFile);

    const fileEntries = Object.entries(zip.files).filter(
      ([name, f]: [string, any]) =>
        !f.dir &&
        !name.startsWith("__MACOSX") &&
        /\.(jpg|jpeg|png|webp|gif)$/i.test(name)
    );

    if (fileEntries.length === 0) {
      throw new Error("ملف ZIP فارغ أو لا يحتوي على صور مدعومة.");
    }

    // Natural sort by filename
    fileEntries.sort(([a], [b]) => {
      const aName = a.split("/").pop() || a;
      const bName = b.split("/").pop() || b;
      return aName.localeCompare(bName, undefined, {
        numeric: true,
        sensitivity: "base",
      });
    });

    const uploadedPages = [];

    for (let i = 0; i < fileEntries.length; i++) {
      const [name, zipObj] = fileEntries[i] as [string, any];
      const blob = await zipObj.async("blob");
      const ext = name.split(".").pop()?.toLowerCase() || "jpg";
      const fileObj = new File([blob], `page_${i + 1}.${ext}`, {
        type: blob.type || "image/jpeg",
      });

      const formData = new FormData();
      formData.append("file", fileObj);
      formData.append(
        "folder",
        `chapters/${resolvedParams.seriesId}/${chapterData.id}`
      );
      formData.append("fileName", fileObj.name);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        let errMsg = "خطأ غير معروف";
        try {
          const err = await res.json();
          errMsg = err.error;
        } catch {
          /* ignore */
        }
        throw new Error(`فشل رفع الصورة ${i + 1} من ZIP: ${errMsg}`);
      }

      const { url } = await res.json();
      uploadedPages.push({
        chapter_id: chapterData.id,
        page_number: i + 1,
        image_url: url,
      });

      setUploadProgress(Math.round(((i + 1) / fileEntries.length) * 100));
    }

    return uploadedPages;
  };

  /* ─── Main submit ─── */
  const handleUpload = async (publish: boolean) => {
    if (!chapterNumber) {
      setErrorMsg("يرجى إدخال رقم الفصل.");
      return;
    }
    if (uploadMode === "images" && images.length === 0) {
      setErrorMsg("يرجى إضافة صورة واحدة على الأقل.");
      return;
    }
    if (uploadMode === "zip" && !zipFile) {
      setErrorMsg("يرجى اختيار ملف ZIP.");
      return;
    }

    setIsUploading(true);
    setUploadStatus("uploading");
    setErrorMsg("");
    setUploadProgress(0);

    try {
      const chapterData = await createChapter(publish);

      const uploadedPages =
        uploadMode === "images"
          ? await uploadImages(chapterData)
          : await uploadZip(chapterData);

      // Save pages in DB
      const { error: pagesError } = await supabase
        .from("chapter_pages")
        .insert(uploadedPages);

      if (pagesError) throw new Error("فشل حفظ الروابط: " + pagesError.message);

      setUploadProgress(100);
      setUploadStatus("success");

      setTimeout(() => {
        router.push("/admin/series");
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "حدث خطأ غير معروف.");
      setUploadStatus("error");
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
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/series"
          className="p-2 rounded-lg hover:bg-[var(--card-hover)] transition-colors"
          style={{ color: "var(--text-secondary)" }}
        >
          <ChevronLeft className="w-5 h-5 flip-rtl" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            إضافة فصل جديد
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            المانهوا:{" "}
            <strong className="text-primary-400">{series?.title}</strong>
          </p>
        </div>
        {series?.cover_image_url && (
          <div className="w-10 h-14 rounded-lg overflow-hidden flex-shrink-0 hidden sm:block" style={{ background: "var(--bg-tertiary)" }}>
            <img src={series.cover_image_url} alt="" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      {/* Success overlay */}
      {uploadStatus === "success" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
        >
          <div
            className="rounded-2xl p-8 text-center max-w-sm w-full mx-4"
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border-color)",
              animation: "slide-up 0.4s ease-out",
            }}
          >
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
            <h2
              className="text-xl font-bold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              تم الرفع بنجاح!
            </h2>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              جاري التحويل إلى قائمة المانهوا...
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Sidebar ── */}
        <div className="lg:col-span-1 space-y-5">
          {/* Chapter info */}
          <div
            className="rounded-xl p-5 space-y-4"
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border-color)",
            }}
          >
            <h2
              className="font-semibold flex items-center gap-2"
              style={{ color: "var(--text-primary)" }}
            >
              <Layers className="w-4 h-4 text-primary-400" />
              معلومات الفصل
            </h2>
            <div>
              <label
                className="text-sm mb-1.5 block"
                style={{ color: "var(--text-secondary)" }}
              >
                رقم الفصل *
              </label>
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
              <label
                className="text-sm mb-1.5 block"
                style={{ color: "var(--text-secondary)" }}
              >
                عنوان الفصل (اختياري)
              </label>
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

            <div
              className="pt-4 border-t"
              style={{ borderColor: "var(--border-color)" }}
            >
              <div className="flex justify-between text-sm mb-4">
                <span style={{ color: "var(--text-secondary)" }}>
                  {uploadMode === "images"
                    ? "عدد الصور"
                    : "ملف ZIP"}
                </span>
                <span className="font-bold text-primary-400">
                  {uploadMode === "images"
                    ? images.length
                    : zipFile
                    ? zipPreviewCount !== null
                      ? `${zipPreviewCount} صورة`
                      : "جاري الفحص..."
                    : "لم يتم الاختيار"}
                </span>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={() => handleUpload(true)}
                  disabled={isUploading || (uploadMode === "images" && images.length === 0) || (uploadMode === "zip" && !zipFile)}
                  className="w-full py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Upload className="w-5 h-5" />
                  )}
                  {isUploading ? `جاري الرفع... ${uploadProgress}%` : "نشر الفصل"}
                </button>

                <button
                  onClick={() => handleUpload(false)}
                  disabled={isUploading || (uploadMode === "images" && images.length === 0) || (uploadMode === "zip" && !zipFile)}
                  className="w-full py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{
                    background: "var(--bg-tertiary)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <Eye className="w-4 h-4" />
                  حفظ كمسودة
                </button>

                <Link
                  href="/admin/series"
                  className="w-full py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  إلغاء
                </Link>
              </div>

              {/* Progress */}
              {isUploading && (
                <div
                  className="mt-5 pt-4 border-t"
                  style={{ borderColor: "var(--border-color)" }}
                >
                  <div className="flex justify-between text-xs mb-2 font-medium">
                    <span style={{ color: "var(--text-secondary)" }}>
                      تقدم الرفع
                    </span>
                    <span className="text-primary-400">{uploadProgress}%</span>
                  </div>
                  <div
                    className="w-full h-2.5 rounded-full overflow-hidden"
                    style={{ background: "var(--bg-tertiary)" }}
                  >
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-500"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p
                    className="text-[11px] mt-2 text-center"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {uploadMode === "zip"
                      ? "يتم فك ضغط الملف ورفع الصور..."
                      : `رفع الصورة ${Math.min(
                          Math.ceil((uploadProgress / 100) * images.length),
                          images.length
                        )} من ${images.length}`}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Main Upload Area ── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Mode Tabs */}
          <div
            className="flex rounded-xl p-1 gap-1"
            style={{
              background: "var(--bg-tertiary)",
              border: "1px solid var(--border-color)",
            }}
          >
            <button
              onClick={() => setUploadMode("images")}
              disabled={isUploading}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                uploadMode === "images"
                  ? "bg-primary-600 text-white shadow-[0_0_16px_rgba(43,127,255,0.3)]"
                  : "hover:bg-[var(--card-hover)]"
              }`}
              style={uploadMode !== "images" ? { color: "var(--text-secondary)" } : undefined}
            >
              <ImagePlus className="w-4 h-4" />
              رفع صور منفردة
            </button>
            <button
              onClick={() => setUploadMode("zip")}
              disabled={isUploading}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                uploadMode === "zip"
                  ? "bg-primary-600 text-white shadow-[0_0_16px_rgba(43,127,255,0.3)]"
                  : "hover:bg-[var(--card-hover)]"
              }`}
              style={uploadMode !== "zip" ? { color: "var(--text-secondary)" } : undefined}
            >
              <FileArchive className="w-4 h-4" />
              رفع ملف ZIP
            </button>
          </div>

          {/* ── Image Upload Mode ── */}
          {uploadMode === "images" && (
            <>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${
                  isUploading ? "opacity-50 pointer-events-none" : "cursor-pointer"
                } ${isDragging ? "border-primary-400 bg-primary-500/5 scale-[1.01]" : ""}`}
                style={{
                  borderColor: isDragging
                    ? "var(--color-primary-400)"
                    : "var(--border-color)",
                  background: isDragging
                    ? "rgba(43, 127, 255, 0.04)"
                    : "var(--card-bg)",
                }}
                onClick={() => !isUploading && fileInputRef.current?.click()}
              >
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all ${
                    isDragging
                      ? "bg-primary-500/20 scale-110"
                      : "bg-primary-500/10"
                  }`}
                >
                  <Upload
                    className={`w-8 h-8 text-primary-500 transition-all ${
                      isDragging ? "scale-110" : ""
                    }`}
                  />
                </div>
                <h3
                  className="text-lg font-bold mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  {isDragging ? "أفلت الصور هنا ✨" : "اسحب وأفلت الصور هنا"}
                </h3>
                <p
                  className="text-sm mb-5"
                  style={{ color: "var(--text-muted)" }}
                >
                  يدعم JPG, PNG, WebP — سيتم الترتيب تلقائياً
                </p>
                <span className="px-6 py-2.5 rounded-xl text-sm font-medium bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 transition-colors inline-block">
                  <ImageIcon className="w-4 h-4 inline ml-2" />
                  تصفح الملفات
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    e.target.files && addFiles(Array.from(e.target.files))
                  }
                />
              </div>

              {images.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {images.length} صورة
                    </p>
                    <button
                      onClick={() => setImages([])}
                      disabled={isUploading}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      حذف الكل
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {images.map((img, index) => (
                      <div
                        key={img.id}
                        className="group relative aspect-[3/4] rounded-xl overflow-hidden shadow-md"
                        style={{
                          background: "var(--bg-tertiary)",
                          border: "1px solid var(--border-color)",
                        }}
                      >
                        <img
                          src={img.preview}
                          alt={`Page ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col justify-between p-2">
                          <div className="flex justify-between items-start">
                            <span className="w-6 h-6 rounded-md bg-black/70 text-white text-xs font-bold flex items-center justify-center backdrop-blur-sm">
                              {index + 1}
                            </span>
                            {!isUploading && (
                              <button
                                onClick={() => removeImage(img.id)}
                                className="w-6 h-6 rounded-md bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          {!isUploading && (
                            <div className="flex justify-between gap-1">
                              <button
                                onClick={() => moveImage(index, -1)}
                                disabled={index === 0}
                                className="flex-1 h-7 rounded-md bg-black/60 text-white text-xs disabled:opacity-20 hover:bg-black/80 transition-colors backdrop-blur-sm"
                              >
                                ↑
                              </button>
                              <button
                                onClick={() => moveImage(index, 1)}
                                disabled={index === images.length - 1}
                                className="flex-1 h-7 rounded-md bg-black/60 text-white text-xs disabled:opacity-20 hover:bg-black/80 transition-colors backdrop-blur-sm"
                              >
                                ↓
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── ZIP Upload Mode ── */}
          {uploadMode === "zip" && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-200 ${
                isUploading ? "opacity-50 pointer-events-none" : "cursor-pointer"
              } ${isDragging ? "scale-[1.01]" : ""}`}
              style={{
                borderColor: zipFile
                  ? "var(--color-primary-400)"
                  : isDragging
                  ? "rgba(43,127,255,0.6)"
                  : "var(--border-color)",
                background: zipFile
                  ? "rgba(43,127,255,0.04)"
                  : isDragging
                  ? "rgba(43,127,255,0.04)"
                  : "var(--card-bg)",
              }}
              onClick={() => !isUploading && zipInputRef.current?.click()}
            >
              {zipFile ? (
                <div>
                  <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                    <FileArchive className="w-10 h-10 text-emerald-400" />
                  </div>
                  <p
                    className="text-lg font-bold mb-1"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {zipFile.name}
                  </p>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    {(zipFile.size / 1024 / 1024).toFixed(2)} MB
                    {zipPreviewCount !== null &&
                      ` · ${zipPreviewCount} صورة`}
                  </p>
                  {!isUploading && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setZipFile(null);
                        setZipPreviewCount(null);
                      }}
                      className="mt-4 px-4 py-2 rounded-xl text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors inline-flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      إزالة الملف
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  <div
                    className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 transition-all ${
                      isDragging ? "bg-primary-500/20 scale-110" : "bg-primary-500/10"
                    }`}
                  >
                    <FileArchive
                      className={`w-10 h-10 text-primary-500 transition-all ${
                        isDragging ? "scale-110" : ""
                      }`}
                    />
                  </div>
                  <h3
                    className="text-xl font-bold mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {isDragging ? "أفلت ملف ZIP هنا ✨" : "ارفع ملف ZIP"}
                  </h3>
                  <p
                    className="text-sm mb-6"
                    style={{ color: "var(--text-muted)" }}
                  >
                    ضع كل صور الفصل داخل ملف ZIP واحد — سيتم استخراجها وترتيبها
                    تلقائياً
                  </p>
                  <span className="px-8 py-3 rounded-xl text-sm font-semibold bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 transition-colors inline-flex items-center gap-2">
                    <FileArchive className="w-4 h-4" />
                    اختر ملف ZIP
                  </span>
                </div>
              )}

              <input
                ref={zipInputRef}
                type="file"
                accept=".zip,application/zip"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleZipSelected(f);
                }}
              />
            </div>
          )}

          {/* Tips section */}
          <div
            className="rounded-xl p-4 text-xs space-y-1.5"
            style={{
              background: "var(--bg-tertiary)",
              color: "var(--text-muted)",
            }}
          >
            <p className="font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>
              💡 نصائح للرفع
            </p>
            {uploadMode === "images" ? (
              <>
                <p>• سمّ الصور بأرقام (1.jpg, 2.jpg) للترتيب التلقائي</p>
                <p>• يمكنك رفع أكثر من 100 صورة دفعة واحدة</p>
                <p>• يدعم JPG، PNG، WebP</p>
              </>
            ) : (
              <>
                <p>• اضغط جميع صور الفصل في ملف ZIP واحد</p>
                <p>• سمّ الصور 1.jpg، 2.jpg... لضمان الترتيب الصحيح</p>
                <p>• لا داعي لمجلدات داخل ZIP، الصور مباشرة</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
