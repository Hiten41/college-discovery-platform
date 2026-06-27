import type { Metadata } from "next";
import "./globals.css";
import GalaxyBackground from "@/components/GalaxyBackground";
import MotuChat from "@/components/MotuChat";
import PremiumCursor from "@/components/PremiumCursor";

export const metadata: Metadata = {
  title: "CollegeHub | Compare Colleges",
  description:
    "AI-powered college discovery platform for comparing colleges, placements, rankings and admission chances.",
  icons: {
    icon: "/images/logo.png",
    shortcut: "/images/logo.png",
    apple: "/images/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <GalaxyBackground />
        <PremiumCursor />
        {children}
        <MotuChat />
      </body>
    </html>
  );
}
