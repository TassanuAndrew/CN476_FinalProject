import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://kanomjeen-bannongbo.vercel.app"),
  title: "บ้านขนมจีน",
  description: "สั่งขนมจีนออนไลน์ ส่งถึงบ้าน",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "บ้านขนมจีน",
    statusBarStyle: "default",
  },
  openGraph: {
    title: "บ้านขนมจีน",
    description: "สั่งขนมจีนออนไลน์ ส่งถึงบ้าน",
    images: ["/icon-512.png"],
    locale: "th_TH",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#ea580c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className="antialiased bg-orange-50 text-stone-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
