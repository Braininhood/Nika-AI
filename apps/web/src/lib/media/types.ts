export interface MediaBlobRecord {
  id: string;
  mimeType: string;
  sizeBytes: number;
  /** Path inside OPFS root, e.g. packs/listening-foundation-v1/audio/foo.wav */
  opfsPath: string;
  createdAt: number;
}

export interface UserImportPackRecord {
  id: string;
  name: string;
  profession: string;
  createdAt: number;
  expiresAt: number;
  consent: boolean;
  files: {
    pdfId?: string;
    audioIds: string[];
    keyPdfId?: string;
  };
  parsed: {
    passages?: { id: string; title: string; text: string }[];
    listeningParts?: {
      part: "A" | "B" | "C";
      title: string;
      audioId: string;
      transcript?: string;
    }[];
    answerKey?: Record<string, string>;
  };
}

export interface OfflinePackRecord {
  id: string;
  version: string;
  sizeBytes: number;
  downloadedAt: number;
  manifestPath: string;
  complete: boolean;
}

export const PLV_DEFAULT_TTL_DAYS = 90;
export const PLV_MAX_PACK_BYTES = 100 * 1024 * 1024;

export const BUNDLED_LISTENING_PACK_ID = "listening-foundation-v1";
