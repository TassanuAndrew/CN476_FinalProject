"use client";
import { useEffect, useState } from "react";
import Icon from "@/components/Icon";

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
  const [status, setStatus] = useState<"idle" | "ok" | "blocked" | "unsupported">(
    "idle"
  );

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
    <div className="rounded-2xl p-4 mb-4 flex items-center gap-3 bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-300 shadow-soft">
      <div className="w-10 h-10 rounded-xl bg-stone-900 text-amber-300 flex items-center justify-center flex-shrink-0">
        <Icon name="bell" size={20} />
      </div>
      <div className="flex-1 text-sm font-medium text-stone-800">
        {status === "blocked"
          ? "การแจ้งเตือนถูกปิด — เปิดในตั้งค่าเบราว์เซอร์"
          : status === "unsupported"
          ? "เบราว์เซอร์นี้ไม่รองรับการแจ้งเตือน"
          : "เปิดการแจ้งเตือนเพื่อรับออเดอร์ใหม่"}
      </div>
      {status === "idle" && (
        <button
          onClick={enable}
          className="btn-primary px-4 py-2 rounded-lg font-bold text-sm"
        >
          เปิด
        </button>
      )}
    </div>
  );
}
