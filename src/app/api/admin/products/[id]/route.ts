import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await req.json();
  const updated = await prisma.product.update({
    where: { id: Number(id) },
    data: {
      ...(data.name != null && { name: String(data.name) }),
      ...(data.price != null && { price: Number(data.price) }),
      ...(data.stock != null && { stock: Number(data.stock) }),
      ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl || null }),
      ...(data.active != null && { active: Boolean(data.active) }),
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.product.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
