import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "บ้านขนมจีน",
  description: "สั่งขนมจีนออนไลน์",
  manifest: "/manifest.json",
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
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
