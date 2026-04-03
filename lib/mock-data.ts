import { Series, Genre, Chapter, ChapterPage, SeriesWithGenres, ChapterWithPages } from "@/types/database";

// =============================================
// Mock Genres
// =============================================
export const mockGenres: Genre[] = [
  { id: "g1", name: "أكشن", slug: "action", created_at: new Date().toISOString() },
  { id: "g2", name: "رومانسي", slug: "romance", created_at: new Date().toISOString() },
  { id: "g3", name: "خيال", slug: "fantasy", created_at: new Date().toISOString() },
  { id: "g4", name: "مغامرات", slug: "adventure", created_at: new Date().toISOString() },
  { id: "g5", name: "دراما", slug: "drama", created_at: new Date().toISOString() },
  { id: "g6", name: "كوميدي", slug: "comedy", created_at: new Date().toISOString() },
  { id: "g7", name: "رعب", slug: "horror", created_at: new Date().toISOString() },
  { id: "g8", name: "خارق للطبيعة", slug: "supernatural", created_at: new Date().toISOString() },
  { id: "g9", name: "حياة مدرسية", slug: "school-life", created_at: new Date().toISOString() },
  { id: "g10", name: "فنون قتالية", slug: "martial-arts", created_at: new Date().toISOString() },
];

// =============================================
// Mock Series
// =============================================
export const mockSeries: SeriesWithGenres[] = [
  {
    id: "s1",
    title: "صعود المحارب الأسطوري",
    slug: "rise-of-legendary-warrior",
    description: "في عالم مليء بالوحوش والسحر، يجد البطل نفسه في قاع الترتيب بين الصيادين. لكن بعد حادثة غامضة في زنزانة مظلمة، يحصل على قوة خارقة تغير مصيره إلى الأبد. رحلة ملحمية من القاع إلى القمة!",
    author: "كيم سونغ هو",
    artist: "بارك جونغ",
    cover_image_url: "https://picsum.photos/seed/manhwa1/400/560",
    banner_image_url: "https://picsum.photos/seed/banner1/1200/400",
    status: "ongoing",
    type: "manhwa",
    rating: 9.2,
    views_count: 1500000,
    is_featured: true,
    published_at: "2024-01-15T00:00:00Z",
    created_at: "2024-01-15T00:00:00Z",
    updated_at: new Date().toISOString(),
    genres: [mockGenres[0], mockGenres[2], mockGenres[3]],
    chapters_count: 150,
  },
  {
    id: "s2",
    title: "عودة الساحر الأعظم",
    slug: "return-of-greatest-mage",
    description: "بعد ألف عام من السجن في بُعد آخر، يعود أعظم ساحر عرفه العالم ليجد أن السحر قد اندثر. الآن عليه إعادة بناء قوته من الصفر في عالم تسيطر عليه التكنولوجيا.",
    author: "لي مين هو",
    artist: "تشوي يونغ",
    cover_image_url: "https://picsum.photos/seed/manhwa2/400/560",
    banner_image_url: "https://picsum.photos/seed/banner2/1200/400",
    status: "ongoing",
    type: "manhwa",
    rating: 8.8,
    views_count: 980000,
    is_featured: true,
    published_at: "2024-03-20T00:00:00Z",
    created_at: "2024-03-20T00:00:00Z",
    updated_at: new Date().toISOString(),
    genres: [mockGenres[2], mockGenres[0], mockGenres[7]],
    chapters_count: 95,
  },
  {
    id: "s3",
    title: "قلب من فولاذ",
    slug: "heart-of-steel",
    description: "في مدينة مستقبلية حيث يمتلك الأقوياء كل شيء، شاب يتيم يكتشف قدرة فريدة تجعل جسده صلباً كالفولاذ. لكن هذه القوة تأتي بثمن باهظ قد يكلفه إنسانيته.",
    author: "هوانغ دونغ",
    artist: "هوانغ دونغ",
    cover_image_url: "https://picsum.photos/seed/manhwa3/400/560",
    banner_image_url: "https://picsum.photos/seed/banner3/1200/400",
    status: "ongoing",
    type: "manhwa",
    rating: 8.5,
    views_count: 720000,
    is_featured: false,
    published_at: "2024-05-10T00:00:00Z",
    created_at: "2024-05-10T00:00:00Z",
    updated_at: new Date().toISOString(),
    genres: [mockGenres[0], mockGenres[4], mockGenres[9]],
    chapters_count: 78,
  },
  {
    id: "s4",
    title: "زهرة القمر الأحمر",
    slug: "red-moon-flower",
    description: "أميرة من عائلة نبيلة تُجبر على الزواج من إمبراطور مخيف يُلقب بـ'الوحش'. لكنها تكتشف أن خلف القناع الوحشي يختبئ رجل مكسور يحتاج لمن يفهمه.",
    author: "يون سو يونغ",
    artist: "كيم هانا",
    cover_image_url: "https://picsum.photos/seed/manhwa4/400/560",
    banner_image_url: "https://picsum.photos/seed/banner4/1200/400",
    status: "ongoing",
    type: "manhwa",
    rating: 9.0,
    views_count: 1200000,
    is_featured: true,
    published_at: "2024-02-01T00:00:00Z",
    created_at: "2024-02-01T00:00:00Z",
    updated_at: new Date().toISOString(),
    genres: [mockGenres[1], mockGenres[4], mockGenres[2]],
    chapters_count: 120,
  },
  {
    id: "s5",
    title: "ملك الظلام",
    slug: "king-of-darkness",
    description: "في عالم مقسم بين النور والظلام، يولد طفل يحمل قوى الجانبين. محكوم عليه بالنفي، يبدأ رحلته ليصبح أقوى كائن في الوجود ويوحد العالمين.",
    author: "جانغ تشول",
    artist: "سيو جون",
    cover_image_url: "https://picsum.photos/seed/manhwa5/400/560",
    banner_image_url: "https://picsum.photos/seed/banner5/1200/400",
    status: "completed",
    type: "manhwa",
    rating: 9.5,
    views_count: 2100000,
    is_featured: true,
    published_at: "2023-06-15T00:00:00Z",
    created_at: "2023-06-15T00:00:00Z",
    updated_at: new Date().toISOString(),
    genres: [mockGenres[0], mockGenres[2], mockGenres[7]],
    chapters_count: 200,
  },
  {
    id: "s6",
    title: "حكاية الأرواح التائهة",
    slug: "tale-of-lost-souls",
    description: "فتاة تستطيع رؤية الأرواح تجد نفسها متورطة في حرب قديمة بين عالم الأحياء والأموات. عليها إيجاد طريقة لإنقاذ كلا العالمين قبل فوات الأوان.",
    author: "شين يونا",
    artist: "بارك سولا",
    cover_image_url: "https://picsum.photos/seed/manhwa6/400/560",
    banner_image_url: "https://picsum.photos/seed/banner6/1200/400",
    status: "ongoing",
    type: "manhwa",
    rating: 8.3,
    views_count: 450000,
    is_featured: false,
    published_at: "2024-07-01T00:00:00Z",
    created_at: "2024-07-01T00:00:00Z",
    updated_at: new Date().toISOString(),
    genres: [mockGenres[7], mockGenres[6], mockGenres[4]],
    chapters_count: 45,
  },
  {
    id: "s7",
    title: "أكاديمية السيوف المقدسة",
    slug: "sacred-swords-academy",
    description: "في أكاديمية تدرب أقوى المحاربين، طالب عادي يمتلك سراً خطيراً: إنه ابن أعظم شرير في التاريخ. الآن عليه إثبات أنه مختلف عن والده.",
    author: "كيم تايهو",
    artist: "لي جينسو",
    cover_image_url: "https://picsum.photos/seed/manhwa7/400/560",
    banner_image_url: "https://picsum.photos/seed/banner7/1200/400",
    status: "ongoing",
    type: "manhwa",
    rating: 8.7,
    views_count: 890000,
    is_featured: false,
    published_at: "2024-04-10T00:00:00Z",
    created_at: "2024-04-10T00:00:00Z",
    updated_at: new Date().toISOString(),
    genres: [mockGenres[0], mockGenres[3], mockGenres[8]],
    chapters_count: 88,
  },
  {
    id: "s8",
    title: "الطباخ الشيطاني",
    slug: "demonic-chef",
    description: "طاهٍ موهوب يكتشف أن الطعام الذي يطبخه يمنح قوى خارقة. في عالم تتصارع فيه الممالك، تصبح وصفاته أقوى سلاح على الإطلاق!",
    author: "أو سونغ",
    artist: "هان مينجو",
    cover_image_url: "https://picsum.photos/seed/manhwa8/400/560",
    banner_image_url: "https://picsum.photos/seed/banner8/1200/400",
    status: "ongoing",
    type: "manhwa",
    rating: 8.1,
    views_count: 320000,
    is_featured: false,
    published_at: "2024-08-20T00:00:00Z",
    created_at: "2024-08-20T00:00:00Z",
    updated_at: new Date().toISOString(),
    genres: [mockGenres[5], mockGenres[2], mockGenres[3]],
    chapters_count: 35,
  },
];

