import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nirvash CV Maker — Your CV. Made Effortlessly.",
  description:
    "Create a professional CV without struggling with complicated forms, layouts, or design. Nirvash makes the process simple, guided, and effortless.",
  keywords: [
    "Nirvash",
    "CV Maker",
    "Resume Builder",
    "Professional CV",
    "CV Templates",
  ],
  authors: [{ name: "Nirvash" }],
  icons: {
    icon: "/favicon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "Nirvash CV Maker — Your CV. Made Effortlessly.",
    description:
      "Create a professional CV without struggling with complicated forms, layouts, or design.",
    siteName: "Nirvash CV Maker",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nirvash CV Maker",
    description: "Your CV. Made Effortlessly.",
  },
};

export const viewport: Viewport = {
  themeColor: "#212121",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
