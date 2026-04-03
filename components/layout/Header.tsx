"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, Menu, X, Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    if (theme === 'dark') setTheme('light');
    else if (theme === 'light') setTheme('system');
    else setTheme('dark');
  };

  const ThemeIcon = () => {
    if (!mounted) return <Moon className="w-5 h-5" />;
    if (theme === 'dark') return <Sun className="w-5 h-5 text-amber-400" />;
    if (theme === 'light') return <Moon className="w-5 h-5 text-slate-700" />;
    return <Monitor className="w-5 h-5 text-primary-500" />;
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'glass-header shadow-md py-2' : 'bg-transparent py-4'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex items-center gap-2 group transition-transform hover:scale-105">
              <div className="relative w-10 h-10 md:w-12 md:h-12 overflow-hidden rounded-lg">
                 <Image src="/logo.png" alt="IMO Scans Logo" fill className="object-contain" priority />
              </div>
              <span className="text-xl font-black tracking-tight hidden lg:block" style={{ color: "var(--text-primary)" }}>
                IMO <span className="text-primary-600">SCANS</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden xl:flex items-center gap-8">
              <Link href="/series" className="text-sm font-semibold hover:text-primary-500 transition-colors" style={{ color: "var(--text-primary)" }}>
                الأعمال
              </Link>
              <Link href="/genres/action" className="text-sm font-semibold hover:text-primary-500 transition-colors" style={{ color: "var(--text-secondary)" }}>
                أكشن
              </Link>
              <Link href="/genres/romance" className="text-sm font-semibold hover:text-primary-500 transition-colors" style={{ color: "var(--text-secondary)" }}>
                رومانسي
              </Link>
            </nav>
          </div>

          {/* Central Desktop Search - Remanga style */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-6 relative group">
             <button type="submit" className="absolute inset-y-0 right-0 pl-3 flex items-center pr-4">
               <Search className="h-4 w-4 transition-colors hover:text-primary-500" style={{ color: "var(--text-muted)" }} />
             </button>
             <input
               type="text"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               placeholder="ابحث عما تريد، سينباي؟"
               className="w-full pl-4 pr-12 py-2 rounded-full text-sm outline-none transition-colors border border-transparent focus:border-primary-600"
               style={{ background: "var(--bg-tertiary)", color: "var(--text-primary)" }}
             />
          </form>

          <div className="flex items-center gap-3">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="md:hidden p-2 rounded-full transition-colors hover:bg-[var(--bg-tertiary)]"
              style={{ color: "var(--text-secondary)" }}
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full transition-colors hover:bg-[var(--bg-tertiary)]"
              title="تغيير المظهر"
              style={{ color: "var(--text-secondary)" }}
            >
              <ThemeIcon />
            </button>

            {/* Login/Register/Admin replaced with nothing for security per user request */}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="xl:hidden p-2 rounded-full transition-colors hover:bg-[var(--bg-tertiary)]"
              style={{ color: "var(--text-secondary)" }}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <form onSubmit={handleSearch} className="md:hidden py-4 border-t" style={{ borderColor: "var(--border-color)", animation: "slide-up 0.2s ease-out" }}>
            <div className="relative">
              <button type="submit" className="absolute inset-y-0 right-0 pl-3 flex items-center pr-3">
                <Search className="h-5 w-5 hover:text-primary-500" style={{ color: "var(--text-muted)" }} />
              </button>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن مانهوا..."
                className="input-premium pl-4 pr-12 w-full rounded-full"
                autoFocus
              />
            </div>
          </form>
        )}
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden glass-panel border-x-0 border-t" style={{ animation: "slide-up 0.3s ease-out" }}>
          <div className="px-4 pt-2 pb-6 space-y-1 shadow-2xl">
            <Link href="/" className="block px-4 py-3 rounded-xl text-base font-bold text-primary-500 bg-primary-500/10">
              الرئيسية
            </Link>
            <Link href="/series" className="block px-4 py-3 rounded-xl text-base font-semibold hover:bg-[var(--card-hover)]" style={{ color: "var(--text-primary)" }}>
              الأعمال
            </Link>
            <Link href="/genres/action" className="block px-4 py-3 rounded-xl text-base font-semibold hover:bg-[var(--card-hover)]" style={{ color: "var(--text-primary)" }}>
              أكشن
            </Link>
            <Link href="/genres/romance" className="block px-4 py-3 rounded-xl text-base font-semibold hover:bg-[var(--card-hover)]" style={{ color: "var(--text-primary)" }}>
              رومانسي
            </Link>
            {/* Admin link removed from mobile menu */}
          </div>
        </div>
      )}
    </header>
  );
}