// =============================================
// Mock Chapters Generator
// =============================================
export function generateMockChapters(seriesId: string, count: number): Chapter[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `ch-${seriesId}-${i + 1}`,
    series_id: seriesId,
    chapter_number: i + 1,
    title: i === 0 ? "البداية" : null,
    views_count: Math.floor(Math.random() * 50000) + 1000,
    is_published: true,
    published_at: new Date(Date.now() - (count - i) * 7 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - (count - i) * 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - (count - i) * 7 * 24 * 60 * 60 * 1000).toISOString(),
  }));
}

// =============================================
// Mock Chapter Pages Generator
// =============================================
export function generateMockPages(chapterId: string, count: number = 15): ChapterPage[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `page-${chapterId}-${i + 1}`,
    chapter_id: chapterId,
    image_url: `https://picsum.photos/seed/${chapterId}-p${i + 1}/800/1200`,
    page_number: i + 1,
    width: 800,
    height: 1200,
    created_at: new Date().toISOString(),
  }));
}

// =============================================
// Helper functions to get mock data
// =============================================
export function getSeriesBySlug(slug: string): SeriesWithGenres | undefined {
  return mockSeries.find((s) => s.slug === slug);
}

export function getFeaturedSeries(): SeriesWithGenres[] {
  return mockSeries.filter((s) => s.is_featured);
}

export function getSeriesByGenre(genreSlug: string): SeriesWithGenres[] {
  return mockSeries.filter((s) => s.genres.some((g) => g.slug === genreSlug));
}

export function getLatestUpdated(): SeriesWithGenres[] {
  return [...mockSeries].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );
}

export function getPopularSeries(): SeriesWithGenres[] {
  return [...mockSeries].sort((a, b) => b.views_count - a.views_count);
}

export function getChapterWithPages(
  seriesSlug: string,
  chapterNum: number
): ChapterWithPages | undefined {
  const series = getSeriesBySlug(seriesSlug);
  if (!series) return undefined;

  const chapters = generateMockChapters(series.id, series.chapters_count || 10);
  const chapter = chapters.find((c) => c.chapter_number === chapterNum);
  if (!chapter) return undefined;

  return {
    ...chapter,
    pages: generateMockPages(chapter.id),
    series,
  };
}

export function searchSeries(query: string): SeriesWithGenres[] {
  const q = query.toLowerCase();
  return mockSeries.filter(
    (s) =>
      s.title.toLowerCase().includes(q) ||
      s.description?.toLowerCase().includes(q) ||
      s.author?.toLowerCase().includes(q)
  );
}
