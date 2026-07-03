import { NextRequest, NextResponse } from "next/server";
import { deleteFromVultr } from "@/lib/vultr-storage";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { key } = await request.json();

    if (!key) {
      return NextResponse.json(
        { error: "المفتاح (key) مفقود" },
        { status: 400 }
      );
    }

    console.log("Deleting key from Vultr:", key);
    await deleteFromVultr(key);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Vultr delete error:", err);
    return NextResponse.json(
      { error: err.message || "فشل حذف الملف" },
      { status: 500 }
    );
  }
}
