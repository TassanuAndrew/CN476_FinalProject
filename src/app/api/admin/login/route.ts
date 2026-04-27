import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { ADMIN_COOKIE, signAdminToken } from "@/lib/auth";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  // Brute-force protection: 5 attempts / 5 minutes per IP.
  const rl = rateLimit(`login:${ip}`, 5, 5 * 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "พยายามเข้าสู่ระบบบ่อยเกินไป กรุณารอสักครู่" },
      { status: 429 }
    );
  }

  const { username, password } = await req.json().catch(() => ({}));
  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    !username ||
    !password ||
    username.length > 60 ||
    password.length > 200
  ) {
    return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 });
  }

  const admin = await prisma.admin.findUnique({ where: { username } });
  if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
    return NextResponse.json({ error: "ชื่อหรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 });
  }

  const token = await signAdminToken(admin.id);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
