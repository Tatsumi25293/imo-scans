"use client";

import { useState } from "react";
import { useUserStore } from "@/lib/stores/useUserStore";
import { createClient } from "@/lib/supabase/client";
import { X, Mail, Lock, User as UserIcon, Loader2 } from "lucide-react";

export default function AuthModal() {
  const { isAuthModalOpen, setAuthModalOpen, fetchUser } = useUserStore();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const supabase = createClient();
    
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username || email.split("@")[0],
            }
          }
        });
        if (error) throw error;
      }
      
      await fetchUser();
      setAuthModalOpen(false);
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء المصادقة");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-md overflow-hidden rounded-2xl shadow-2xl border border-[var(--border-color)] animate-in fade-in zoom-in duration-300"
        style={{ background: "var(--card-bg)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-2">
          <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            {isLogin ? "تسجيل الدخول" : "إنشاء حساب"}
          </h2>
          <button 
            onClick={() => setAuthModalOpen(false)}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" style={{ color: "var(--text-secondary)" }} />
          </button>
        </div>
        
        {/* Form Content */}
        <div className="p-6">
          {error && (
            <div className="p-3 mb-4 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                  اسم المستخدم
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required={!isLogin}
                    className="w-full pl-10 pr-4 py-2.5 bg-black/20 border border-[var(--border-color)] rounded-xl outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-white placeholder-gray-500"
                    placeholder="أدخل اسمك"
                    dir="auto"
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                البريد الإلكتروني
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-black/20 border border-[var(--border-color)] rounded-xl outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-white placeholder-gray-500"
                  placeholder="name@example.com"
                  dir="ltr"
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-black/20 border border-[var(--border-color)] rounded-xl outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-white placeholder-gray-500"
                  placeholder="••••••••"
                  dir="ltr"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 font-bold text-white bg-primary-600 hover:bg-primary-500 rounded-xl transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isLogin ? (
                "تسجيل الدخول"
              ) : (
                "الاشتراك"
              )}
            </button>
          </form>

          <div className="my-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border-color)]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2" style={{ background: "var(--card-bg)", color: "var(--text-muted)" }}>
                أو تابع باستخدام
              </span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full py-2.5 bg-white text-black font-bold rounded-xl transition-transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-primary-400 hover:text-primary-300 font-medium transition-colors"
            >
              {isLogin ? "ليس لديك حساب؟ اشترك الآن" : "لديك حساب بالفعل؟ قم بتسجيل الدخول"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
