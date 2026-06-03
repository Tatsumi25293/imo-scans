"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Upload, Eye, Loader2, List } from "lucide-react";
import { formatNumber, getStatusLabel, getStatusColor } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export default function AdminSeriesPage() {
  const supabase = createClient();
  const [series, setSeries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSeries();
  }, []);

  const fetchSeries = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("series")
        .select(`
          *,
          chapters (count)
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setSeries(data || []);
    } catch (err) {
      console.error("Error fetching series:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`هل أنت متأكد من حذف العمل "${title}" وجميع فصوله؟`)) return;
    try {
      const { error } = await supabase.from("series").delete().eq("id", id);
      if (error) throw error;
      setSeries((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Error deleting series:", err);
      alert("حدث خطأ أثناء الحذف.");
    }
  };

  return (
    <div className="page-transition">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            إدارة الأعمال
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {series.length} عمل في قاعدة البيانات الحقيقية
          </p>
        </div>
        <Link
          href="/admin/series/new"
          className="btn-primary"
        >
          <Plus className="w-5 h-5" />
          إضافة عمل جديد
        </Link>
      </div>

      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)" }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        ) : series.length === 0 ? (
          <div className="text-center p-12">
            <p className="text-lg font-medium mb-2" style={{ color: "var(--text-primary)" }}>لا توجد أعمال حالياً</p>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>ابدأ بإضافة عمل جديد ليظهر هنا.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                    <th className="text-right text-xs font-semibold px-5 py-3.5" style={{ color: "var(--text-muted)" }}>العمل</th>
                    <th className="text-right text-xs font-semibold px-5 py-3.5" style={{ color: "var(--text-muted)" }}>الحالة</th>
                    <th className="text-right text-xs font-semibold px-5 py-3.5" style={{ color: "var(--text-muted)" }}>الفصول</th>
                    <th className="text-right text-xs font-semibold px-5 py-3.5" style={{ color: "var(--text-muted)" }}>المشاهدات</th>
                    <th className="text-right text-xs font-semibold px-5 py-3.5" style={{ color: "var(--text-muted)" }}>إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: "var(--border-color)" }}>
                  {series.map((s) => (
                    <tr key={s.id} className="hover:bg-[var(--card-hover)] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-14 rounded-lg overflow-hidden flex-shrink-0" style={{ background: "var(--bg-tertiary)" }}>
                            {s.cover_image_url ? (
                              <img src={s.cover_image_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">غلاف</div>
                            )}
                          </div>
                          <div className="min-w-0 max-w-[200px]">
                            <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{s.title}</p>
                            <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{s.author || "غير محدد"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white ${getStatusColor(s.status)}`}>
                          {getStatusLabel(s.status)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                        {s.chapters?.[0]?.count || 0}
                      </td>
                      <td className="px-5 py-3.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                        {formatNumber(s.views_count)}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1">
                          <Link href={`/admin/chapters/${s.id}/new`} className="p-2 rounded-lg hover:bg-emerald-500/10 text-emerald-400 transition-colors" title="رفع فصل"><Upload className="w-4 h-4" /></Link>
                          <Link href={`/admin/chapters/${s.id}`} className="p-2 rounded-lg hover:bg-amber-500/10 text-amber-400 transition-colors" title="إدارة الفصول"><List className="w-4 h-4" /></Link>
                          <Link href={`/series/${s.slug}`} className="p-2 rounded-lg hover:bg-primary-500/10 text-primary-400 transition-colors" title="عرض بالموقع"><Eye className="w-4 h-4" /></Link>
                          <Link href={`/admin/series/${s.id}/edit`} className="p-2 rounded-lg hover:bg-primary-500/10 text-primary-400 transition-colors" title="تعديل"><Edit className="w-4 h-4" /></Link>
                          <button onClick={() => handleDelete(s.id, s.title)} className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors" title="حذف"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y" style={{ borderColor: "var(--border-color)" }}>
              {series.map((s) => (
                <div key={s.id} className="p-4">
                  <div className="flex gap-3">
                    <div className="w-16 h-22 rounded-lg overflow-hidden flex-shrink-0" style={{ background: "var(--bg-tertiary)" }}>
                      {s.cover_image_url && <img src={s.cover_image_url} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium mb-1 truncate" style={{ color: "var(--text-primary)" }}>{s.title}</p>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${getStatusColor(s.status)}`}>
                          {getStatusLabel(s.status)}
                        </span>
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>{s.chapters?.[0]?.count || 0} فصل</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Link href={`/admin/chapters/${s.id}/new`} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400">رفع فصل</Link>
                        <Link href={`/admin/chapters/${s.id}`} className="p-1.5 rounded-lg hover:bg-amber-500/10 text-amber-400"><List className="w-4 h-4" /></Link>
                        <Link href={`/admin/series/${s.id}/edit`} className="p-1.5 rounded-lg hover:bg-primary-500/10 text-primary-400"><Edit className="w-4 h-4" /></Link>
                        <button onClick={() => handleDelete(s.id, s.title)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
