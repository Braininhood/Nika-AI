import type { Metadata } from "next";

import { LegalDocument } from "@/components/legal/legal-document";
import { LEGAL_ENTITY, PRODUCT_NAME } from "@/content/legal/constants";
import { privacySections } from "@/content/legal/privacy";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy Policy for ${PRODUCT_NAME} by ${LEGAL_ENTITY}. UK GDPR and EU GDPR compliant.`,
};

export default function PrivacyPage() {
  return (
    <LegalDocument
      title="Privacy Policy"
      subtitle={`How ${LEGAL_ENTITY} collects, uses, and protects your data when you use ${PRODUCT_NAME}.`}
      sections={privacySections}
    />
  );
}
