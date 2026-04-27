import { NextResponse } from "next/server";
import { getStorageClient, PRODUCT_BUCKET } from "@/lib/storage";

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(req: Request) {
  const supabase = getStorageClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Storage ยังไม่ได้ตั้งค่า (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)" },
      { status: 500 }
    );
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "ไม่พบไฟล์" }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: "รองรับเฉพาะ JPG, PNG, WEBP" },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "ไฟล์ใหญ่เกิน 2MB" },
      { status: 400 }
    );
  }

  const ext = file.type.split("/")[1] || "jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage
    .from(PRODUCT_BUCKET)
    .upload(filename, buffer, {
      contentType: file.type,
      cacheControl: "31536000", // 1 year
      upsert: false,
    });
  if (error) {
    console.error("[upload] supabase error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data } = supabase.storage.from(PRODUCT_BUCKET).getPublicUrl(filename);
  return NextResponse.json({ url: data.publicUrl });
}
