const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://imo-scans.vercel.app";

// ============================================
// Website Schema - للصفحة الرئيسية
// يفعّل مربع بحث الموقع في نتائج Google
// ============================================
export function WebsiteJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "IMO Scans",
    alternateName: "ايمو سكانز",
    url: BASE_URL,
    description:
      "اقرأ أفضل المانهوا والويبتون مترجمة إلى العربية. تحديثات يومية وترجمة احترافية عالية الجودة.",
    inLanguage: "ar",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ============================================
// Organization Schema - لعلامة الموقع التجارية
// ============================================
export function OrganizationJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "IMO Scans",
    alternateName: "ايمو سكانز",
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    description:
      "فريق ترجمة مانهوا وويبتون عربي. نقدم أفضل الترجمات العربية بجودة عالية وتحديثات يومية.",
    sameAs: [],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ============================================
// Comic Series Schema - لكل سلسلة مانهوا
// ============================================
interface SeriesJsonLdProps {
  title: string;
  slug: string;
  description?: string | null;
  author?: string | null;
  artist?: string | null;
  coverImage?: string | null;
  rating?: number;
  status?: string;
  type?: string;
  genres?: { name: string }[];
  chaptersCount?: number;
  datePublished?: string;
  dateModified?: string;
}

export function SeriesJsonLd({
  title,
  slug,
  description,
  author,
  artist,
  coverImage,
  rating,
  status,
  type,
  genres,
  chaptersCount,
  datePublished,
  dateModified,
}: SeriesJsonLdProps) {
  const statusMap: Record<string, string> = {
    ongoing: "https://schema.org/InProgress",
    completed: "https://schema.org/Complete",
    hiatus: "https://schema.org/Suspended",
  };

  const typeMap: Record<string, string> = {
    manhwa: "مانهوا كورية",
    manga: "مانجا يابانية",
    manhua: "مانها صينية",
  };

  const schema: any = {
    "@context": "https://schema.org",
    "@type": "ComicSeries",
    name: title,
    url: `${BASE_URL}/series/${slug}`,
    description: description || `اقرأ ${title} مترجمة إلى العربية على IMO Scans`,
    inLanguage: "ar",
    genre: genres?.map((g) => g.name) || [],
    publisher: {
      "@type": "Organization",
      name: "IMO Scans",
      url: BASE_URL,
    },
  };

  if (coverImage) {
    schema.image = coverImage;
    schema.thumbnailUrl = coverImage;
  }

  if (author) {
    schema.author = { "@type": "Person", name: author };
  }

  if (artist) {
    schema.illustrator = { "@type": "Person", name: artist };
  }

  if (rating && rating > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: rating,
      bestRating: 10,
      worstRating: 0,
      ratingCount: Math.max(1, Math.floor(rating * 10)),
    };
  }

  if (status && statusMap[status]) {
    schema.creativeWorkStatus = statusMap[status];
  }

  if (type && typeMap[type]) {
    schema.alternateName = `${title} - ${typeMap[type]}`;
  }

  if (chaptersCount) {
    schema.numberOfEpisodes = chaptersCount;
  }

  if (datePublished) {
    schema.datePublished = datePublished;
  }

  if (dateModified) {
    schema.dateModified = dateModified;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ============================================
// Breadcrumb Schema - للمسار التنقلي
// ============================================
interface BreadcrumbItem {
  name: string;
  href: string;
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.href.startsWith("http") ? item.href : `${BASE_URL}${item.href}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ============================================
// Collection Page Schema - لصفحات التصنيف
// ============================================
interface CollectionJsonLdProps {
  name: string;
  description: string;
  url: string;
  numberOfItems?: number;
}

export function CollectionJsonLd({
  name,
  description,
  url,
  numberOfItems,
}: CollectionJsonLdProps) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: url.startsWith("http") ? url : `${BASE_URL}${url}`,
    inLanguage: "ar",
    isPartOf: {
      "@type": "WebSite",
      name: "IMO Scans",
      url: BASE_URL,
    },
  };

  if (numberOfItems) {
    schema.mainEntity = {
      "@type": "ItemList",
      numberOfItems,
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ============================================
// Chapter Schema - لكل فصل
// ============================================
interface ChapterJsonLdProps {
  seriesTitle: string;
  seriesSlug: string;
  chapterNumber: number;
  totalPages?: number;
  datePublished?: string;
}

export function ChapterJsonLd({
  seriesTitle,
  seriesSlug,
  chapterNumber,
  totalPages,
  datePublished,
}: ChapterJsonLdProps) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Chapter",
    name: `الفصل ${chapterNumber} - ${seriesTitle}`,
    url: `${BASE_URL}/series/${seriesSlug}/${chapterNumber}`,
    isPartOf: {
      "@type": "ComicSeries",
      name: seriesTitle,
      url: `${BASE_URL}/series/${seriesSlug}`,
    },
    position: chapterNumber,
    inLanguage: "ar",
  };

  if (totalPages) {
    schema.pagination = `${totalPages} صفحة`;
  }

  if (datePublished) {
    schema.datePublished = datePublished;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
