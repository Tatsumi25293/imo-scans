"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Upload,
  Settings,
  LogOut,
  Shield,
  ChevronLeft,
  Menu,
  X,
} from "lucide-react";

const ADMIN_PASSWORD = "imoscans2024";

const sidebarLinks = [
  { href: "/admin", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/admin/series", label: "إدارة المانهوا", icon: BookOpen },
  { href: "/admin/series/new", label: "إضافة مانهوا", icon: Upload },
  { href: "/admin/settings", label: "الإعدادات", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const stored = sessionStorage.getItem("admin_auth");
    if (stored === "true") setIsAuthenticated(true);
    setLoading(false);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem("admin_auth", "true");
      setError("");
    } else {
      setError("كلمة المرور غير صحيحة");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("admin_auth");
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div
          className="w-full max-w-sm rounded-2xl p-8 shadow-2xl"
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--border-color)",
            animation: "slide-up 0.5s ease-out",
          }}
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center mx-auto mb-4 shadow-[0_0_15px_rgba(43,127,255,0.4)]">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
              لوحة التحكم
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              أدخل كلمة المرور للوصول
            </p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="كلمة المرور"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-primary-500"
                style={{
                  background: "var(--bg-tertiary)",
                  color: "var(--text-primary)",
                  border: `1px solid ${error ? "#EF4444" : "var(--border-color)"}`,
                }}
                autoFocus
              />
              {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
            </div>
            <button
              type="submit"
              className="w-full btn-primary !py-3"
            >
              تسجيل الدخول
            </button>
          </form>
          <Link href="/" className="block text-center text-sm mt-6 text-primary-400 hover:text-primary-300 transition-colors">
            العودة للموقع
          </Link>
        </div>
      </div>
    );
  }

  // ADMIN LAYOUT
  return (
    <div className="min-h-[calc(100vh-4rem)]" style={{ background: "var(--bg-primary)" }}>
      <div className="max-w-[1600px] mx-auto flex">
        {/* Desktop Sidebar */}
        <aside
          className="hidden lg:flex flex-col w-60 flex-shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto"
          style={{
            background: "var(--bg-secondary)",
            borderLeft: "1px solid var(--border-color)",
          }}
        >
          <div className="p-5 flex-1">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold truncate" style={{ color: "var(--text-primary)" }}>لوحة التحكم</p>
                <p className="text-[11px] truncate" style={{ color: "var(--text-muted)" }}>IMO Scans</p>
              </div>
            </div>

            <nav className="space-y-1">
              {sidebarLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                      isActive ? "bg-primary-600 text-white shadow-[0_0_15px_rgba(43,127,255,0.3)]" : "hover:bg-[var(--card-hover)]"
                    }`}
                    style={!isActive ? { color: "var(--text-secondary)" } : undefined}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="truncate">{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="p-5" style={{ borderTop: "1px solid var(--border-color)" }}>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium w-full hover:bg-red-500/10 text-red-400 transition-colors"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              تسجيل الخروج
            </button>
          </div>
        </aside>

        {/* Mobile Top Bar */}
        <div
          className="lg:hidden fixed top-16 left-0 right-0 z-30 h-12 flex items-center px-4 gap-3"
          style={{
            background: "var(--header-bg)",
            backdropFilter: "blur(16px)",
            borderBottom: "1px solid var(--border-color)",
          }}
        >
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg hover:bg-[var(--card-hover)]">
            <Menu className="w-5 h-5" style={{ color: "var(--text-secondary)" }} />
          </button>
          <span className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
            {sidebarLinks.find((l) => l.href === pathname)?.label || "لوحة التحكم"}
          </span>
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
            <aside
              className="absolute top-0 right-0 w-72 h-full p-5 overflow-y-auto"
              style={{
                background: "var(--bg-secondary)",
                borderLeft: "1px solid var(--border-color)",
                animation: "slide-in-right 0.25s ease-out",
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <span className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>لوحة التحكم</span>
                <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-[var(--card-hover)]">
                  <X className="w-5 h-5" style={{ color: "var(--text-secondary)" }} />
                </button>
              </div>
              <nav className="space-y-1">
                {sidebarLinks.map((link) => {
                  const isActive = pathname === link.href;
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                        isActive ? "bg-primary-600 text-white shadow-[0_0_15px_rgba(43,127,255,0.3)]" : "hover:bg-[var(--card-hover)]"
                      }`}
                      style={!isActive ? { color: "var(--text-secondary)" } : undefined}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="mt-6 pt-4" style={{ borderTop: "1px solid var(--border-color)" }}>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium w-full hover:bg-red-500/10 text-red-400 transition-colors"
                >
                  <LogOut className="w-5 h-5 flex-shrink-0" />
                  تسجيل الخروج
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0 pt-12 lg:pt-0">
          <div className="p-5 sm:p-6 lg:p-8 pb-24 lg:pb-8 max-w-5xl">{children}</div>
        </div>
      </div>
    </div>
  );
}
