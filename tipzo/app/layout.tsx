import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tipzo — Support your favorite creators",
  description: "Send a tip with a message, live on stream.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-base text-slate-200 antialiased">{children}</body>
    </html>
  );
}
