import { Injectable } from '@angular/core';
import type { SelectedDocument } from '../models/document.model';
import type { ConversionError, ConversionResult } from '../models/conversion.model';

/** Reports which of the four pipeline stages just completed (0-based). */
export type ConversionProgressCallback = (stageIndex: number) => void;

/**
 * Hides the document → Markdown parser behind one call. The UI never knows
 * which library handled a given format, so the engine can change per-format
 * without touching any component.
 */
@Injectable({ providedIn: 'root' })
export class ConversionService {
  async convert(document: SelectedDocument, onProgress: ConversionProgressCallback): Promise<ConversionResult> {
    onProgress(0); // Reading document
    const buffer = await document.file.arrayBuffer();

    try {
      onProgress(1); // Extracting content
      const markdown = await this.runEngine(document, buffer, onProgress);
      onProgress(3); // Generating Markdown
      return { markdown };
    } catch (e) {
      console.error('AnyDoc LLM: conversion failed', e);
      const error: ConversionError = {
        reason: 'parser-failure',
        message:
          "The file couldn't be read — it may be password-protected, corrupted, or in an unexpected layout. Try again, or pick a different document.",
      };
      throw error;
    }
  }

  private async runEngine(
    document: SelectedDocument,
    buffer: ArrayBuffer,
    onProgress: ConversionProgressCallback,
  ): Promise<string> {
    switch (document.format) {
      case 'pdf': {
        const engine = await import('../converters/pdf.converter');
        const raw = await engine.extract(buffer);
        onProgress(2); // Structuring document
        return engine.structure(raw);
      }
      case 'docx': {
        const engine = await import('../converters/docx.converter');
        const html = await engine.extract(buffer);
        onProgress(2);
        return engine.structure(html);
      }
      case 'xlsx':
      case 'xls':
      case 'csv': {
        const engine = await import('../converters/spreadsheet.converter');
        const raw = await engine.extract(buffer);
        onProgress(2);
        return engine.structure(raw);
      }
      case 'pptx': {
        const engine = await import('../converters/pptx.converter');
        const raw = await engine.extract(buffer);
        onProgress(2);
        return engine.structure(raw);
      }
    }
  }
}
