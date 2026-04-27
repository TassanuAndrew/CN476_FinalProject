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
  const productId = Number(id);
  // If product has existing order history, hard-delete would violate FK.
  // Fall back to soft-delete (active=false) so the product disappears from
  // the customer view but historical orders remain intact.
  const used = await prisma.orderItem.count({ where: { productId } });
  if (used > 0) {
    await prisma.product.update({
      where: { id: productId },
      data: { active: false },
    });
    return NextResponse.json({ ok: true, soft: true });
  }
  await prisma.product.delete({ where: { id: productId } });
  return NextResponse.json({ ok: true });
}
