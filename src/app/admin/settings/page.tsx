"use client";
import { useEffect, useState } from "react";

export default function AdminSettings() {
  const [data, setData] = useState({ shopName: "", promptpayPhone: "", username: "" });
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then(setData);
  }, []);

  async function save() {
    setMsg("");
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shopName: data.shopName,
        promptpayPhone: data.promptpayPhone,
        ...(password ? { password } : {}),
      }),
    });
    if (res.ok) {
      setMsg("บันทึกแล้ว ✅");
      setPassword("");
    } else setMsg("เกิดข้อผิดพลาด");
  }

  return (
    <main className="p-3 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-3">ตั้งค่า</h1>
      <div className="bg-white rounded-2xl shadow p-4 space-y-3">
        <div>
          <label className="text-sm font-semibold">ชื่อร้าน</label>
          <input
            value={data.shopName}
            onChange={(e) => setData({ ...data, shopName: e.target.value })}
            className="w-full border-2 border-stone-200 rounded-xl p-2 mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-semibold">เบอร์ PromptPay (สำหรับ QR รับเงิน)</label>
          <input
            value={data.promptpayPhone || ""}
            onChange={(e) => setData({ ...data, promptpayPhone: e.target.value })}
            placeholder="0812345678"
            className="w-full border-2 border-stone-200 rounded-xl p-2 mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-semibold">เปลี่ยนรหัสผ่าน</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="(เว้นว่างไว้ถ้าไม่เปลี่ยน)"
            className="w-full border-2 border-stone-200 rounded-xl p-2 mt-1"
          />
        </div>
        <button
          onClick={save}
          className="w-full bg-orange-600 text-white rounded-xl py-3 font-bold"
        >
          บันทึก
        </button>
        {msg && <div className="text-center text-sm">{msg}</div>}
      </div>
    </main>
  );
}
