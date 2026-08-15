import type { Format } from '@firecrawl/anydoc-wasm';

export interface SelectedDocument {
  readonly file: File;
  readonly name: string;
  readonly extension: string;
  /** The format hint to pass to AnyDoc at conversion time. */
  readonly format: Format;
  readonly sizeLabel: string;
}

export function toMarkdownFileName(sourceName: string): string {
  return sourceName.replace(/\.[^./]+$/, '') + '.md';
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
