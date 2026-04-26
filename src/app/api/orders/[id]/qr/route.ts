import { NextResponse } from "next/server";
import generatePayload from "promptpay-qr";
import QRCode from "qrcode";
import { prisma } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id: Number(id) } });
  if (!order) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (order.type !== "BUYNOW" || order.status !== "ACCEPTED") {
    return NextResponse.json({ error: "ยังไม่ถึงขั้นชำระเงิน" }, { status: 400 });
  }

  const admin = await prisma.admin.findFirst();
  if (!admin?.promptpayPhone) {
    return NextResponse.json(
      { error: "ยังไม่ได้ตั้งค่า PromptPay" },
      { status: 500 }
    );
  }

  const payload = generatePayload(admin.promptpayPhone, { amount: order.totalPrice });
  const dataUrl = await QRCode.toDataURL(payload, { width: 400, margin: 2 });
  return NextResponse.json({
    qr: dataUrl,
    amount: order.totalPrice,
    promptpay: admin.promptpayPhone,
    shopName: admin.shopName,
  });
}
