import type { NikaSource } from "@/lib/nika/chat";
import { isSafeInternalPath, sanitizeExternalHref } from "@/lib/security/safe-href";

/** Known RAG chunk ids → canonical URL (external or in-app). */
const CHUNK_URLS: Record<string, string> = {
  "reg-gphc": "https://www.pharmacyregulation.org/",
  "reg-gmc": "https://www.gmc-uk.org/",
  "reg-nmc": "https://www.nmc.org.uk/",
  "reg-hcpc": "https://www.hcpc-uk.org/",
  "reg-ahpra": "https://www.ahpra.gov.au/",
  "oet-sample-tests": "https://oet.com",
  "oet-overview": "https://oet.com/ready",
  "platform-import": "/listening/import",
  "platform-mock": "/mock",
  "platform-study-plan": "/dashboard",
  "platform-flashcards": "/reading/flashcards",
  "ready-hub": "https://oet.com/ready",
  "prof-pharmacy-oet": "https://oet.com/ready",
  "free-resources-post": "https://oet.com/post/free-study-resources-oet-preparation",
  "criteria-writing": "https://cdn-aus.aglty.io/oet/pdf-files/Writing%20assessment%20criteria.pdf",
  "criteria-speaking":
    "https://cdn-aus.aglty.io/oet/pdf-files/Speaking%20assessment%20criteria%20and%20level%20descriptors.pdf",
  "prep-hub-listening": "https://oet.com/ready/listening",
  "prep-hub-reading": "https://oet.com/ready/reading",
  "prep-hub-writing": "https://oet.com/ready/writing",
  "prep-hub-speaking": "https://oet.com/ready/speaking",
};

/** Corpus `source` field → URL when chunk id is generic. */
const SOURCE_FIELD_URLS: Record<string, string> = {
  "oet.com": "https://oet.com",
  "pharmacyregulation.org": "https://www.pharmacyregulation.org/",
  "gmc-uk.org": "https://www.gmc-uk.org/",
  "nmc.org.uk": "https://www.nmc.org.uk/",
  "hcpc-uk.org": "https://www.hcpc-uk.org/",
  "ahpra.gov.au": "https://www.ahpra.gov.au/",
  "oet-coach-platform": "/materials",
  "oet-coach-docs": "https://oet.com/ready",
};

/** Regulator codes from offline mode (reg-GPhC etc.). */
const REGULATOR_URLS: Record<string, string> = {
  "reg-GPhC": "https://www.pharmacyregulation.org/",
  "reg-GMC": "https://www.gmc-uk.org/",
  "reg-NMC": "https://www.nmc.org.uk/",
  "reg-HCPC": "https://www.hcpc-uk.org/",
  "reg-AHPRA": "https://www.ahpra.gov.au/",
  "reg-GDC": "https://www.gdc-uk.org/",
  "reg-RCVS": "https://www.rcvs.org.uk/",
};

function sanitizeResolvedHref(href: string | null | undefined): string | null {
  if (!href) return null;
  if (isSafeInternalPath(href)) return href;
  return sanitizeExternalHref(href);
}

export function resolveNikaSourceHref(source: NikaSource): string | null {
  if (source.url) return sanitizeResolvedHref(source.url);
  if (source.id.startsWith("/")) return sanitizeResolvedHref(source.id);

  const byId = CHUNK_URLS[source.id] ?? REGULATOR_URLS[source.id];
  if (byId) return sanitizeResolvedHref(byId);

  if (source.source) {
    const mapped = SOURCE_FIELD_URLS[source.source];
    if (mapped) return sanitizeResolvedHref(mapped);
    if (/^[a-z0-9][-a-z0-9]*\.[a-z]{2,}/i.test(source.source)) {
      return sanitizeResolvedHref(`https://${source.source.replace(/^www\./, "")}`);
    }
  }

  if (source.category === "regulatory" && source.id.startsWith("reg-")) {
    const domain = source.source;
    if (domain && SOURCE_FIELD_URLS[domain]) return sanitizeResolvedHref(SOURCE_FIELD_URLS[domain]);
  }

  if (source.category === "profession") {
    return sanitizeResolvedHref("https://oet.com/ready");
  }

  return null;
}

export function isExternalNikaHref(href: string): boolean {
  return href.startsWith("http://") || href.startsWith("https://");
}
