// Database types for IMO Scans
export interface Genre {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Series {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  author: string | null;
  artist: string | null;
  staff: string | null;
  cover_image_url: string | null;
  banner_image_url: string | null;
  status: "ongoing" | "completed" | "hiatus";
  type: "manhwa" | "manga" | "manhua";
  rating: number;
  views_count: number;
  is_featured: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SeriesWithGenres extends Series {
  genres: Genre[];
  chapters_count?: number;
  latest_chapter?: Chapter;
}

export interface Chapter {
  id: string;
  series_id: string;
  chapter_number: number;
  title: string | null;
  views_count: number;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChapterPage {
  id: string;
  chapter_id: string;
  image_url: string;
  page_number: number;
  width: number | null;
  height: number | null;
  created_at: string;
}

export interface ChapterWithPages extends Chapter {
  pages: ChapterPage[];
  series?: Series;
}

export interface Bookmark {
  id: string;
  user_id: string;
  series_id: string;
  last_read_chapter_id: string | null;
  created_at: string;
}

export interface SiteSetting {
  id: string;
  key: string;
  value: Record<string, unknown>;
  updated_at: string;
}
