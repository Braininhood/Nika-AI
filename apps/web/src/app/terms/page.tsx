import type { Metadata } from "next";

import { LegalDocument } from "@/components/legal/legal-document";
import { LEGAL_ENTITY, PRODUCT_NAME } from "@/content/legal/constants";
import { termsSections } from "@/content/legal/terms";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms of Service for ${PRODUCT_NAME} by ${LEGAL_ENTITY}.`,
};

export default function TermsPage() {
  return (
    <LegalDocument
      title="Terms of Service"
      subtitle={`The agreement between you and ${LEGAL_ENTITY} for using ${PRODUCT_NAME}.`}
      sections={termsSections}
    />
  );
}
