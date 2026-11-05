import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: { default: "Sumz AI: the gist of any article in seconds", template: "%s · Sumz AI" },
  description:
    "Paste a link, get a clear three-sentence summary. Sumz AI reads long articles for you and keeps every summary in one place.",
  icons: { icon: "/favicon.ico" },
  openGraph: {
    title: "Sumz AI: the gist of any article in seconds",
    description: "Paste a link, get a clear three-sentence summary.",
    siteName: "Sumz AI",
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#050505" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link href="https://api.fontshare.com/v2/css?f[]=satoshi@500,700,900&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
