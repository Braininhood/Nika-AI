import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";

import { AppChrome } from "@/components/layout/app-chrome";
import { InstallPrompt } from "@/components/install-prompt";
import { AppProviders } from "@/components/providers";
import { NIKA_APP_ICON } from "@/lib/nika/assets";
import { siteMetadata, siteOpenGraph } from "@/lib/site/metadata";

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
  metadataBase: new URL(siteMetadata.url),
  title: {
    default: siteMetadata.title,
    template: `%s · ${siteMetadata.name}`,
  },
  description: siteMetadata.description,
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: NIKA_APP_ICON, sizes: "32x32", type: "image/png" },
      { url: NIKA_APP_ICON, sizes: "192x192", type: "image/png" },
      { url: NIKA_APP_ICON, sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: NIKA_APP_ICON, sizes: "180x180", type: "image/png" }],
    shortcut: NIKA_APP_ICON,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: siteMetadata.name,
  },
  openGraph: {
    ...siteOpenGraph,
    title: siteMetadata.title,
    description: siteMetadata.description,
    url: siteMetadata.url,
  },
  twitter: {
    card: "summary",
    title: siteMetadata.title,
    description: siteMetadata.description,
    images: siteOpenGraph.images.map((i) => i.url),
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
