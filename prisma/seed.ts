import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD || "admin1234";
  const promptpay = process.env.ADMIN_PROMPTPAY_PHONE || "0812345678";

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.admin.upsert({
    where: { username },
    update: { passwordHash, promptpayPhone: promptpay },
    create: {
      username,
      passwordHash,
      promptpayPhone: promptpay,
      shopName: "บ้านขนมจีน",
    },
  });

  const products = [
    { name: "ขนมจีน ครึ่งกิโล", price: 40, stock: 20 },
    { name: "ขนมจีน 1 กิโล", price: 70, stock: 20 },
    { name: "ขนมจีน 2 กิโล", price: 130, stock: 15 },
    { name: "ขนมจีน 3 กิโล", price: 190, stock: 10 },
    { name: "ขนมจีน 5 กิโล", price: 300, stock: 8 },
    { name: "ขนมจีน 10 กิโล", price: 580, stock: 5 },
    { name: "น้ำพริก", price: 50, stock: 30 },
    { name: "น้ำยากะทิ", price: 60, stock: 30 },
    { name: "น้ำยาป่า", price: 60, stock: 30 },
    { name: "ทอดมัน", price: 80, stock: 20 },
    { name: "ลอดช่อง", price: 40, stock: 25 },
    { name: "น้ำกะทิลอดช่อง", price: 50, stock: 25 },
  ];

  for (const p of products) {
    const existing = await prisma.product.findFirst({ where: { name: p.name } });
    if (!existing) {
      await prisma.product.create({ data: p });
    }
  }

  console.log("✅ Seeded admin + products");
  console.log(`   admin: ${username} / ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
