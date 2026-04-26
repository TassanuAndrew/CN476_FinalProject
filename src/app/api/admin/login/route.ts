import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { ADMIN_COOKIE, signAdminToken } from "@/lib/auth";

export async function POST(req: Request) {
  const { username, password } = await req.json();
  if (!username || !password) {
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
