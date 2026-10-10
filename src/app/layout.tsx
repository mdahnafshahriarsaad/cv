import type { Metadata, Viewport } from "next";
import { Geist, Manrope } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
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
        className={`${geist.variable} ${manrope.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
