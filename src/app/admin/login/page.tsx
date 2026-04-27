"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: u, password: p }),
    });
    if (res.ok) router.replace("/admin");
    else {
      setErr((await res.json()).error || "Login failed");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={submit} className="card p-7 w-full max-w-sm space-y-4">
        <div>
          <div className="text-xs font-semibold tracking-widest text-red-700 uppercase">
            Admin
          </div>
          <h1 className="text-2xl font-black tracking-tight">เข้าสู่ระบบ</h1>
          <p className="text-sm text-stone-500 mt-1">สำหรับเจ้าของร้าน</p>
        </div>
        <div className="space-y-3">
          <div>
            <div className="label mb-1">Username</div>
            <input
              value={u}
              onChange={(e) => setU(e.target.value)}
              className="field"
              autoComplete="username"
            />
          </div>
          <div>
            <div className="label mb-1">Password</div>
            <input
              type="password"
              value={p}
              onChange={(e) => setP(e.target.value)}
              className="field"
              autoComplete="current-password"
            />
          </div>
        </div>
        {err && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {err}
          </div>
        )}
        <button
          disabled={loading}
          className="btn-primary w-full rounded-xl py-3.5 font-bold disabled:opacity-50"
        >
          {loading ? "กำลังเข้า..." : "เข้าสู่ระบบ"}
        </button>
      </form>
    </main>
  );
}
