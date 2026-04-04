import { BookOpen, Layers, Eye, TrendingUp } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "لوحة التحكم",
};

// Force dynamic since we read from DB
export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Fetch real data
  const { data: latestSeries } = await supabase
    .from("series")
    .select("id, title, chapters_count, views_count, cover_image_url, is_featured")
    .order("created_at", { ascending: false });

  const series = latestSeries || [];
  
  const totalSeries = series.length;
  // Assume real data uses `chapters_count` and `views_count` on the series row
  const totalChapters = series.reduce((acc, s) => acc + (s.chapters_count || 0), 0);
  const totalViews = series.reduce((acc, s) => acc + (s.views_count || 0), 0);
  const featured = series.filter(s => s.is_featured).length;

  const stats = [
    {
      label: "إجمالي المانهوا",
      value: totalSeries,
      icon: BookOpen,
      color: "from-primary-500 to-primary-600",
      bgColor: "from-primary-500/20 to-primary-600/20",
    },
    {
      label: "إجمالي الفصول",
      value: totalChapters,
      icon: Layers,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "from-emerald-500/20 to-emerald-600/20",
    },
    {
      label: "إجمالي المشاهدات",
      value: formatNumber(totalViews),
      icon: Eye,
      color: "from-amber-500 to-amber-600",
      bgColor: "from-amber-500/20 to-amber-600/20",
    },
    {
      label: "المانهوا المميزة",
      value: featured,
      icon: TrendingUp,
      color: "from-accent-500 to-accent-600",
      bgColor: "from-accent-500/20 to-accent-600/20",
    },
  ];

  return (
    <div className="page-transition">
      <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
        مرحباً بك 👋
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
        إليك نظرة عامة على موقعك
      </p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="rounded-xl p-5 transition-all card-hover"
              style={{
                background: "var(--card-bg)",
                border: "1px solid var(--border-color)",
                animation: `slide-up 0.4s ease-out ${i * 0.1}s both`,
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.bgColor}`}>
                  <Icon className={`w-5 h-5 bg-gradient-to-r ${stat.color} bg-clip-text`} style={{ color: "var(--text-primary)" }} />
                </div>
              </div>
              <p className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
                {stat.value}
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {stat.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Recent Series */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)" }}
      >
        <div className="p-5 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-color)" }}>
          <h2 className="font-bold" style={{ color: "var(--text-primary)" }}>
            آخر المانهوا المضافة
          </h2>
          <Link href="/admin/series" className="text-sm text-primary-400 hover:text-primary-300 transition-colors">
            عرض الكل
          </Link>
        </div>
        <div className="divide-y" style={{ borderColor: "var(--border-color)" }}>
          {series.length === 0 ? (
             <div className="p-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>
                لا توجد أعمال مضافة بعد.
             </div>
          ) : (
            series.slice(0, 5).map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between px-5 py-3.5 hover:bg-[var(--card-hover)] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0"
                  style={{ background: "var(--bg-tertiary)" }}
                >
                  <img
                    src={item.cover_image_url || "/placeholder.png"}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    {item.title}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {item.chapters_count || 0} فصل · {formatNumber(item.views_count || 0)} مشاهدة
                  </p>
                </div>
              </div>
              <Link
                href={`/admin/series/${item.id}/edit`}
                className="text-xs text-primary-400 hover:text-primary-300 font-medium transition-colors"
              >
                تعديل
              </Link>
            </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
        <Link
          href="/admin/series/new"
          className="flex items-center gap-4 p-5 rounded-xl transition-all card-hover"
          style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)" }}
        >
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-600/20 flex-shrink-0">
            <BookOpen className="w-6 h-6 text-primary-400" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
              إضافة مانهوا
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              مع صورة الغلاف والتفاصيل
            </p>
          </div>
        </Link>
        <Link
          href="/admin/series"
          className="flex items-center gap-4 p-5 rounded-xl transition-all card-hover"
          style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)" }}
        >
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex-shrink-0">
            <Layers className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
              رفع فصل
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              صور منفردة أو ZIP
            </p>
          </div>
        </Link>
        <Link
          href="/admin/series"
          className="flex items-center gap-4 p-5 rounded-xl transition-all card-hover"
          style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)" }}
        >
          <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 flex-shrink-0">
            <TrendingUp className="w-6 h-6 text-violet-400" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
              إدارة المانهوا
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              تعديل وحذف الأعمال
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
