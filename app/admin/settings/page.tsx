"use client";

import { useState } from "react";
import { Save, Globe, Palette, Database } from "lucide-react";

export default function AdminSettingsPage() {
  const [siteName, setSiteName] = useState("IMO Scans");
  const [siteDescription, setSiteDescription] = useState(
    "اقرأ أفضل المانجا والمانهوا مترجمة إلى العربية"
  );
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const inputStyle = {
    background: "var(--bg-tertiary)",
    color: "var(--text-primary)",
    border: "1px solid var(--border-color)",
  };

  return (
    <div className="page-transition max-w-3xl">
      <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
        الإعدادات
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
        إعدادات الموقع العامة
      </p>

      <div className="space-y-6">
        {/* General */}
        <div
          className="rounded-xl p-5 space-y-4"
          style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-5 h-5 text-primary-400" />
            <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>
              عام
            </h2>
          </div>
          <div>
            <label className="text-sm mb-1.5 block" style={{ color: "var(--text-secondary)" }}>
              اسم الموقع
            </label>
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="text-sm mb-1.5 block" style={{ color: "var(--text-secondary)" }}>
              وصف الموقع
            </label>
            <textarea
              value={siteDescription}
              onChange={(e) => setSiteDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Supabase */}
        <div
          className="rounded-xl p-5 space-y-4"
          style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>
              قاعدة البيانات (Supabase)
            </h2>
          </div>
          <div className="rounded-xl p-4" style={{ background: "var(--bg-tertiary)" }}>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              حالة الاتصال:{" "}
              <span className="text-amber-400 font-medium">وضع تجريبي (Mock Data)</span>
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              لربط الموقع بـ Supabase، أضف بيانات الاتصال في ملف .env.local
            </p>
          </div>
        </div>

        {/* Theme */}
        <div
          className="rounded-xl p-5"
          style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Palette className="w-5 h-5 text-accent-400" />
            <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>
              المظهر
            </h2>
          </div>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            الموقع يدعم الوضع الليلي والنهاري تلقائياً. يمكن للمستخدمين التبديل من الشريط العلوي.
          </p>
        </div>

        {/* Save */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-lg ${
              saved
                ? "bg-emerald-500"
                : "bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
            }`}
          >
            <Save className="w-4 h-4" />
            {saved ? "تم الحفظ ✓" : "حفظ الإعدادات"}
          </button>
        </div>
      </div>
    </div>
  );
}
