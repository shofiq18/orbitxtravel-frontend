import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import ReduxProvider from "@/redux/ReduxProvider";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const recoleta = localFont({
  src: "../public/fonts/Recoleta-RegularDEMO.otf",
  variable: "--font-recoleta",
});

export const metadata: Metadata = {
  title: "OrbitX Travel",
  description: "Your one-stop solution for all your travel needs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${recoleta.variable} antialiased`}
        suppressHydrationWarning
      >
        <ReduxProvider>{children}</ReduxProvider>
        <Toaster position="top-right" reverseOrder={false} />
      </body>
    </html>
  );
}
