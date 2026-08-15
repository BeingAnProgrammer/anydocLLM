import { Injectable, inject } from '@angular/core';
import type { SelectedDocument } from '../models/document.model';
import type { ConversionError, ConversionResult } from '../models/conversion.model';
import { AnyDocWasmService } from './anydoc-wasm.service';

/** Reports which of the two pipeline stages just completed (0-based). */
export type ConversionProgressCallback = (stageIndex: number) => void;

/**
 * Hides the document → Markdown engine (AnyDoc WASM) behind one call. The UI
 * never imports @firecrawl/anydoc-wasm directly, so the engine could change
 * without touching any component.
 */
@Injectable({ providedIn: 'root' })
export class ConversionService {
  private readonly anyDoc = inject(AnyDocWasmService);

  async convert(document: SelectedDocument, onProgress: ConversionProgressCallback): Promise<ConversionResult> {
    onProgress(0); // Reading document
    const bytes = new Uint8Array(await document.file.arrayBuffer());

    try {
      onProgress(1); // Converting with AnyDoc
      const markdown = await this.anyDoc.convert(bytes, document.format);
      return { markdown };
    } catch (thrown) {
      console.error('AnyDoc LLM: conversion failed', thrown);
      throw toConversionError(thrown);
    }
  }
}

export function toConversionError(thrown: unknown): ConversionError {
  const code = (thrown as { code?: string } | null)?.code;
  switch (code) {
    case 'encrypted':
      return {
        reason: 'parser-failure',
        message: 'This document is password-protected. Remove the password and try again.',
      };
    case 'unsupported':
      return {
        reason: 'parser-failure',
        message:
          "This document's content couldn't be converted — for example, a scanned PDF with no extractable text.",
      };
    case 'malformed':
      return {
        reason: 'parser-failure',
        message: 'This file appears to be corrupted or incomplete.',
      };
    case 'missingPart':
      return {
        reason: 'parser-failure',
        message: "This file is missing a part it needs to convert — it may be an incomplete export.",
      };
    case 'resourceLimit':
      return {
        reason: 'parser-failure',
        message: 'This document is too large or complex to convert safely.',
      };
    default:
      // Anything without a recognized `code` is a WASM load/init failure, not
      // a document problem — most likely the module failed to fetch or the
      // browser can't run WebAssembly.
      return {
        reason: 'browser-unsupported',
        message: "Your browser couldn't load the document engine. Try reloading the page, or use an up-to-date browser.",
      };
  }
}
