import { getLocale } from "@/lib/i18n/server";
import { LocaleProvider } from "@/components/providers/locale-provider";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/layout/cart-drawer";
import { CartProvider } from "@/components/providers/cart-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = typeof process !== "undefined" && process.env && process.env.NEXT_PUBLIC_SITE_URL
  ? process.env.NEXT_PUBLIC_SITE_URL
  : "https://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "GIRA | Sunglasses for your mood",
    template: "%s | GIRA",
  },
  description: "GIRA is a next-gen sunglasses brand built for fashion-first confidence, bold silhouettes, and editorial energy.",
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    title: "GIRA",
    description: "Sunglasses for your mood.",
    url: "/",
    siteName: "GIRA",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GIRA",
    description: "Sunglasses for your mood.",
  },
  alternates: {
    canonical: "/",
  },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  return (
    <html lang={locale} className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#f5efe9] text-[#111111]">
        <LocaleProvider locale={locale}><CartProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <CartDrawer />
        </CartProvider></LocaleProvider>
      </body>
    </html>
  );
}
