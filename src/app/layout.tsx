import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000"
  ),
  title: "Speedometx",
  description: "A premium internet speed test web app",
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
      <body className={`${inter.className} antialiased bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
