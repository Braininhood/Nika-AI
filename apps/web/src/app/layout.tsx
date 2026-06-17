import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";

import { AppChrome } from "@/components/layout/app-chrome";
import { AppProviders } from "@/components/providers";
import { InstallPrompt } from "@/components/install-prompt";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "OET Coach — Personalised OET Preparation",
    template: "%s · OET Coach",
  },
  description:
    "Personalised OET preparation for healthcare professionals. Adaptive plans, offline study, and Nika — your AI study companion.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "OET Coach",
  },
};

export const viewport: Viewport = {
  themeColor: "#B5651D",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${fraunces.variable} h-full`}
      suppressHydrationWarning
    >
      <body
        className="flex min-h-full flex-col bg-surface-muted text-ink antialiased"
        suppressHydrationWarning
      >
        <AppProviders>
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          <InstallPrompt />
          <AppChrome>
            <main id="main-content" className="flex min-w-0 flex-1 flex-col overflow-x-clip" tabIndex={-1}>
              {children}
            </main>
          </AppChrome>
        </AppProviders>
      </body>
    </html>
  );
}
