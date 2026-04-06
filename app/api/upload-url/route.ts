import { NextRequest, NextResponse } from "next/server";
import { generateVultrPresignedUrl } from "@/lib/vultr-storage";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { fileName, folder, contentType } = await request.json();

    if (!fileName || !contentType) {
      return NextResponse.json(
        { error: "ملف أو نوع الملف مفقود" },
        { status: 400 }
      );
    }

    const key = `${folder || "chapters"}/${fileName}`;
    const uploadUrl = await generateVultrPresignedUrl(key, contentType);
    
    const CDN_URL = process.env.NEXT_PUBLIC_VULTR_CDN_URL || "https://imo-scans.ams1.vultrobjects.com";
    const publicUrl = `${CDN_URL}/${key}`;

    return NextResponse.json({ uploadUrl, publicUrl, key });
  } catch (err: any) {
    console.error("Presigned URL generation error:", err);
    return NextResponse.json(
      { error: err.message || "فشل توليد رابط الرفع" },
      { status: 500 }
    );
  }
}
