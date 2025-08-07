import type { Metadata } from "next";
import { Varela_Round, Playwrite_HU, Nunito } from "next/font/google";
import "./globals.css";

const varelaRound = Varela_Round({
  subsets: ["latin"],
  variable: "--font-varela-round",
  display: "swap",
  weight: ["400"],
});

const playwriteHU = Playwrite_HU({
  variable: "--font-playwrite",
  display: "swap",
  weight: ["100", "200", "300", "400"],
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
  weight: ["200", "300", "400", "500", "600", "700", "800", "900", "1000"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Konnect",
  description: "Connect with people across the fediverse. Share text, images, and videos with the world.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${varelaRound.variable} ${playwriteHU.variable} ${nunito.variable}`}>
        {children}
      </body>
    </html>
  );
}
