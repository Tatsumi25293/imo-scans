import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";

interface SeriesCardProps {
  series: any;
  variant?: "default" | "wide";
}

export function SeriesCard({ series, variant = "default" }: SeriesCardProps) {
  if (variant === "wide") {
    // Remanga Horizontal Card style
    return (
      <Link
        href={`/series/${series.slug}`}
        className="group relative flex gap-3 p-3 rounded-2xl transition-colors hover:bg-[var(--card-hover)]"
        style={{ background: "var(--bg-tertiary)" }}
      >
        <div className="relative w-20 sm:w-24 shrink-0 aspect-[3/4] rounded-xl overflow-hidden">
          <Image
            src={series.cover_image_url || "/placeholder.png"}
            alt={series.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="96px"
          />
        </div>
        <div className="flex flex-col justify-center min-w-0 flex-1">
          <h3 className="font-bold text-[14px] sm:text-[15px] mb-1 line-clamp-2 group-hover:text-primary-500 transition-colors" style={{ color: "var(--text-primary)" }}>
            {series.title}
          </h3>
          <div className="flex items-center gap-1.5 text-xs mb-2" style={{ color: "var(--text-secondary)" }}>
             <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-bold text-amber-50">{series.rating}</span>
             </span>
             <span>•</span>
             <span className="line-clamp-1">{series.genres?.[0]?.name || "تصنيف"}</span>
          </div>
          {series.chapters_count && (
            <div className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              {series.chapters_count} فصول
            </div>
          )}
        </div>
      </Link>
    );
  }

  // Remanga Main Grid Card style
  return (
    <Link href={`/series/${series.slug}`} className="group flex flex-col h-full card-hover block">
      <div className="relative aspect-[3/4] w-full mb-2.5 rounded-2xl overflow-hidden bg-[var(--bg-secondary)] border border-[var(--border-color)]">
        <Image
          src={series.cover_image_url || "/placeholder.png"}
          alt={series.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />
        
        {/* Remanga Rating Pill */}
        <div className="badge-rating">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span>{series.rating}</span>
        </div>
        
        {/* Status Badge Top Left */}
        {series.status && (
           <div className={`absolute top-0 left-0 px-2 py-1 bg-black/60 backdrop-blur-md rounded-br-xl text-[10px] font-bold text-white`}>
              {series.status === 'ongoing' ? 'مستمر' : series.status === 'completed' ? 'مكتمل' : 'متوقف'}
           </div>
        )}
      </div>

      <div className="flex flex-col flex-1 px-1">
        <div className="text-[11px] font-medium mb-1 line-clamp-1" style={{ color: "var(--text-muted)" }}>
           {series.genres?.[0]?.name ? `${series.genres[0].name} ${new Date(series.created_at).getFullYear() || ''}` : "مانهوا"}
        </div>
        <h3 className="font-bold text-[13px] sm:text-[14px] line-clamp-2 leading-snug group-hover:text-primary-500 transition-colors" style={{ color: "var(--text-primary)" }}>
          {series.title}
        </h3>
      </div>
    </Link>
  );
}
