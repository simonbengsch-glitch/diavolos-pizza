import type { Metadata } from "next";
import { Montserrat, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const montserrat = Montserrat({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "600", "800"],
});

export const metadata: Metadata = {
  title: "Diavolo's Pizza | Ingolstadt – Jetzt online bestellen",
  description:
    "Teuflisch gute Pizza aus Ingolstadt. Frisch aus dem Steinofen, heiß geliefert. Jetzt online bestellen mit sicherer Zahlung via Stripe.",
  keywords: "Pizza, Ingolstadt, Lieferservice, Diavolo, Bestellen",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="scroll-smooth">
      <body className={`${inter.variable} ${montserrat.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
