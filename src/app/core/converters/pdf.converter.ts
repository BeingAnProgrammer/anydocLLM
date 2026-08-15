interface PdfLine {
  readonly text: string;
  readonly fontSize: number;
  readonly y: number;
}

interface PdfPage {
  readonly lines: readonly PdfLine[];
}

export interface PdfRaw {
  readonly pages: readonly PdfPage[];
}

function groupIntoLines(items: ReadonlyArray<{ str?: string; transform: number[] }>): PdfLine[] {
  const rawLines: { y: number; parts: { text: string; fontSize: number }[] }[] = [];
  for (const item of items) {
    if (!item.str) continue;
    const y = item.transform[5];
    const fontSize = Math.abs(item.transform[3]) || 10;
    const current = rawLines.at(-1);
    if (current && Math.abs(current.y - y) < 2) {
      current.parts.push({ text: item.str, fontSize });
    } else {
      rawLines.push({ y, parts: [{ text: item.str, fontSize }] });
    }
  }
  return rawLines
    .map((line) => ({
      text: line.parts
        .map((p) => p.text)
        .join('')
        .trim(),
      fontSize: Math.max(...line.parts.map((p) => p.fontSize)),
      y: line.y,
    }))
    .filter((line) => line.text.length > 0);
}

/** PDF text + layout extraction via pdf.js (Mozilla, Apache-2.0) — the same engine behind Firefox's viewer. */
export async function extract(buffer: ArrayBuffer): Promise<PdfRaw> {
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = 'pdf.worker.min.mjs';

  const doc = await pdfjs.getDocument({ data: buffer }).promise;
  const pages: PdfPage[] = [];
  for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber++) {
    const page = await doc.getPage(pageNumber);
    const textContent = await page.getTextContent();
    pages.push({ lines: groupIntoLines(textContent.items as { str?: string; transform: number[] }[]) });
  }
  return { pages };
}

function medianFontSize(lines: readonly PdfLine[]): number {
  const sizes = lines.map((l) => l.fontSize).sort((a, b) => a - b);
  return sizes[Math.floor(sizes.length / 2)] ?? 12;
}

/**
 * Groups extracted lines into headings and paragraphs. PDFs carry no structural
 * markup, so headings are inferred from relative font size and paragraph breaks
 * from vertical gaps — a best-effort reconstruction, not a guarantee of fidelity.
 */
export function structure(raw: PdfRaw): string {
  const allLines = raw.pages.flatMap((p) => p.lines);
  if (allLines.length === 0) {
    throw new Error('no-text');
  }
  const bodyFontSize = medianFontSize(allLines);
  const lineHeight = bodyFontSize * 1.3;

  const blocks: string[] = [];
  let paragraph: string[] = [];
  const flush = () => {
    if (paragraph.length > 0) {
      blocks.push(paragraph.join(' '));
      paragraph = [];
    }
  };

  for (const page of raw.pages) {
    flush();
    let previousY: number | null = null;
    for (const line of page.lines) {
      const isHeading = line.fontSize >= bodyFontSize * 1.3;
      if (isHeading) {
        flush();
        const level = line.fontSize >= bodyFontSize * 1.8 ? '#' : '##';
        blocks.push(`${level} ${line.text}`);
      } else {
        const gap = previousY !== null ? previousY - line.y : 0;
        if (previousY !== null && gap > lineHeight * 1.6) flush();
        paragraph.push(line.text);
      }
      previousY = line.y;
    }
    flush();
  }
  return blocks.join('\n\n');
}
