"use client";

import { useState } from "react";
import { Lock, User, Eye, EyeOff, ShieldCheck, AlertCircle } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("يرجى ملء جميع الحقول المطلوبة.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Redirection to dashboard using window.location for a full refresh
        // to ensure middleware registers the cookie.
        window.location.href = "/dashboard";
      } else {
        setError(data.error || "فشل تسجيل الدخول. يرجى التحقق من البيانات.");
      }
    } catch (err) {
      setError("حدث خطأ في الاتصال بالخادم. يرجى المحاولة لاحقاً.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0a0a0c] px-4">
      {/* Background blur effects like Apple style */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#ec4899]/15 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl mb-4 shadow-xl">
            <div className="w-12 h-12 relative">
              <Image
                src="/logo-v2.png"
                alt="ATLUS Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            بوابة <span className="text-primary-500">ATLUS</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-2">
            لوحة تحكم إدارة المخزون المحلي للمنتجات
          </p>
        </div>

        {/* Glassmorphism Card */}
        <div className="glass-card p-8 border border-white/5 bg-[#121218]/40 backdrop-blur-2xl shadow-2xl relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent rounded-[20px] pointer-events-none" />
          
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {error && (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs animate-shake">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Username Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 mr-2 block">
                اسم المستخدم
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 right-4 flex items-center text-zinc-500">
                  <User className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  placeholder="أدخل اسم المستخدم"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-4 pr-12 py-3.5 bg-zinc-900/60 border border-white/5 rounded-2xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20 transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 mr-2 block">
                كلمة المرور
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 right-4 flex items-center text-zinc-500">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="أدخل كلمة المرور"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-12 pr-12 py-3.5 bg-zinc-900/60 border border-white/5 rounded-2xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 left-4 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold text-sm shadow-lg shadow-primary-500/10 active:scale-98 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>دخول آمن</span>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <p className="text-xs text-zinc-500">
            ATLUS © 2026. لوحة إدارة المخزون الداخلي محمية ببيانات بيئية.
          </p>
        </div>
      </div>
    </div>
  );
}
