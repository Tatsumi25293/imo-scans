import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "IMO Scans - مانهوا عربي",
    short_name: "IMO Scans",
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
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
