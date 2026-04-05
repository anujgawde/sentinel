import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { ShellWrapper } from "@/components/shell-wrapper";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Sentinel — Workflow Canary + Drift Radar",
  description: "Detect workflow drift before it becomes an outage",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} h-full antialiased`}>
      <body className="h-full font-sans">
        <ShellWrapper sidebar={<Sidebar />}>
          {children}
        </ShellWrapper>
      </body>
    </html>
  );
}
