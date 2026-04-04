import { NextRequest, NextResponse } from "next/server";
import { uploadToVultr } from "@/lib/vultr-storage";
import JSZip from "jszip";

export const runtime = "nodejs";
export const maxDuration = 120; // Allow 2 minutes for large zip files

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const zipFile = formData.get("zip") as File;
    const seriesId = formData.get("seriesId") as string;
    const chapterId = formData.get("chapterId") as string;

    if (!zipFile || !seriesId || !chapterId) {
      return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
    }

    const zipBuffer = Buffer.from(await zipFile.arrayBuffer());
    // @ts-ignore
    const JSZipConstructor = JSZip.default || JSZip;
    const zipInstance = new (JSZipConstructor as any)();
    const zip = await zipInstance.loadAsync(zipBuffer);

    // Sort files naturally (1.jpg, 2.jpg ... 10.jpg)
    const fileEntries = Object.entries(zip.files).filter(([name, unknownFile]) => {
      const file = unknownFile as any;
      return (
        !file.dir &&
        !name.startsWith("__MACOSX") &&
        !name.startsWith(".") &&
        /\.(jpg|jpeg|png|webp|gif)$/i.test(name)
      );
    });

    if (fileEntries.length === 0) {
      return NextResponse.json(
        { error: "لا يوجد صور في ملف ZIP" },
        { status: 400 }
      );
    }

    // Natural sort by filename
    fileEntries.sort(([a], [b]) => {
      const aName = a.split("/").pop() || a;
      const bName = b.split("/").pop() || b;
      return aName.localeCompare(bName, undefined, { numeric: true, sensitivity: "base" });
    });

    const uploadedPages: { page_number: number; image_url: string }[] = [];

    for (let i = 0; i < fileEntries.length; i++) {
      const [name, unknownFile] = fileEntries[i];
      const file = unknownFile as any;
      const ext = name.split(".").pop()?.toLowerCase() || "jpg";
      const contentType =
        ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";

      const buffer = Buffer.from(await file.async("arraybuffer"));
      const key = `chapters/${seriesId}/${chapterId}/page_${i + 1}.${ext}`;
      const url = await uploadToVultr(key, buffer, contentType);

      uploadedPages.push({ page_number: i + 1, image_url: url });
    }

    return NextResponse.json({ pages: uploadedPages, count: uploadedPages.length });
  } catch (err: any) {
    console.error("ZIP upload error:", err);
    return NextResponse.json(
      { error: err.message || "فشل رفع ملف ZIP" },
      { status: 500 }
    );
  }
}
