import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendPushToAdmins } from "@/lib/push";

export async function POST(req: Request) {
  const body = await req.json();
  const {
    items, // [{productId, quantity}]
    deliveryType, // PICKUP | DELIVERY
    deliveryDetail,
    pickupDateText,
    customerName,
    customerPhone,
  } = body;

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "ไม่มีรายการสินค้า" }, { status: 400 });
  }

  const ids = items.map((i: { productId: number }) => Number(i.productId));
  const products = await prisma.product.findMany({ where: { id: { in: ids } } });
  const map = new Map(products.map((p) => [p.id, p]));

  let totalPrice = 0;
  const orderItems = items.map(
    (i: { productId: number; quantity: number }) => {
      const p = map.get(Number(i.productId));
      if (!p) throw new Error("ไม่พบสินค้า");
      const q = Math.max(1, Number(i.quantity));
      totalPrice += p.price * q;
      return {
        productId: p.id,
        productName: p.name,
        quantity: q,
        priceAtOrder: p.price,
      };
    }
  );

  const order = await prisma.order.create({
    data: {
      type: "PREORDER",
      status: "PENDING",
      customerName: customerName || null,
      customerPhone: customerPhone || null,
      deliveryType: deliveryType || null,
      deliveryDetail: deliveryDetail || null,
      pickupDateText: pickupDateText || null,
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
}
