"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, Menu, X, Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";

// Discord Icon SVG
function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.042.033.056A19.9 19.9 0 0 0 6.136 20.5a.077.077 0 0 0 .084-.028c.462-.63.874-1.295 1.227-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  );
}

const DISCORD_URL = "https://discord.gg/gtvxDXmvsG";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDiscordBanner, setShowDiscordBanner] = useState(true);
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
    // Check if user dismissed the banner
    const dismissed = sessionStorage.getItem("discord-banner-dismissed");
    if (dismissed) setShowDiscordBanner(false);

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const dismissBanner = () => {
    setShowDiscordBanner(false);
    sessionStorage.setItem("discord-banner-dismissed", "true");
  };

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
    <>
      {/* ============================================= */}
      {/* Discord Announcement Banner */}
      {/* ============================================= */}
      {showDiscordBanner && (
        <div
          className="relative z-50 flex items-center justify-center gap-3 px-4 py-2.5 text-sm font-semibold text-white"
          style={{
            background: "linear-gradient(90deg, #5865F2, #7289da, #5865F2)",
            backgroundSize: "200% 100%",
            animation: "discord-slide 3s linear infinite",
          }}
        >
          <style>{`
            @keyframes discord-slide {
              0% { background-position: 0% 0%; }
              100% { background-position: 200% 0%; }
            }
            @keyframes pulse-dot {
              0%, 100% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.6; transform: scale(1.3); }
            }
          `}</style>

          {/* Pulse dot */}
          <span
            className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0"
            style={{ animation: "pulse-dot 1.5s ease-in-out infinite" }}
          />

          <DiscordIcon className="w-5 h-5 flex-shrink-0" />

          <a
            href={DISCORD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline flex items-center gap-2"
          >
            <span className="hidden sm:inline">انضم لسيرفرنا على ديسكورد واحصل على إشعارات أحدث الفصول!</span>
            <span className="sm:hidden">انضم للديسكورد 🔔</span>
            <span className="bg-white/20 hover:bg-white/30 transition-colors px-3 py-0.5 rounded-full text-xs font-bold border border-white/30">
              انضم الآن
            </span>
          </a>

          {/* Dismiss button */}
          <button
            onClick={dismissBanner}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/20 transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ============================================= */}
      {/* Main Header */}
      {/* ============================================= */}
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
                {/* Discord button in nav */}
                <a
                  href={DISCORD_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm font-semibold transition-colors hover:opacity-80"
                  style={{ color: "#7289da" }}
                  title="سيرفر الديسكورد"
                >
                  <DiscordIcon className="w-4 h-4" />
                  <span>ديسكورد</span>
                </a>
              </nav>
            </div>

            {/* Central Desktop Search */}
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
              {/* Discord icon button (mobile) */}
              <a
                href={DISCORD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full transition-colors hover:bg-[var(--bg-tertiary)]"
                style={{ color: "#7289da" }}
                title="سيرفر الديسكورد"
              >
                <DiscordIcon className="w-5 h-5" />
              </a>

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
              {/* Discord in mobile menu */}
              <a
                href={DISCORD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold transition-colors hover:bg-[var(--card-hover)]"
                style={{ color: "#7289da" }}
              >
                <DiscordIcon className="w-5 h-5" />
                انضم لسيرفر الديسكورد 🔔
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
}


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
