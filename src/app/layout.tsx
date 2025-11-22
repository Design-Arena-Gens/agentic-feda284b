import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  metadataBase: new URL("https://agentic-feda284b.vercel.app"),
  title: {
    default: "Algeria Opportunity Radar",
    template: "%s · Algeria Opportunity Radar",
  },
  description:
    "Automated, compliance-first aggregation of European scholarships and Algerian CS internships with intelligent filters and Telegram digests.",
  openGraph: {
    title: "Algeria Opportunity Radar",
    description:
      "Aggregates EU scholarships and CS internships relevant to Algerian students with automated filtering, compliance notes, and Telegram integration.",
    url: "https://agentic-feda284b.vercel.app",
    siteName: "Algeria Opportunity Radar",
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Algeria Opportunity Radar",
    description:
      "Track scholarships and internships for Algerian students with automated feeds, filters, and Telegram digests.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-slate-50 dark:bg-zinc-950">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
