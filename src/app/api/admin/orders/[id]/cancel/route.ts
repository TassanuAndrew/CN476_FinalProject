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

  // refund stock if was already accepted (BUYNOW)
  if (order.type === "BUYNOW" && order.status === "ACCEPTED") {
    await prisma.$transaction(
      order.items.map((i) =>
        prisma.product.update({
          where: { id: i.productId },
          data: { stock: { increment: i.quantity } },
        })
      )
    );
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status: "CANCELLED" },
    include: { items: true },
  });
  return NextResponse.json(updated);
}
