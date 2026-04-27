import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { id: "asc" },
  });
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const { name, price, stock, imageUrl } = await req.json();
  if (!name || price == null) {
    return NextResponse.json({ error: "ข้อมูลไม่ครบ" }, { status: 400 });
  }
  const product = await prisma.product.create({
    data: {
      name: String(name),
      price: Number(price),
      stock: Number(stock || 0),
      imageUrl: imageUrl || null,
    },
  });
  return NextResponse.json(product);
}
