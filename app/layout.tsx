import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/components/auth/AuthProvider";
import "./globals.css";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://imo-scans.vercel.app";

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
    default: "IMO Scans - اقرأ مانهوا وويبتون مترجمة عربي",
    template: "%s | IMO Scans - مانهوا عربي",
  },
  description:
    "اقرأ أفضل المانهوا والويبتون والمانجا مترجمة إلى العربية مجاناً. تحديثات يومية، ترجمة احترافية عالية الجودة، أكشن، رومانسي، خيال والمزيد. IMO Scans وجهتك الأولى للمانهوا العربية!",
  keywords: [
    "مانهوا", "مانهوا مترجمة", "مانهوا عربي",
    "ويبتون", "ويبتون مترجم", "ويبتون عربي",
    "مانجا", "مانجا مترجمة", "مانجا عربي",
    "مانها", "مانها صينية",
    "قراءة مانهوا", "قراءة مانجا اون لاين",
    "manhwa", "webtoon", "manga", "manhua",
    "manhwa arabic", "webtoon arabic",
    "ترجمة مانهوا", "مانهوا اكشن", "مانهوا رومانسي",
    "imo scans", "ايمو سكانز",
    "أفضل مانهوا", "مانهوا جديدة",
    "فصول مترجمة", "تحديثات يومية",
  ],
  authors: [{ name: "IMO Scans", url: BASE_URL }],
  creator: "IMO Scans",
  publisher: "IMO Scans",
  icons: {
    icon: [
      { url: "/icon.png", sizes: "32x32", type: "image/png" },
      { url: "/icon.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "icon",
        url: "/favicon.ico",
      },
    ],
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
    siteName: "IMO Scans",
    title: "IMO Scans - اقرأ مانهوا وويبتون مترجمة عربي",
    description:
      "اقرأ أفضل المانهوا والويبتون مترجمة إلى العربية مجاناً. تحديثات يومية وترجمة احترافية عالية الجودة.",
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 512,
        alt: "IMO Scans - مانهوا عربي",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "IMO Scans - اقرأ مانهوا وويبتون مترجمة عربي",
    description:
      "اقرأ أفضل المانهوا والويبتون مترجمة إلى العربية مجاناً. تحديثات يومية وترجمة احترافية.",
    images: ["/icon.png"],
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
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
