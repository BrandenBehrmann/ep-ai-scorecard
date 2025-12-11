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
  title: "Ena Score | Business Diagnostic",
  description: "Discover what's really holding your business back. A comprehensive diagnostic across 6 dimensions that reveals hidden patterns and provides actionable insights.",
  keywords: ["business diagnostic", "operational assessment", "business growth", "AI implementation", "operational health"],
  authors: [{ name: "Ena Pragma" }],
  openGraph: {
    title: "Ena Score | Business Diagnostic",
    description: "Discover what's really holding your business back. A comprehensive diagnostic that reveals hidden patterns and provides actionable insights.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ena Score | Business Diagnostic",
    description: "Discover what's really holding your business back. Get actionable insights.",
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
