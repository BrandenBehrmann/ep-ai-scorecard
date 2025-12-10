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
  title: "AI Leverage Scorecard | Ena Pragma",
  description: "Measure your operational readiness for AI implementation. A 25-minute diagnostic across 5 critical dimensions: Control, Clarity, Leverage, Friction, and Change-Readiness.",
  keywords: ["AI readiness", "operational assessment", "business diagnostic", "AI implementation", "operational health"],
  authors: [{ name: "Ena Pragma" }],
  openGraph: {
    title: "AI Leverage Scorecard | Ena Pragma",
    description: "Measure your operational readiness for AI implementation. A 25-minute diagnostic across 5 critical dimensions.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Leverage Scorecard | Ena Pragma",
    description: "Measure your operational readiness for AI implementation.",
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
