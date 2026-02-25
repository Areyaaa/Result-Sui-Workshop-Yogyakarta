import type { Metadata } from "next";
import { Providers } from "@/providers";
import { Navbar } from "@/components/layout/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SUI Escrow | Decentralized Exchange",
    template: "%s | SUI Escrow",
  },
  description:
    "A decentralized escrow platform built on the SUI blockchain. Swap tokens securely using smart contracts.",
  authors: [{ name: "SUI Escrow Team" }],
  creator: "SUI Escrow Team",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground bg-grid min-h-screen">
        <Providers>
          <Navbar />
          <main className="pt-16 mx-2 sm:mx-8 md:mx-16 lg:mx-28 xl:mx-40 my-8">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}