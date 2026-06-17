import type { Metadata } from "next";

import { LegalDocument } from "@/components/legal/legal-document";
import { CookieSettingsButton } from "@/components/legal/cookie-settings-button";
import { cookieSections } from "@/content/legal/cookies";
import { PRODUCT_NAME } from "@/content/legal/constants";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: `How ${PRODUCT_NAME} uses cookies and local storage.`,
};

export default function CookiesPage() {
  return (
    <LegalDocument
      title="Cookie Policy"
      subtitle="Essential cookies, optional analytics, and how to manage your preferences."
      sections={cookieSections}
    >
      <CookieSettingsButton />
    </LegalDocument>
  );
}
