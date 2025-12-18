import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Revenue Friction Diagnostic | Ena Pragma",
  description: "Identify the single constraint preventing effort from converting into revenue. A forced-prioritization diagnostic that ends debate and enables action.",
  keywords: ["revenue friction", "business constraint", "operational diagnostic", "revenue conversion", "business bottleneck"],
  authors: [{ name: "Ena Pragma" }],
  openGraph: {
    title: "Revenue Friction Diagnostic | Ena Pragma",
    description: "Identify the single constraint preventing effort from converting into revenue. A forced-prioritization diagnostic that ends debate and enables action.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Revenue Friction Diagnostic | Ena Pragma",
    description: "Identify the single constraint preventing effort from converting into revenue.",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
