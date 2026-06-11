import "./globals.css";

import type { Metadata } from "next";

import { ThemeProvider } from "@/components/ui/theme-provider";

import { Toaster } from "sonner";

import {
  Playfair_Display,
  Roboto,
} from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "AI Trip Planner",
  description: "Collaborative AI Travel Planning",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${playfair.variable} ${roboto.variable}`}
    >
      <body
        suppressHydrationWarning
        className="font-roboto bg-black text-white"
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}

          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}