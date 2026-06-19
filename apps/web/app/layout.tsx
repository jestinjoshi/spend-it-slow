import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Spend It Slow",
  description: "See any price as the hours of your life it really costs.",
  applicationName: "Spend It Slow",
  appleWebApp: {
    capable: true,
    title: "Spend It Slow",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#3f7a6a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
