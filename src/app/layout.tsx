import type { Metadata } from "next";
import { Kanit, IBM_Plex_Sans_Thai } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { SessionProvider } from "next-auth/react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// Body / UI font — high legibility for Thai + Latin at small sizes.
const ibmPlexThai = IBM_Plex_Sans_Thai({
  variable: "--font-sans",
  subsets: ["latin", "thai"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Display / heading font — geometric, modern, covers Thai + Latin.
const kanit = Kanit({
  variable: "--font-heading",
  subsets: ["latin", "thai"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Hor Tong Mong | ร้านสีและเครื่องมือช่าง",
    template: "%s | Hor Tong Mong",
  },
  description:
    "ร้านจำหน่ายสีทาบ้านและเครื่องมือช่างครบวงจร พร้อมฟีเจอร์ทดลองสีบนผนังจริงผ่านกล้อง",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className={`${ibmPlexThai.variable} ${kanit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <SessionProvider>
          <NextIntlClientProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster richColors position="top-center" />
          </NextIntlClientProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
