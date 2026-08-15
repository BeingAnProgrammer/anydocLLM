import { Injectable } from '@angular/core';

/** Matches AnyDocWasmService's error vocabulary so ConversionService maps both engines the same way. */
type NormalizedErrorCode = 'unsupported' | 'malformed' | 'encrypted' | 'resourceLimit' | 'missingPart';

function normalizedError(code: NormalizedErrorCode, message: string): Error {
  return Object.assign(new Error(message), { code });
}

/**
 * Unlike @firecrawl/anydoc-wasm, pdf-inspector-wasm doesn't throw a typed
 * `{code}` error for "no usable content" — it returns a result with
 * `markdown: undefined` instead (e.g. a scanned PDF needing OCR), and its
 * genuine throws (not a PDF, wrong/missing password) carry no `code` at all,
 * just a message. Both are normalized here into the same error shape AnyDoc
 * already produces, so nothing downstream needs to know which engine ran.
 */
function toNormalizedError(thrown: unknown): Error {
  const message = thrown instanceof Error ? thrown.message : String(thrown);
  if (/encrypted/i.test(message)) return normalizedError('encrypted', message);
  if (/not a pdf/i.test(message)) return normalizedError('malformed', message);
  return normalizedError('unsupported', message);
}

/**
 * Isolates the @firecrawl/pdf-inspector-wasm package from the rest of the
 * app — nothing outside this file imports it directly.
 *
 * The WASM module (~5 MB) loads lazily, only the first time `convert()` is
 * actually called with a PDF — not when the /convert route opens, and not
 * for non-PDF files. That first call also triggers `init()`; every call
 * after shares the same init promise.
 */
@Injectable({ providedIn: 'root' })
export class PdfInspectorWasmService {
  private modulePromise: Promise<typeof import('@firecrawl/pdf-inspector-wasm')> | null = null;

  private load(): Promise<typeof import('@firecrawl/pdf-inspector-wasm')> {
    if (!this.modulePromise) {
      this.modulePromise = import('@firecrawl/pdf-inspector-wasm').then(async (mod) => {
        // Same asset-path caveat as AnyDoc: Angular's build doesn't resolve
        // the package's default new URL(..., import.meta.url), so the .wasm
        // is copied to the output root (see angular.json) and fetched from
        // a plain path instead.
        await mod.default('pdf_inspector_wasm_bg.wasm');
        return mod;
      });
    }
    return this.modulePromise;
  }

  /** Converts PDF bytes to Markdown. */
  async convert(bytes: Uint8Array): Promise<string> {
    const mod = await this.load();

    let result;
    try {
      result = mod.processPdf(bytes);
    } catch (thrown) {
      throw toNormalizedError(thrown);
    }

    if (!result.markdown) {
      throw normalizedError(
        'unsupported',
        `PDF Inspector found no extractable text (${result.pdfType}, ${result.pageCount} page(s)) — likely a scanned or image-only PDF.`,
      );
    }
    return result.markdown;
  }
}
