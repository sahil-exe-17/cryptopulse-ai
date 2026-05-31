import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CryptoPulse AI | Next-Gen Prediction Platform",
  description: "AI-powered cryptocurrency prediction platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} dark antialiased h-full`}
    >
      <body className="min-h-full flex flex-col bg-crypto-black text-foreground selection:bg-crypto-neon selection:text-black">
        {children}
      </body>
    </html>
  );
}
