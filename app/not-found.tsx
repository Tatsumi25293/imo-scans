import Link from "next/link";
import { Home, Search, BookOpen } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "الصفحة غير موجودة - 404",
  description: "عذراً، الصفحة التي تبحث عنها غير موجودة. تصفح مكتبتنا من المانهوا والويبتون المترجمة.",
};

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 page-transition">
      <div className="text-center max-w-lg">
        {/* Animated 404 */}
        <div className="relative mb-8">
          <h1
            className="text-[120px] md:text-[160px] font-black leading-none"
            style={{
              background: "linear-gradient(135deg, var(--color-primary-500), var(--color-accent-500))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              opacity: 0.15,
            }}
          >
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-primary-500/10 flex items-center justify-center border border-primary-500/20 backdrop-blur-sm">
              <BookOpen className="w-10 h-10 text-primary-500" />
            </div>
          </div>
        </div>

        <h2
          className="text-2xl md:text-3xl font-bold mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          الصفحة غير موجودة!
        </h2>
        <p
          className="text-base mb-8 leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          يبدو أن هذه الصفحة قد اختفت كبطل في بُعد آخر.
          <br />
          لا تقلق، يمكنك العودة للصفحة الرئيسية أو البحث عن مانهوا أخرى.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/" className="btn-primary !px-8 !py-3">
            <Home className="w-4 h-4" />
            الصفحة الرئيسية
          </Link>
          <Link href="/series" className="btn-secondary !px-8 !py-3">
            <Search className="w-4 h-4" />
            تصفح المانهوا
          </Link>
        </div>
      </div>
    </div>
  );
}
