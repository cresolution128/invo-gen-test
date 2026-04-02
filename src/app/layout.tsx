import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";

export const metadata: Metadata = {
  title: "InvoGen — Quotes & Invoices",
  description: "Create professional quotes and invoices",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">
        <div className="flex h-full">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
