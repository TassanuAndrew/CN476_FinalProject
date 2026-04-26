import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendPushToAdmins } from "@/lib/push";

export async function POST(req: Request) {
  const body = await req.json();
  const {
    productId,
    quantity,
    deliveryType, // PICKUP | DELIVERY
    deliveryDetail,
    pickupDateText,
    customerName,
    customerPhone,
  } = body;

  if (!productId || !quantity || quantity < 1) {
    return NextResponse.json({ error: "ข้อมูลไม่ครบ" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id: Number(productId) } });
  if (!product) return NextResponse.json({ error: "ไม่พบสินค้า" }, { status: 404 });

  const totalPrice = product.price * Number(quantity);

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
      items: {
        create: [
          {
            productId: product.id,
            productName: product.name,
            quantity: Number(quantity),
            priceAtOrder: product.price,
          },
        ],
      },
    },
    include: { items: true },
  });

  await sendPushToAdmins({
    title: "📦 ออเดอร์สั่งล่วงหน้าใหม่!",
    body: `${product.name} x${quantity} = ${totalPrice}฿`,
    url: "/admin",
    sound: true,
    tag: `order-${order.id}`,
  });

  return NextResponse.json(order);
}
