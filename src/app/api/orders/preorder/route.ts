import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendPushToAdmins } from "@/lib/push";
import {
  cleanDeliveryDetail,
  cleanDeliveryType,
  cleanItems,
  cleanName,
  cleanPhone,
  cleanPickupDate,
  ValidationError,
} from "@/lib/validation";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rl = rateLimit(`preorder:${ip}`, 10, 60_000); // 10 / minute
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
    const b = body as Record<string, unknown>;

    const items = cleanItems(b.items);
    const customerName = cleanName(b.customerName);
    const customerPhone = cleanPhone(b.customerPhone);
    const deliveryType = cleanDeliveryType(b.deliveryType);
    const deliveryDetail = cleanDeliveryDetail(b.deliveryDetail);
    const pickupDateText = cleanPickupDate(b.pickupDateText);

    if (deliveryType === "DELIVERY" && !deliveryDetail) {
      return NextResponse.json(
        { error: "กรุณากรอกที่อยู่จัดส่ง" },
        { status: 400 }
      );
    }

    const ids = items.map((i) => i.productId);
    const products = await prisma.product.findMany({ where: { id: { in: ids } } });
    const map = new Map(products.map((p) => [p.id, p]));

    let totalPrice = 0;
    const orderItems = [];
    for (const i of items) {
      const p = map.get(i.productId);
      if (!p) {
        return NextResponse.json({ error: "ไม่พบสินค้า" }, { status: 400 });
      }
      totalPrice += p.price * i.quantity;
      orderItems.push({
        productId: p.id,
        productName: p.name,
        quantity: i.quantity,
        priceAtOrder: p.price,
      });
    }

    const order = await prisma.order.create({
      data: {
        type: "PREORDER",
        status: "PENDING",
        customerName,
        customerPhone,
        deliveryType,
        deliveryDetail,
        pickupDateText,
        totalPrice,
        items: { create: orderItems },
      },
      include: { items: true },
    });

    const summary = orderItems
      .map((i) => `${i.productName} x${i.quantity}`)
      .join(", ");

    await sendPushToAdmins({
      title: "ออเดอร์สั่งล่วงหน้าใหม่!",
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
    console.error("[preorder] error:", e);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
