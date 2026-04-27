import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendPushToAdmins } from "@/lib/push";
import {
  cleanItems,
  cleanName,
  cleanPhone,
  ValidationError,
} from "@/lib/validation";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rl = rateLimit(`buynow:${ip}`, 10, 60_000); // 10 / minute
    if (!rl.ok) {
      return NextResponse.json(
        { error: "ส่งคำสั่งบ่อยเกินไป กรุณารอสักครู่" },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
    }

    const items = cleanItems((body as Record<string, unknown>).items);
    const customerName = cleanName((body as Record<string, unknown>).customerName);
    const customerPhone = cleanPhone((body as Record<string, unknown>).customerPhone);

    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, active: true },
    });

    let totalPrice = 0;
    const orderItems = [];
    for (const i of items) {
      const p = products.find((pp) => pp.id === i.productId);
      if (!p) {
        return NextResponse.json(
          { error: "ไม่พบสินค้าบางรายการ" },
          { status: 400 }
        );
      }
      if (p.stock < i.quantity) {
        return NextResponse.json(
          { error: `สินค้า ${p.name} เหลือเพียง ${p.stock}` },
          { status: 400 }
        );
      }
      totalPrice += p.price * i.quantity;
      orderItems.push({
        productId: p.id,
        productName: p.name,
        priceAtOrder: p.price,
        quantity: i.quantity,
      });
    }

    const order = await prisma.order.create({
      data: {
        type: "BUYNOW",
        status: "PENDING",
        customerName,
        customerPhone,
        totalPrice,
        items: { create: orderItems },
      },
      include: { items: true },
    });

    const summary = orderItems.map((i) => `${i.productName} x${i.quantity}`).join(", ");
    await sendPushToAdmins({
      title: "🛒 ออเดอร์ซื้อเลย!",
      body: `${summary} = ${totalPrice}฿`,
      url: "/admin",
      sound: true,
      tag: `order-${order.id}`,
    });

    return NextResponse.json(order);
  } catch (e) {
    if (e instanceof ValidationError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    console.error("[buynow] error:", e);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
