import type { Metadata } from "next";
import { Inter, Cormorant_Garamond, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

/**
 * Cormorant Garamond — elegant serif fallback for Aphrodite Slim.
 * If you have the Aphrodite Slim font file, drop it into /public/fonts/
 * and it will be loaded via the @font-face rule in globals.css.
 */
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Brigaid — Ayaan Syed",
  description:
    "Creative portfolio and digital experience by Ayaan Syed. Built with cutting-edge 3D web technology.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("antialiased", inter.variable, cormorant.variable, "font-sans", geist.variable)}
    >
      <body className="min-h-screen bg-[#050505] text-white font-sans overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
