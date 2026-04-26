import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const orderId = Number(id);

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return NextResponse.json({ error: "ไม่พบออเดอร์" }, { status: 404 });
  if (order.status !== "PENDING") {
    return NextResponse.json({ error: "ออเดอร์นี้ไม่ใช่สถานะรอรับ" }, { status: 400 });
  }

  // For BUYNOW: deduct stock and set 1h expiry on payment
  if (order.type === "BUYNOW") {
    for (const item of order.items) {
      const p = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!p || p.stock < item.quantity) {
        return NextResponse.json(
          { error: `สต็อกไม่พอ: ${item.productName}` },
          { status: 400 }
        );
      }
    }
    await prisma.$transaction(
      order.items.map((i) =>
        prisma.product.update({
          where: { id: i.productId },
          data: { stock: { decrement: i.quantity } },
        })
      )
    );
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "ACCEPTED",
      acceptedAt: new Date(),
      expiresAt:
        order.type === "BUYNOW" ? new Date(Date.now() + 60 * 60 * 1000) : null,
    },
    include: { items: true },
  });

  return NextResponse.json(updated);
}
