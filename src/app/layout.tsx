import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { BackgroundOrbs } from "@/components/ui/BackgroundOrbs";
import { CursorSpotlight } from "@/components/ui/CursorSpotlight";
import { AmbientParticles } from "@/components/ui/AmbientParticles";
import { MotionConfig } from "framer-motion";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000"
  ),
  title: "Speedometx",
  description: "A premium internet speed test web app",
  authors: [{ name: "anmolmalhan" }],
  openGraph: {
    title: "Speedometx",
    description: "A premium internet speed test web app",
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 512,
        alt: "Speedometx Icon",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Speedometx",
    description: "A premium internet speed test web app",
    images: ["/icon.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${inter.className} antialiased text-foreground`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <MotionConfig reducedMotion="user">
            {/* Animated vibrant mesh background */}
            <div className="mesh-bg" aria-hidden="true" />
            <div className="grid-overlay" aria-hidden="true" />
            <div className="scanline" aria-hidden="true" />
            <BackgroundOrbs />
            <AmbientParticles />
            <CursorSpotlight />
            {children}
            <Analytics />
          </MotionConfig>
        </ThemeProvider>
      </body>
    </html>
  );
}
