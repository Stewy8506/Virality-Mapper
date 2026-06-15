import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { encrypt } from "@/lib/crypto";

export async function POST(req: Request) {
  try {
    const { apiKeys } = await req.json();
    if (!apiKeys) {
      return NextResponse.json({ error: "Missing apiKeys" }, { status: 400 });
    }

    const encrypted = encrypt(JSON.stringify(apiKeys));
    const cookieStore = await cookies();
    cookieStore.set("vm_session", encrypted, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.set("vm_session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 0,
    });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
