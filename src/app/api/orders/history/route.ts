import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cleanPhone, ValidationError } from "@/lib/validation";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

// GET /api/orders/history?phone=08xxxxxxxx
// Returns the most recent orders matching the phone number.
// Rate-limited to discourage scraping; phone is required.
export async function GET(req: Request) {
  try {
    const ip = getClientIp(req);
    const rl = rateLimit(`history:${ip}`, 20, 60_000);
    if (!rl.ok) {
      return NextResponse.json(
        { error: "ค้นหาบ่อยเกินไป กรุณารอสักครู่" },
        { status: 429 }
      );
    }

    const url = new URL(req.url);
    const phone = cleanPhone(url.searchParams.get("phone"));
    if (!phone) {
      return NextResponse.json({ error: "กรุณากรอกเบอร์" }, { status: 400 });
    }

    const orders = await prisma.order.findMany({
      where: { customerPhone: phone },
      orderBy: { createdAt: "desc" },
      take: 30,
      include: {
        items: {
          select: { productName: true, quantity: true, priceAtOrder: true },
        },
      },
    });

    return NextResponse.json(orders);
  } catch (e) {
    if (e instanceof ValidationError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    console.error("[history] error:", e);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
