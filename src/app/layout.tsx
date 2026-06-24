import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const promptFont = Prompt({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin", "thai"],
  variable: "--font-prompt",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "MOPH ITA : โรงพยาบาลหนองหาน",
  description: "ระบบประเมินคุณธรรมและความโปร่งใส (ITA) โรงพยาบาลหนองหาน",
  icons: {
    icon: "https://img1.pic.in.th/images/nhh.png",
  }
};

import Navbar from "@/components/layout/Navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${promptFont.variable} antialiased`} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen font-sans overflow-x-hidden" style={{ background: 'var(--bg)', color: 'var(--text)' }} suppressHydrationWarning>
        <ThemeProvider>
          <Navbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
