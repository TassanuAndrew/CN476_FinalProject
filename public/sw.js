self.addEventListener("install", (e) => {
  self.skipWaiting();
});
self.addEventListener("activate", (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = { title: "บ้านขนมจีน", body: "" };
  try {
    if (event.data) data = event.data.json();
  } catch (e) {}

  const opts = {
    body: data.body || "",
    icon: "/icon.svg",
    badge: "/icon.svg",
    vibrate: [200, 100, 200, 100, 400],
    tag: data.tag,
    renotify: true,
    requireInteraction: false,
    data: { url: data.url || "/admin", sound: data.sound !== false },
  };
  event.waitUntil(self.registration.showNotification(data.title || "บ้านขนมจีน", opts));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/admin";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((wins) => {
      for (const c of wins) {
        if (c.url.includes(url) && "focus" in c) return c.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
