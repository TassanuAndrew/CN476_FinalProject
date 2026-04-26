# 🍜 บ้านขนมจีน — Web App สั่งขนมจีน (PWA)

CN476 Final Project — ระบบสั่งซื้อสินค้าออนไลน์แบบ Progressive Web App
ลูกค้าสแกน QR code → เลือกสั่งล่วงหน้า / ซื้อเลย! → เจ้าของร้านได้ push notification + เสียงแจ้งเตือนแบบ real-time

## ฟีเจอร์

**ลูกค้า**
- 📦 **สั่งล่วงหน้า** — กรอกฟอร์ม (รับเอง/ส่ง, จำนวน, วันนัด, รายละเอียด, เบอร์, ชื่อ) → รอติดต่อกลับ
- 🛒 **ซื้อเลย!** — เลือกสินค้าในสต็อก, มีตะกร้า, รอเจ้าของยืนยัน → QR PromptPay → ชำระ
- ออเดอร์ **ซื้อเลย!** หมดอายุอัตโนมัติใน 1 ชั่วโมง

**เจ้าของร้าน (admin)**
- 🔔 ตารางออเดอร์เข้า / ออเดอร์สินค้า / ออเดอร์ยกเลิก (real-time polling 3 วิ)
- เสียง **ติ๊ง** + Web Push Notification เมื่อมีออเดอร์ใหม่ + เงินเข้า
- รับ/ยกเลิกออเดอร์, ยืนยันรับเงิน manual
- จัดการสินค้า (เพิ่ม/แก้/ลบ + อัพสต็อก real-time)
- ตั้งค่า PromptPay, ชื่อร้าน, รหัสผ่าน

## Tech Stack

- **Next.js 16** (App Router) + **React 19** + **Tailwind CSS 4**
- **Prisma ORM** + **SQLite** (dev) / **PostgreSQL** (prod)
- **Web Push API** (VAPID) + Service Worker
- **PromptPay QR** generation (`promptpay-qr` + `qrcode`)
- **JWT** (jose) cookie-based admin auth
- **Zustand** (cart state, persistent)
- PWA (manifest + service worker, installable on mobile)

## Run locally

```bash
# 1. install
npm install

# 2. setup DB + seed
npm run db:push
npm run db:seed

# 3. start dev
npm run dev
```

เปิด `http://localhost:3000` (ลูกค้า), `http://localhost:3000/admin/login` (admin)

**Default admin login:** `admin` / `admin1234`

## ENV vars (`.env`)

```
DATABASE_URL="file:./dev.db"
ADMIN_JWT_SECRET="<random long string>"
VAPID_PUBLIC_KEY="<generated>"
VAPID_PRIVATE_KEY="<generated>"
NEXT_PUBLIC_VAPID_PUBLIC_KEY="<same as VAPID_PUBLIC_KEY>"
VAPID_SUBJECT="mailto:you@example.com"

ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin1234"
ADMIN_PROMPTPAY_PHONE="0812345678"
```

สร้าง VAPID keys ใหม่ได้ที่:
```bash
node -e "const wp=require('web-push');console.log(wp.generateVAPIDKeys())"
```

---

## 🚀 Deploy to Vercel (kanomjeen.vercel.app)

### Step 1: เปลี่ยน DB จาก SQLite เป็น PostgreSQL

Vercel ใช้ SQLite ไม่ได้ ต้องใช้ Postgres ของ Supabase (ฟรี)

1. ไป https://supabase.com → สมัคร → New project
2. รอจน project พร้อม → ไป **Settings → Database** → ก็อป **Connection string** (URI mode, เปลี่ยน password)
3. แก้ `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"   // <- เปลี่ยนจาก "sqlite"
     url      = env("DATABASE_URL")
   }
   ```
4. แก้ `.env`:
   ```
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres"
   ```
5. รัน:
   ```bash
   npm run db:push
   npm run db:seed
   ```

### Step 2: Push to GitHub

```bash
git init
git add .
git commit -m "initial commit"
gh repo create kanomjeen --public --source=. --push
# หรือสร้าง repo ใน github.com แล้ว git remote add origin ...
```

### Step 3: Deploy ที่ Vercel

1. ไป https://vercel.com → New Project → import GitHub repo
2. Project name: `kanomjeen` (จะได้ URL `kanomjeen.vercel.app`)
3. ใส่ **Environment Variables** (จาก `.env`):
   - `DATABASE_URL`
   - `ADMIN_JWT_SECRET`
   - `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_SUBJECT`
   - `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_PROMPTPAY_PHONE`
4. Deploy!

### Step 4: สร้าง QR ป้ายหน้าบ้าน

ไป https://www.qr-code-generator.com → ใส่ URL `https://kanomjeen.vercel.app` → Download PNG → ปริ้นแปะ

---

## 📱 ติดตั้งเป็นแอพ (ฝั่งเจ้าของร้าน)

1. เปิด `https://kanomjeen.vercel.app/admin/login` บน Chrome (Android) / Safari (iOS)
2. เมนู → **Add to Home Screen**
3. เปิดแอพจาก home screen → login → กดปุ่ม **เปิดการแจ้งเตือน**
4. ทดสอบ: ลองสั่งซื้อจากเครื่องอื่น → จะได้ notification + เสียงติ๊ง

> **iOS:** push notification ใช้ได้เฉพาะเมื่อติดตั้ง PWA ลง Home Screen แล้ว (iOS 16.4+)

---

## 🔮 Roadmap (ภายหลัง)

- [ ] Payment Gateway (GBPrimePay/Omise) — auto confirm payment
- [ ] รูปสินค้า upload widget (ตอนนี้ paste URL)
- [ ] Multi-admin role
- [ ] รายงานยอดขาย รายวัน/เดือน
