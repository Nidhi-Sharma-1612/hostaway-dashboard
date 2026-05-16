import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { Providers } from "@/components/providers";

const inter = Inter({ variable: "--font-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hostaway Dashboard",
  description: "Hostaway API integration demo",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex bg-slate-50 text-slate-900">
        <Providers>
          <Sidebar />
          <main className="flex-1 overflow-auto p-4 pb-24 md:p-8 md:pb-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
