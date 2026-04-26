import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendPushToAdmins } from "@/lib/push";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const orderId = Number(id);
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return NextResponse.json({ error: "ไม่พบออเดอร์" }, { status: 404 });
  if (order.status !== "ACCEPTED") {
    return NextResponse.json({ error: "ออเดอร์ยังไม่ถึงขั้นรับเงิน" }, { status: 400 });
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status: "PAID", paidAt: new Date() },
    include: { items: true },
  });

  await sendPushToAdmins({
    title: "💰 เงินเข้าแล้ว!",
    body: `ออเดอร์ #${orderId} ${updated.totalPrice}฿`,
    url: "/admin",
    sound: true,
    tag: `paid-${orderId}`,
  });

  return NextResponse.json(updated);
}
