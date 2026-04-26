import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  // auto-expire stale BUYNOW orders
  const now = new Date();
  await prisma.order.updateMany({
    where: {
      type: "BUYNOW",
      status: { in: ["PENDING", "ACCEPTED"] },
      expiresAt: { lt: now },
    },
    data: { status: "EXPIRED" },
  });

  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(orders);
}
