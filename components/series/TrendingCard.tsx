import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";

interface TrendingCardProps {
  series: any;
}

export function TrendingCard({ series }: TrendingCardProps) {
  return (
    <Link
      href={`/series/${series.slug}`}
      className="group relative aspect-[3/4] w-full rounded-[32px] overflow-hidden block shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.7)] transition-all duration-300 hover:translate-y-[-4px]"
    >
      {/* Cover Background Image */}
      <Image
        src={series.cover_image_url || "/placeholder.png"}
        alt={series.title}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        priority
      />

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/5 transition-opacity duration-300 group-hover:via-black/55" />

      {/* Top Left Badge (Type) */}
      <div className="absolute top-4 left-4 z-10 px-3.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-white border border-white/10">
        {series.type === "manhwa" ? "مانهوا" : series.type === "manga" ? "مانجا" : "مانها"}
      </div>

      {/* Center/Bottom Content */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-5 flex flex-col items-center text-center">
        {/* Trending Badge */}
        <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-[#ff9f1c] text-black text-[10px] font-black uppercase mb-2 shadow-md animate-pulse">
          <span>🔥 رائج</span>
        </div>

        {/* Title */}
        <h3 className="text-white text-base sm:text-lg lg:text-xl font-black mb-3 line-clamp-2 leading-tight drop-shadow-md text-glow">
          {series.title}
        </h3>

        {/* Genres List */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 w-full">
          {series.genres?.slice(0, 3).map((g: any) => (
            <span
              key={g.id}
              className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-bold text-gray-200 border border-white/5"
            >
              {g.name}
            </span>
          ))}
          {(!series.genres || series.genres.length === 0) && (
            <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-bold text-gray-200 border border-white/5">
              أخرى
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
