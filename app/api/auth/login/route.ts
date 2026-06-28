import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const expectedUsername = process.env.DASHBOARD_USERNAME || "admin";
    const expectedPassword = process.env.DASHBOARD_PASSWORD || "admin123";

    if (username === expectedUsername && password === expectedPassword) {
      const cookieStore = await cookies();
      cookieStore.set("dashboard_session", "authenticated", {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 86400, // 24 hours
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: "اسم المستخدم أو كلمة المرور غير صحيحة" },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "حدث خطأ ما أثناء معالجة الطلب" },
      { status: 500 }
    );
  }
}
