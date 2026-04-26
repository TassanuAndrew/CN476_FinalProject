import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id: Number(id) },
    include: { items: true },
  });
  if (!order) return NextResponse.json({ error: "not found" }, { status: 404 });

  // auto-expire BUYNOW orders after 1h if still pending/accepted
  if (
    order.type === "BUYNOW" &&
    (order.status === "PENDING" || order.status === "ACCEPTED") &&
    order.expiresAt &&
    new Date() > order.expiresAt
  ) {
    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { status: "EXPIRED" },
      include: { items: true },
    });
    return NextResponse.json(updated);
  }

  return NextResponse.json(order);
}
