import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ATLUS - مانهوا عربي",
    short_name: "ATLUS",
    description:
      "اقرأ أفضل المانهوا والويبتون مترجمة إلى العربية. تحديثات يومية وترجمة احترافية عالية الجودة.",
    start_url: "/",
    display: "standalone",
    background_color: "#0e0e0e",
    theme_color: "#2b7fff",
    dir: "rtl",
    lang: "ar",
    categories: ["entertainment", "books", "comics"],
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
