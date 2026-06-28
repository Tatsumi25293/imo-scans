import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://atlus.vercel.app";

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-ibm-plex-arabic",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0e0e0e" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "ATLUS - اقرأ مانجا ومانهوا مترجمة عربي",
    template: "%s | ATLUS",
  },
  description:
    "اقرأ أفضل المانجا والمانهوا مترجمة إلى العربية مجاناً. تحديثات يومية، ترجمة احترافية عالية الجودة. ATLUS وجهتك الأولى لقراءة المانجا والمانهوا العربية!",
  keywords: [
    "مانهوا", "مانهوا مترجمة", "مانهوا عربي",
    "ويبتون", "ويبتون مترجم", "ويبتون عربي",
    "مانجا", "مانجا مترجمة", "مانجا عربي",
    "مانها", "مانها صينية",
    "قراءة مانهوا", "قراءة مانجا اون لاين",
    "manhwa", "webtoon", "manga", "manhua",
    "manhwa arabic", "webtoon arabic",
    "ترجمة مانهوا", "مانهوا اكشن", "مانهوا رومانسي",
    "ATLUS",
    "أفضل مانهوا", "مانهوا جديدة",
    "فصول مترجمة", "تحديثات يومية",
  ],
  authors: [{ name: "ATLUS", url: BASE_URL }],
  creator: "ATLUS",
  publisher: "ATLUS",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", sizes: "32x32", type: "image/png" },
      { url: "/icon.png", sizes: "192x192", type: "image/png" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "ar_AR",
    url: BASE_URL,
    siteName: "ATLUS",
    title: "ATLUS - اقرأ مانجا ومانهوا مترجمة عربي",
    description:
      "اقرأ أفضل المانجا والمانهوا مترجمة إلى العربية مجاناً. تحديثات يومية وترجمة احترافية عالية الجودة.",
    images: [
      {
        url: `${BASE_URL}/opengraph-image.png`,
        width: 1200,
        height: 630,
        alt: "ATLUS - اقرأ مانجا ومانهوا مترجمة عربي",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ATLUS - اقرأ مانجا ومانهوا مترجمة عربي",
    description:
      "اقرأ أفضل المانجا والمانهوا مترجمة إلى العربية مجاناً. تحديثات يومية وترجمة احترافية.",
    images: [`${BASE_URL}/opengraph-image.png`],
  },
  alternates: {
    canonical: BASE_URL,
  },
  category: "entertainment",
  other: {
    "google-site-verification": process.env.GOOGLE_SITE_VERIFICATION || "",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${ibmPlexArabic.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col antialiased">
        <ThemeProvider>
          <AuthProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <Analytics />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
