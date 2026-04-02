import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";

import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SyncSecure — Your Digital Vault",
  description:
    "SyncSecure — Store, organise, and share your files with bank-grade security and a modern, intuitive experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${inter.variable} font-inter antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
