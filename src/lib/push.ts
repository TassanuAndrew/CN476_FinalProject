import webpush from "web-push";
import { prisma } from "./db";

let configured = false;

function configure() {
  if (configured) return;
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const sub = process.env.VAPID_SUBJECT || "mailto:admin@kanomjeen.local";
  if (pub && priv) {
    webpush.setVapidDetails(sub, pub, priv);
    configured = true;
  }
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  sound?: boolean; // play ding on receive
  tag?: string;
}

export async function sendPushToAdmins(payload: PushPayload) {
  configure();
  if (!configured) return;

  const subs = await prisma.pushSubscription.findMany();
  const data = JSON.stringify(payload);

  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: s.endpoint,
            keys: { p256dh: s.p256dh, auth: s.auth },
          },
          data
        );
      } catch (e: unknown) {
        const err = e as { statusCode?: number };
        if (err.statusCode === 404 || err.statusCode === 410) {
          await prisma.pushSubscription.delete({ where: { id: s.id } }).catch(() => {});
        }
      }
    })
  );
}
