import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("dashboard_session");
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "حدث خطأ ما أثناء تسجيل الخروج" },
      { status: 500 }
    );
  }
}
