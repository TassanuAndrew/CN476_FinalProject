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
      setMsg("บันทึกแล้ว");
      setPassword("");
    } else setMsg("เกิดข้อผิดพลาด");
  }

  return (
    <main className="p-4 max-w-md mx-auto">
      <div className="mb-4">
        <div className="text-xs font-semibold tracking-widest text-red-700 uppercase">
          Settings
        </div>
        <h1 className="text-2xl font-black tracking-tight">ตั้งค่าร้าน</h1>
      </div>

      <div className="card p-5 space-y-4">
        <div>
          <div className="label mb-1">ชื่อร้าน</div>
          <input
            value={data.shopName}
            onChange={(e) => setData({ ...data, shopName: e.target.value })}
            className="field"
          />
        </div>
        <div>
          <div className="label mb-1">
            เบอร์ PromptPay <span className="text-stone-400 font-normal">(สำหรับ QR รับเงิน)</span>
          </div>
          <input
            value={data.promptpayPhone || ""}
            onChange={(e) => setData({ ...data, promptpayPhone: e.target.value })}
            placeholder="0812345678"
            className="field font-mono"
          />
        </div>
        <div>
          <div className="label mb-1">เปลี่ยนรหัสผ่าน</div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="(เว้นว่างไว้ถ้าไม่เปลี่ยน)"
            className="field"
          />
        </div>
        <button
          onClick={save}
          className="btn-primary w-full rounded-xl py-3.5 font-bold"
        >
          บันทึก
        </button>
        {msg && (
          <div className="text-center text-sm text-stone-700 bg-amber-50 border border-amber-200 rounded-lg py-2 font-semibold">
            {msg}
          </div>
        )}
      </div>
    </main>
  );
}
