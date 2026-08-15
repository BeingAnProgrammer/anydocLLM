import { Injectable } from '@angular/core';
import type { Format } from '@firecrawl/anydoc-wasm';

/**
 * Isolates the @firecrawl/anydoc-wasm package from the rest of the app.
 * Nothing outside this file imports the package directly.
 *
 * The WASM module (~6.7 MB) is loaded once, lazily, the first time this
 * service is constructed — which happens when the /convert route is opened
 * (ConverterPageComponent → ConversionService → here), not on the landing
 * page. Every caller after the first await shares the same init promise.
 */
@Injectable({ providedIn: 'root' })
export class AnyDocWasmService {
  private modulePromise: Promise<typeof import('@firecrawl/anydoc-wasm')> | null = null;

  constructor() {
    // Kick off the load as soon as the converter feature is reached, so the
    // module is likely ready by the time the user finishes picking a file.
    void this.load();
  }

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
