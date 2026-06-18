import type { Metadata } from "next";
import "./globals.css";
import MotuChat from "@/components/MotuChat";

export const metadata: Metadata = {
  title: "CollegeHub | Compare Colleges",
  description:
    "AI-powered college discovery platform for comparing colleges, placements, rankings and admission chances.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
        <MotuChat />
      </body>
    </html>
  );
}
