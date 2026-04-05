import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/components/auth/AuthProvider";
import "./globals.css";

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-ibm-plex-arabic",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "IMO Scans - مانهوا عربي",
    template: "%s | IMO Scans",
  },
  description:
    "اقرأ أفضل المانهوا والويبتون مترجمة إلى العربية. تحديثات يومية وترجمة احترافية عالية الجودة.",
  keywords: ["مانهوا", "ويبتون", "مانجا", "عربي", "ترجمة", "manhwa", "webtoon"],
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
