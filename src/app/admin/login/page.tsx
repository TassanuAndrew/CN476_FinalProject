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
      <form
        onSubmit={submit}
        className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm space-y-4"
      >
        <div className="text-center">
          <div className="text-4xl mb-2">🔐</div>
          <h1 className="text-xl font-bold">เข้าสู่ระบบเจ้าของร้าน</h1>
        </div>
        <input
          placeholder="Username"
          value={u}
          onChange={(e) => setU(e.target.value)}
          className="w-full border-2 border-stone-200 rounded-xl p-3"
          autoComplete="username"
        />
        <input
          placeholder="Password"
          type="password"
          value={p}
          onChange={(e) => setP(e.target.value)}
          className="w-full border-2 border-stone-200 rounded-xl p-3"
          autoComplete="current-password"
        />
        {err && <div className="text-red-500 text-sm">{err}</div>}
        <button
          disabled={loading}
          className="w-full bg-orange-600 text-white rounded-xl py-3 font-bold disabled:opacity-50"
        >
          {loading ? "กำลังเข้า..." : "เข้าสู่ระบบ"}
        </button>
      </form>
    </main>
  );
}
