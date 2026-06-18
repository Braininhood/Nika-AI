import { PRODUCT_NAME, SITE_URL } from "@/content/legal/constants";

export const siteMetadata = {
  url: SITE_URL.replace(/\/$/, ""),
  name: PRODUCT_NAME,
  title: `${PRODUCT_NAME} — Personalised OET Preparation`,
  description:
    "Personalised OET preparation for healthcare professionals. Adaptive plans, offline study, and Nika — your AI study companion.",
  locale: "en_GB",
} as const;

export const siteOpenGraph = {
  type: "website" as const,
  siteName: PRODUCT_NAME,
  locale: siteMetadata.locale,
  images: [
    {
      url: `${siteMetadata.url}/nika/avatar/nika-companion.png`,
      width: 512,
      height: 512,
      alt: "Nika — OET study companion",
    },
  ],
};
