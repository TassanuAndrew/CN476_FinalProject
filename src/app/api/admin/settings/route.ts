import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getAdminFromCookies } from "@/lib/auth";

export async function GET() {
  const session = await getAdminFromCookies();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const admin = await prisma.admin.findUnique({ where: { id: session.adminId } });
  if (!admin) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({
    username: admin.username,
    promptpayPhone: admin.promptpayPhone,
    shopName: admin.shopName,
  });
}

export async function PATCH(req: Request) {
  const session = await getAdminFromCookies();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { promptpayPhone, shopName, password } = await req.json();
  const data: Record<string, unknown> = {};
  if (promptpayPhone !== undefined) data.promptpayPhone = promptpayPhone || null;
  if (shopName !== undefined) data.shopName = shopName || "บ้านขนมจีน";
  if (password) data.passwordHash = await bcrypt.hash(password, 10);
  const admin = await prisma.admin.update({ where: { id: session.adminId }, data });
  return NextResponse.json({
    username: admin.username,
    promptpayPhone: admin.promptpayPhone,
    shopName: admin.shopName,
  });
}
