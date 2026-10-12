import type { Metadata, Viewport } from "next";
import "@fontsource/geist/400.css";
import "@fontsource/geist/500.css";
import "@fontsource/geist/600.css";
import "@fontsource/geist/700.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";
import "@fontsource/manrope/800.css";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

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
        className="antialiased bg-background text-foreground"
        style={{ fontFamily: "'Geist', 'Manrope', ui-sans-serif, system-ui, sans-serif" }}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
