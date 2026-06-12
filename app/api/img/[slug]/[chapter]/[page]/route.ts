import { NextRequest, NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { createClient } from "@/lib/supabase/server";

const BUCKET = process.env.VULTR_BUCKET || "imoscans";

let _s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (_s3Client) return _s3Client;

  if (!process.env.VULTR_ACCESS_KEY || !process.env.VULTR_SECRET_KEY) {
    throw new Error("S3 Credentials are not configured in environment variables.");
  }

  _s3Client = new S3Client({
    region: process.env.VULTR_REGION || "eu-central-2",
    endpoint: process.env.VULTR_ENDPOINT || "https://eu-central-2.storage.jetbackup.com",
    credentials: {
      accessKeyId: process.env.VULTR_ACCESS_KEY,
      secretAccessKey: process.env.VULTR_SECRET_KEY,
    },
    forcePathStyle: true,
  });

  return _s3Client;
}

async function fetchFromS3(s3Key: string): Promise<NextResponse> {
  const client = getS3Client();
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: s3Key });
  const s3Response = await client.send(command);

  if (!s3Response.Body) {
    return new NextResponse("Image body is empty", { status: 404 });
  }

  const arrayBuffer = await s3Response.Body.transformToByteArray();
  const contentType = s3Response.ContentType || "image/jpeg";
  const buffer = Buffer.from(arrayBuffer);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

export const runtime = "nodejs";

/**
 * Route: GET /api/img/[series-slug]/[chapter-number]/[page-number]
 * Example: /api/img/lookism/1/5
 *
 * This route hides the real S3 storage path by looking up the image URL
 * in Supabase using friendly identifiers (slug/chapter/page).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; chapter: string; page: string }> }
) {
  try {
    const { slug, chapter, page } = await params;

    const chapterNum = parseFloat(chapter);
    const pageNum = parseInt(page, 10);

    if (!slug || isNaN(chapterNum) || isNaN(pageNum)) {
      return new NextResponse("Invalid parameters", { status: 400 });
    }

    const supabase = await createClient();

    // 1. Find the series by slug
    const { data: seriesData, error: seriesError } = await supabase
      .from("series")
      .select("id")
      .eq("slug", slug)
      .single();

    if (seriesError || !seriesData) {
      return new NextResponse("Series not found", { status: 404 });
    }

    // 2. Find the chapter by series_id and chapter_number
    const { data: chapterData, error: chapterError } = await supabase
      .from("chapters")
      .select("id")
      .eq("series_id", seriesData.id)
      .eq("chapter_number", chapterNum)
      .single();

    if (chapterError || !chapterData) {
      return new NextResponse("Chapter not found", { status: 404 });
    }

    // 3. Find the page image URL
    const { data: pageData, error: pageError } = await supabase
      .from("chapter_pages")
      .select("image_url")
      .eq("chapter_id", chapterData.id)
      .eq("page_number", pageNum)
      .single();

    if (pageError || !pageData) {
      return new NextResponse("Page not found", { status: 404 });
    }

    const imageUrl = pageData.image_url as string;

    // If the stored URL is already an /api/images/... proxy path, extract the S3 key
    if (imageUrl.startsWith("/api/images/")) {
      const s3Key = imageUrl.replace("/api/images/", "");
      return await fetchFromS3(s3Key);
    }

    // If the stored URL is an absolute JetBackup URL, extract the key
    if (imageUrl.includes("storage.jetbackup.com")) {
      const url = new URL(imageUrl);
      // path is like /imoscans/chapters/... so strip leading /imoscans/
      const s3Key = url.pathname.replace(`/${BUCKET}/`, "");
      return await fetchFromS3(s3Key);
    }

    // If it's an absolute Vultr URL
    if (imageUrl.includes("vultrobjects.com")) {
      const url = new URL(imageUrl);
      let s3Key = url.pathname;
      const bucketPrefix = `/${BUCKET}/`;
      if (s3Key.startsWith(bucketPrefix)) {
        s3Key = s3Key.substring(bucketPrefix.length);
      } else {
        s3Key = s3Key.replace(/^\//, "");
      }
      return await fetchFromS3(s3Key);
    }

    return new NextResponse("Unknown image URL format", { status: 500 });

  } catch (err: any) {
    console.error("Image proxy error:", err);
    if (err.name === "NoSuchKey") {
      return new NextResponse("Image Not Found", { status: 404 });
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
