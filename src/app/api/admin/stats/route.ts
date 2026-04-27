import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Aggregated sales numbers for the admin dashboard.
// Counts only PAID orders (revenue actually received).
// "Today" uses server time — Vercel functions in syd1, so this is GMT+10.
// For Thailand display we recompute the day boundary in Asia/Bangkok via a
// trick: Bangkok is GMT+7, so subtract 7h from now() to get a "Bangkok now"
// then floor to midnight in UTC.
function bangkokDayStart(d: Date): Date {
  const bangkokNow = new Date(d.getTime() + 7 * 60 * 60 * 1000);
  bangkokNow.setUTCHours(0, 0, 0, 0);
  // shift back to UTC equivalent of Bangkok midnight
  return new Date(bangkokNow.getTime() - 7 * 60 * 60 * 1000);
}

export async function GET() {
  const now = new Date();
  const todayStart = bangkokDayStart(now);
  const monthStart = new Date(todayStart);
  monthStart.setUTCDate(1);

  const [
    todayAgg,
    monthAgg,
    pendingCount,
    acceptedCount,
    topItems,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: { status: "PAID", paidAt: { gte: todayStart } },
      _sum: { totalPrice: true },
      _count: { _all: true },
    }),
    prisma.order.aggregate({
      where: { status: "PAID", paidAt: { gte: monthStart } },
      _sum: { totalPrice: true },
      _count: { _all: true },
    }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "ACCEPTED" } }),
    prisma.orderItem.groupBy({
      by: ["productName"],
      where: { order: { status: "PAID", paidAt: { gte: monthStart } } },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
  ]);

  return NextResponse.json({
    today: {
      revenue: todayAgg._sum.totalPrice || 0,
      orders: todayAgg._count._all,
    },
    month: {
      revenue: monthAgg._sum.totalPrice || 0,
      orders: monthAgg._count._all,
    },
    pending: pendingCount,
    accepted: acceptedCount,
    topItems: topItems.map((t) => ({
      name: t.productName,
      qty: t._sum.quantity || 0,
    })),
  });
}
