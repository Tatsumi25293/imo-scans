import { NextRequest, NextResponse } from "next/server";
import { uploadToVultr } from "@/lib/vultr-storage";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "covers";
    const fileName = (formData.get("fileName") as string) || `${Date.now()}-${file.name}`;

    if (!file) {
      return NextResponse.json({ error: "لم يتم إرسال ملف" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const key = `${folder}/${fileName}`;
    const url = await uploadToVultr(key, buffer, file.type || "image/jpeg");

    return NextResponse.json({ url, key });
  } catch (err: any) {
    console.error("Vultr upload error:", err);
    return NextResponse.json(
      { error: err.message || "فشل الرفع" },
      { status: 500 }
    );
  }
}
