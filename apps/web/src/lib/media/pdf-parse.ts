export interface PdfParseResult {
  text: string;
  pages: number;
}

export async function extractTextFromPdf(file: File): Promise<PdfParseResult> {
  const pdfjs = await import("pdfjs-dist");
  if (typeof window !== "undefined") {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url,
    ).toString();
  }

  const buffer = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buffer }).promise;
  const pages: string[] = [];

  for (let i = 1; i <= doc.numPages; i += 1) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    pages.push(text);
  }

  return {
    text: pages.join("\n\n"),
    pages: doc.numPages,
  };
}

/** Heuristic OET answer-key parser — Q1 / 1. / Question 1 patterns */
export function parseAnswerKeyFromText(text: string): Record<string, string> {
  const key: Record<string, string> = {};
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  for (const line of lines) {
    const match =
      line.match(/^(?:Q(?:uestion)?\s*)?(\d+)[.):\s]+(.+)$/i) ??
      line.match(/^(\d+)\s+(.+)$/);
    if (match) {
      key[`q${match[1]}`] = match[2]!.trim();
      key[match[1]!] = match[2]!.trim();
    }
  }

  return key;
}

/** Chunk PDF text into passage-like blocks for reading/listening keys */
export function chunkPassagesFromText(text: string): { id: string; title: string; text: string }[] {
  const sections = text.split(/(?=Part\s+[ABC])/i).filter((s) => s.trim().length > 40);
  if (sections.length === 0) {
    return [{ id: "passage-1", title: "Imported passage", text: text.slice(0, 4000) }];
  }

  return sections.map((section, i) => {
    const titleMatch = section.match(/Part\s+[ABC][^\n]*/i);
    return {
      id: `passage-${i + 1}`,
      title: titleMatch?.[0]?.trim() ?? `Section ${i + 1}`,
      text: section.trim().slice(0, 4000),
    };
  });
}
