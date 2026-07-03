"use client";

import { useState, useEffect, use, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Pen,
  Layers,
  Trash2,
  ArrowUp,
  ArrowDown,
  Upload,
  X,
  ImageIcon,
  ImagePlus,
  FileArchive,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type PageItem = {
  id: string;
  image_url?: string;
  file?: File;
  preview: string;
  isNew?: boolean;
  isReplaced?: boolean;
};

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

const getProxyUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http")) {
    const key = getS3KeyFromUrl(url);
    return `/api/images/${key}`;
  }
  return url;
};

export default function EditChapterPage({
  params,
}: {
  params: Promise<{ seriesId: string; chapterId: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  const [series, setSeries] = useState<any>(null);
  const [chapterNumber, setChapterNumber] = useState("");
  const [chapterTitle, setChapterTitle] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  // Pages state
  const [pages, setPages] = useState<PageItem[]>([]);
  const [deletedKeys, setDeletedKeys] = useState<string[]>([]);

  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDone, setIsDone] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

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

      // Fetch chapter pages
      const { data: pagesData } = await supabase
        .from("chapter_pages")
        .select("*")
        .eq("chapter_id", resolvedParams.chapterId)
        .order("page_number", { ascending: true });

      if (pagesData) {
        setPages(
          pagesData.map((p: any) => ({
            id: p.id,
            image_url: p.image_url,
            preview: getProxyUrl(p.image_url),
          }))
        );
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("حدث خطأ أثناء جلب بيانات الفصل.");
    } finally {
      setIsLoading(false);
    }
  };

  /* ─── Page handlers ─── */
  const removePage = (index: number) => {
    const pageToRemove = pages[index];
    if (!pageToRemove.isNew && pageToRemove.image_url) {
      const key = getS3KeyFromUrl(pageToRemove.image_url);
      if (key) {
        setDeletedKeys((prev) => [...prev, key]);
      }
    }
    setPages((prev) => prev.filter((_, i) => i !== index));
  };

  const movePage = (index: number, direction: -1 | 1) => {
    if (index + direction < 0 || index + direction >= pages.length) return;
    const arr = [...pages];
    [arr[index], arr[index + direction]] = [arr[index + direction], arr[index]];
    setPages(arr);
  };

  const replacePageImage = (index: number, file: File) => {
    if (!file.type.startsWith("image/")) return;
    const oldPage = pages[index];
    if (!oldPage.isNew && oldPage.image_url) {
      const key = getS3KeyFromUrl(oldPage.image_url);
      if (key) {
        setDeletedKeys((prev) => [...prev, key]);
      }
    }
    const updated = [...pages];
    updated[index] = {
      ...updated[index],
      file,
      preview: URL.createObjectURL(file),
      isReplaced: true,
      image_url: undefined, // remove old URL so we re-upload
    };
    setPages(updated);
  };

  const addFiles = (files: File[]) => {
    const validFiles = files.filter((f) => f.type.startsWith("image/"));
    const collator = new Intl.Collator(undefined, {
      numeric: true,
      sensitivity: "base",
    });
    validFiles.sort((a, b) => collator.compare(a.name, b.name));
    
    const newItems = validFiles.map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      preview: URL.createObjectURL(file),
      isNew: true,
    }));
    setPages((prev) => [...prev, ...newItems]);
  };

  const handleZipSelected = async (file: File, append = false) => {
    try {
      const jszipModule = await import("jszip");
      const JSZipConstructor = jszipModule.default || jszipModule;
      const JSZipInstance = new (JSZipConstructor as any)();
      const zip = await JSZipInstance.loadAsync(file);
      
      const fileEntries = Object.entries(zip.files).filter(
        ([name, f]: [string, any]) =>
          !f.dir &&
          !name.startsWith("__MACOSX") &&
          /\.(jpg|jpeg|png|webp)$/i.test(name)
      );

      if (fileEntries.length === 0) {
        alert("ملف ZIP فارغ أو لا يحتوي على صور مدعومة.");
        return;
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

      const newItems: PageItem[] = [];
      for (let i = 0; i < fileEntries.length; i++) {
        const [name, zipObj] = fileEntries[i] as [string, any];
        const blob = await zipObj.async("blob");
        const ext = name.split(".").pop()?.toLowerCase() || "jpg";
        const fileObj = new File([blob], `page_${i + 1}.${ext}`, {
          type: blob.type || "image/jpeg",
        });
        
        newItems.push({
          id: Math.random().toString(36).substring(7),
          file: fileObj,
          preview: URL.createObjectURL(fileObj),
          isNew: true,
        });
      }

      if (!append) {
        // Mark all current existing pages as deleted
        pages.forEach((p) => {
          if (!p.isNew && p.image_url) {
            const key = getS3KeyFromUrl(p.image_url);
            if (key) setDeletedKeys((prev) => [...prev, key]);
          }
        });
        setPages(newItems);
      } else {
        setPages((prev) => [...prev, ...newItems]);
      }
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء قراءة ملف ZIP.");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapterNumber) {
      setErrorMsg("يرجى إدخال رقم الفصل.");
      return;
    }
    if (pages.length === 0) {
      setErrorMsg("يرجى إضافة صورة واحدة على الأقل للفصل.");
      return;
    }

    setIsUploading(true);
    setErrorMsg("");
    setUploadProgress(0);

    try {
      // 1. Update the chapter info
      const { error: chapterError } = await supabase
        .from("chapters")
        .update({
          chapter_number: parseFloat(chapterNumber),
          title: chapterTitle || null,
          is_published: isPublished,
          published_at: isPublished ? new Date().toISOString() : null,
        })
        .eq("id", resolvedParams.chapterId);

      if (chapterError) {
        if (chapterError.code === "23505")
          throw new Error("رقم الفصل هذا موجود مسبقاً لهذا العمل.");
        throw new Error("فشل تعديل الفصل: " + chapterError.message);
      }

      // 2. Delete removed files from S3/Vultr
      if (deletedKeys.length > 0) {
        for (const key of deletedKeys) {
          try {
            await fetch("/api/delete-file", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ key }),
            });
          } catch (err) {
            console.error("Failed to delete S3 key:", key, err);
          }
        }
      }

      // 3. Upload new or replaced page files to S3/Vultr
      const updatedPages = [...pages];
      const itemsToUpload = updatedPages.filter((p) => p.file && (p.isNew || p.isReplaced));

      for (let i = 0; i < updatedPages.length; i++) {
        const page = updatedPages[i];
        if (page.file) {
          const fileObj = page.file;
          const ext = fileObj.name.split(".").pop() || "jpg";
          const folder = `chapters/${resolvedParams.seriesId}/${resolvedParams.chapterId}`;
          const fileName = `page_${Date.now()}_${i + 1}.${ext}`;
          const contentType = fileObj.type || "image/jpeg";

          // Get presigned URL
          const urlRes = await fetch("/api/upload-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileName, folder, contentType }),
          });

          if (!urlRes.ok) {
            throw new Error(`فشل توليد رابط رفع الصورة الجديدة ${i + 1}`);
          }

          const { uploadUrl, publicUrl } = await urlRes.json();

          // Upload to S3
          const uploadRes = await fetch(uploadUrl, {
            method: "PUT",
            headers: { "Content-Type": contentType },
            body: fileObj,
          });

          if (!uploadRes.ok) {
            throw new Error(`فشل رفع الصورة الجديدة ${i + 1}`);
          }

          page.image_url = publicUrl;
          page.file = undefined;
          page.isNew = false;
          page.isReplaced = false;
        }

        // Calculate progress
        if (itemsToUpload.length > 0) {
          const uploadedCount = updatedPages.filter((p, idx) => idx <= i && (p.isNew || p.isReplaced || !p.file)).length;
          setUploadProgress(Math.round((uploadedCount / updatedPages.length) * 100));
        }
      }

      // 4. Save new pages order in Supabase
      // Delete old chapter pages
      const { error: deleteOldError } = await supabase
        .from("chapter_pages")
        .delete()
        .eq("chapter_id", resolvedParams.chapterId);

      if (deleteOldError) throw new Error("فشل إعادة تنظيم الصفحات: " + deleteOldError.message);

      // Insert new ordered pages
      const pagesToInsert = updatedPages.map((p, index) => ({
        chapter_id: resolvedParams.chapterId,
        image_url: p.image_url!,
        page_number: index + 1,
      }));

      const { error: insertError } = await supabase
        .from("chapter_pages")
        .insert(pagesToInsert);

      if (insertError) throw new Error("فشل حفظ ترتيب الصفحات: " + insertError.message);

      setUploadProgress(100);
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
    <div className="page-transition max-w-5xl mx-auto">
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
            تعديل معلومات الفصل وصوره
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

      <form onSubmit={handleUpdate} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left Sidebar (Basic Info & Save) ── */}
        <div className="lg:col-span-1 space-y-5">
          <div className="rounded-xl p-5 space-y-4" style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)" }}>
            <h2 className="font-semibold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <Layers className="w-4 h-4 text-primary-400" />
              البيانات الأساسية
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
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 transition-all"
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
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 transition-all"
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
                <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  نشر الفصل مباشرة
                </span>
              </label>
            </div>

            <div className="pt-4 border-t" style={{ borderColor: "var(--border-color)" }}>
              <div className="flex justify-between text-sm mb-4">
                <span style={{ color: "var(--text-secondary)" }}>إجمالي الصفحات</span>
                <span className="font-bold text-primary-400">{pages.length} صفحة</span>
              </div>

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={isUploading}
                  className="w-full py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  {isUploading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Pen className="w-5 h-5" />
                  )}
                  {isUploading ? `جاري حفظ التعديلات... ${uploadProgress}%` : "حفظ التعديلات"}
                </button>

                <Link
                  href={`/admin/chapters/${resolvedParams.seriesId}`}
                  className="w-full py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  إلغاء
                </Link>
              </div>

              {/* Progress bar */}
              {isUploading && (
                <div className="mt-5 pt-4 border-t" style={{ borderColor: "var(--border-color)" }}>
                  <div className="flex justify-between text-xs mb-2 font-medium">
                    <span style={{ color: "var(--text-secondary)" }}>تقدم الرفع والحفظ</span>
                    <span className="text-primary-400">{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: "var(--bg-tertiary)" }}>
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-500"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Right Content Area (Pages Editor & Drag-Drop) ── */}
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-xl p-5 space-y-5" style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)" }}>
            <h2 className="font-semibold flex items-center justify-between text-sm" style={{ color: "var(--text-primary)" }}>
              <span className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-primary-400" />
                ترتيب وإدارة صفحات الفصل
              </span>
              <span className="text-xs text-primary-400 bg-primary-500/10 px-2 py-1 rounded-full">
                حرك الماوس فوق الصورة للتعديل أو الترتيب
              </span>
            </h2>

            {/* Pages Grid */}
            {pages.length === 0 ? (
              <div className="text-center py-12 border border-dashed rounded-xl" style={{ borderColor: "var(--border-color)" }}>
                <p style={{ color: "var(--text-secondary)" }}>لا توجد صفحات في هذا الفصل حالياً.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[500px] overflow-y-auto pr-1">
                {pages.map((page, index) => (
                  <div
                    key={page.id}
                    className="relative rounded-xl overflow-hidden group aspect-[3/4] border transition-all"
                    style={{
                      background: "var(--bg-tertiary)",
                      borderColor: page.isNew ? "#3B82F6" : page.isReplaced ? "#F59E0B" : "var(--border-color)",
                    }}
                  >
                    {/* Preview Image */}
                    <img
                      src={page.preview}
                      alt={`الصفحة ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Page Number Badge */}
                    <div className="absolute top-2 right-2 bg-black/70 backdrop-blur text-white text-[11px] font-bold px-2 py-0.5 rounded-full select-none">
                      صفحة {index + 1}
                    </div>

                    {/* Status Badges */}
                    {page.isNew && (
                      <div className="absolute top-2 left-2 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                        جديد
                      </div>
                    )}
                    {page.isReplaced && (
                      <div className="absolute top-2 left-2 bg-amber-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                        مستبدل
                      </div>
                    )}

                    {/* Hover Action Overlay */}
                    <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2.5">
                      <div className="flex justify-between items-center">
                        <button
                          type="button"
                          onClick={() => removePage(index)}
                          className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                          title="حذف الصفحة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <label className="p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer" title="استبدال الصورة">
                          <Upload className="w-3.5 h-3.5" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                replacePageImage(index, e.target.files[0]);
                              }
                            }}
                          />
                        </label>
                      </div>

                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => movePage(index, -1)}
                          className="p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="تحريك لأعلى"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === pages.length - 1}
                          onClick={() => movePage(index, 1)}
                          className="p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="تحريك لأسفل"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Drag & Drop New Images Zone */}
            <div
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                isDragging ? "border-primary-500 bg-primary-500/5" : "hover:bg-[var(--card-hover)]"
              }`}
              style={{ borderColor: "var(--border-color)", background: "var(--bg-tertiary)" }}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files) {
                  addFiles(Array.from(e.dataTransfer.files));
                }
              }}
            >
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-400">
                  <ImagePlus className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    اسحب صوراً إضافية هنا أو اضغط للاختيار والتنزيل
                  </p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                    يدعم رفع ملفات منفصلة أو ملف مضغوط ZIP بالكامل
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    إضافة صور
                  </button>
                  <button
                    type="button"
                    onClick={() => zipInputRef.current?.click()}
                    className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"
                  >
                    <FileArchive className="w-3.5 h-3.5" />
                    رفع ملف ZIP
                  </button>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) {
                      addFiles(Array.from(e.target.files));
                    }
                  }}
                />
                <input
                  type="file"
                  ref={zipInputRef}
                  accept=".zip"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const append = confirm("هل تريد إضافة الصور في نهاية الفصل؟ (اضغط إلغاء لاستبدال جميع الصور الحالية بالـ ZIP)");
                      handleZipSelected(e.target.files[0], append);
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
