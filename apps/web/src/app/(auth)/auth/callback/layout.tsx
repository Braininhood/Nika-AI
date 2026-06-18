import type { Metadata } from "next";

import { PRODUCT_NAME } from "@/content/legal/constants";
import { siteMetadata, siteOpenGraph } from "@/lib/site/metadata";

export const metadata: Metadata = {
  title: "Completing sign-in",
  description: `Secure sign-in to ${PRODUCT_NAME}. You will be redirected to your study dashboard.`,
  robots: { index: false, follow: false },
  openGraph: {
    ...siteOpenGraph,
    title: `${PRODUCT_NAME} — Sign in`,
    description: `Secure sign-in to ${PRODUCT_NAME}. Personalised OET preparation with Nika.`,
    url: `${siteMetadata.url}/auth/callback`,
  },
};

export default function AuthCallbackLayout({ children }: { children: React.ReactNode }) {
  return children;
}
