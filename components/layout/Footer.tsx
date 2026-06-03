import Link from "next/link";
import { BookOpen, Heart } from "lucide-react";
import { mockGenres } from "@/lib/mock-data";

export function Footer() {
  return (
    <footer
      className="mt-auto pb-16 md:pb-0"
      style={{
        background: "var(--bg-secondary)",
        borderTop: "1px solid var(--border-color)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient">IMO Scans</span>
            </Link>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              وجهتك الأولى لقراءة أفضل المانجا والمانهوا والويبتون مترجمة إلى العربية بجودة عالية.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              روابط سريعة
            </h3>
            <ul className="space-y-2">
              {[
                { href: "/", label: "الرئيسية" },
                { href: "/series", label: "جميع الأعمال" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-primary-400 transition-colors"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Genres */}
          <div>
            <h3 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              التصنيفات
            </h3>
            <ul className="space-y-2">
              {mockGenres.slice(0, 6).map((genre) => (
                <li key={genre.id}>
                  <Link
                    href={`/genres/${genre.slug}`}
                    className="text-sm hover:text-primary-400 transition-colors"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {genre.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              عن الموقع
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              نقدم أفضل الترجمات العربية للمانجا والمانهوا والويبتون بتحديثات مستمرة.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className="mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: "1px solid var(--border-color)" }}
        >
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            © 2024 IMO Scans. جميع الحقوق محفوظة.
          </p>
          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            اللهم صل وسلم على نبينا محمد
          </p>
          <p className="text-sm flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
            صُنع بـ <Heart className="w-4 h-4 text-accent-500 fill-accent-500" /> للمجتمع العربي
          </p>
        </div>
      </div>
    </footer>
  );
}
