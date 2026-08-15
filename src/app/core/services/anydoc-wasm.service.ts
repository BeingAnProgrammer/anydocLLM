import { Injectable } from '@angular/core';
import type { Format } from '@firecrawl/anydoc-wasm';

/**
 * Isolates the @firecrawl/anydoc-wasm package from the rest of the app.
 * Nothing outside this file imports the package directly.
 *
 * The WASM module (~6.7 MB) loads lazily, only the first time `convert()` is
 * actually called with a non-PDF file — not when the /convert route opens,
 * and not for PDFs (those go through PdfInspectorWasmService instead, so
 * only one of the two engines ever loads per session). Every call after the
 * first shares the same init promise.
 */
@Injectable({ providedIn: 'root' })
export class AnyDocWasmService {
  private modulePromise: Promise<typeof import('@firecrawl/anydoc-wasm')> | null = null;

  private load(): Promise<typeof import('@firecrawl/anydoc-wasm')> {
    if (!this.modulePromise) {
      this.modulePromise = import('@firecrawl/anydoc-wasm').then(async (mod) => {
        // The package's default new URL(..., import.meta.url) resolution
        // isn't picked up by Angular's build asset pipeline, so the .wasm
        // binary is copied to the output root (see angular.json) and
        // fetched from a plain path instead.
        await mod.default('anydoc_wasm_bg.wasm');
        return mod;
      });
    }
    return this.modulePromise;
  }

  /** Converts document bytes to Markdown. `format` is required for signature-less formats (CSV). */
  async convert(bytes: Uint8Array, format?: Format): Promise<string> {
    const mod = await this.load();
    return mod.toMarkdownBytes(bytes, format);
  }
}
