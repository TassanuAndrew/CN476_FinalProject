import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendPushToAdmins } from "@/lib/push";

interface InputItem {
  productId: number;
  quantity: number;
}

export async function POST(req: Request) {
  const body = await req.json();
  const { items, customerName, customerPhone } = body as {
    items: InputItem[];
    customerName?: string;
    customerPhone?: string;
  };

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "ไม่มีสินค้า" }, { status: 400 });
  }

  const productIds = items.map((i) => Number(i.productId));
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, active: true },
  });

  let totalPrice = 0;
  const orderItems = items.map((i) => {
    const p = products.find((pp) => pp.id === Number(i.productId));
    if (!p) throw new Error("product not found");
    if (p.stock < i.quantity) throw new Error(`สินค้า ${p.name} เหลือเพียง ${p.stock}`);
    totalPrice += p.price * i.quantity;
    return {
      productId: p.id,
      productName: p.name,
      priceAtOrder: p.price,
      quantity: Number(i.quantity),
    };
  });

  const order = await prisma.order.create({
    data: {
      type: "BUYNOW",
      status: "PENDING",
      customerName: customerName || null,
      customerPhone: customerPhone || null,
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
}
