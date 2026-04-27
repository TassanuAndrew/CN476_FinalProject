// Centralised input validation for public order APIs.
// Goal: reject malformed/oversized payloads before they hit the DB.

export const LIMITS = {
  MAX_ITEMS: 50, // max line items per order
  MAX_QUANTITY: 99, // per line item
  MAX_NAME_LEN: 60,
  MAX_PHONE_LEN: 20,
  MAX_DELIVERY_DETAIL_LEN: 300,
  MAX_PICKUP_DATE_LEN: 60,
};

export interface CleanItem {
  productId: number;
  quantity: number;
}

export class ValidationError extends Error {
  status = 400;
  constructor(message: string) {
    super(message);
  }
}

function trimOrNull(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  if (!t) return null;
  if (t.length > max) {
    throw new ValidationError(`ข้อความยาวเกิน ${max} ตัวอักษร`);
  }
  return t;
}

export function cleanName(v: unknown): string | null {
  return trimOrNull(v, LIMITS.MAX_NAME_LEN);
}

export function cleanPhone(v: unknown): string | null {
  const t = trimOrNull(v, LIMITS.MAX_PHONE_LEN);
  if (!t) return null;
  // allow digits, spaces, dash, plus
  if (!/^[0-9+\-\s]+$/.test(t)) {
    throw new ValidationError("เบอร์โทรไม่ถูกต้อง");
  }
  return t;
}

export function cleanDeliveryDetail(v: unknown): string | null {
  return trimOrNull(v, LIMITS.MAX_DELIVERY_DETAIL_LEN);
}

export function cleanPickupDate(v: unknown): string | null {
  return trimOrNull(v, LIMITS.MAX_PICKUP_DATE_LEN);
}

export function cleanDeliveryType(v: unknown): "PICKUP" | "DELIVERY" | null {
  if (v === "PICKUP" || v === "DELIVERY") return v;
  return null;
}

export function cleanItems(raw: unknown): CleanItem[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new ValidationError("ไม่มีรายการสินค้า");
  }
  if (raw.length > LIMITS.MAX_ITEMS) {
    throw new ValidationError(`สั่งได้ไม่เกิน ${LIMITS.MAX_ITEMS} รายการ`);
  }
  const seen = new Set<number>();
  const items: CleanItem[] = [];
  for (const r of raw) {
    if (!r || typeof r !== "object") {
      throw new ValidationError("รูปแบบรายการไม่ถูกต้อง");
    }
    const obj = r as Record<string, unknown>;
    const productId = Number(obj.productId);
    const quantity = Number(obj.quantity);
    if (!Number.isInteger(productId) || productId <= 0) {
      throw new ValidationError("productId ไม่ถูกต้อง");
    }
    if (!Number.isFinite(quantity) || quantity < 1 || quantity > LIMITS.MAX_QUANTITY) {
      throw new ValidationError(`จำนวนต้องอยู่ระหว่าง 1-${LIMITS.MAX_QUANTITY}`);
    }
    if (seen.has(productId)) {
      throw new ValidationError("มีสินค้าซ้ำในรายการ");
    }
    seen.add(productId);
    items.push({ productId, quantity: Math.floor(quantity) });
  }
  return items;
}
