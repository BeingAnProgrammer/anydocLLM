export interface PptxSlide {
  readonly paragraphs: readonly string[];
}

export interface PptxRaw {
  readonly slides: readonly PptxSlide[];
}

function slideNumber(path: string): number {
  return Number(/slide(\d+)\.xml$/.exec(path)?.[1] ?? 0);
}

/** PPTX is a zip of slide XML — unzip with jszip and read the text runs with the native DOMParser. */
export async function extract(buffer: ArrayBuffer): Promise<PptxRaw> {
  const { default: JSZip } = await import('jszip');
  const zip = await JSZip.loadAsync(buffer);
  const slidePaths = Object.keys(zip.files)
    .filter((path) => /^ppt\/slides\/slide\d+\.xml$/.test(path))
    .sort((a, b) => slideNumber(a) - slideNumber(b));

  if (slidePaths.length === 0) {
    throw new Error('no-slides');
  }

  const parser = new DOMParser();
  const slides: PptxSlide[] = [];
  for (const path of slidePaths) {
    const xml = await zip.files[path].async('text');
    const doc = parser.parseFromString(xml, 'application/xml');
    const paragraphs = Array.from(doc.getElementsByTagName('a:p'))
      .map((p) =>
        Array.from(p.getElementsByTagName('a:t'))
          .map((t) => t.textContent ?? '')
          .join(''),
      )
      .map((text) => text.trim())
      .filter((text) => text.length > 0);
    slides.push({ paragraphs });
  }
  return { slides };
}

export function structure(raw: PptxRaw): string {
  const sections = raw.slides.map((slide, index) => {
    const heading = `## Slide ${index + 1}`;
    if (slide.paragraphs.length === 0) return heading;
    return `${heading}\n\n${slide.paragraphs.map((p) => `- ${p}`).join('\n')}`;
  });
  return sections.join('\n\n');
}
