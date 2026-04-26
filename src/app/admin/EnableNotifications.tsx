"use client";
import { useEffect, useState } from "react";

function urlB64ToUint8(s: string): Uint8Array<ArrayBuffer> {
  const pad = "=".repeat((4 - (s.length % 4)) % 4);
  const b = (s + pad).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b);
  const buf = new ArrayBuffer(raw.length);
  const arr = new Uint8Array(buf);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export default function EnableNotifications() {
  const [status, setStatus] = useState<"idle" | "ok" | "blocked" | "unsupported">("idle");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
      return;
    }
    if (Notification.permission === "denied") setStatus("blocked");
    if (Notification.permission === "granted") {
      ensureSubscribed().then(() => setStatus("ok"));
    }
  }, []);

  async function enable() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    const perm = await Notification.requestPermission();
    if (perm !== "granted") {
      setStatus("blocked");
      return;
    }
    await ensureSubscribed();
    setStatus("ok");
  }

  async function ensureSubscribed() {
    const reg = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!key) return;
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8(key),
      });
    }
    await fetch("/api/admin/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sub),
    });
  }

  if (status === "ok") return null;

  return (
    <div className="bg-yellow-100 border-2 border-yellow-300 rounded-xl p-3 mb-3 flex items-center gap-2">
      <div className="text-2xl">🔔</div>
      <div className="flex-1 text-sm">
        {status === "blocked"
          ? "การแจ้งเตือนถูกปิด — เปิดในตั้งค่าเบราว์เซอร์"
          : status === "unsupported"
          ? "เบราว์เซอร์นี้ไม่รองรับการแจ้งเตือน"
          : "เปิดการแจ้งเตือนเพื่อรับออเดอร์ใหม่"}
      </div>
      {status === "idle" && (
        <button
          onClick={enable}
          className="bg-orange-600 text-white px-3 py-2 rounded-lg font-bold text-sm"
        >
          เปิด
        </button>
      )}
    </div>
  );
}
