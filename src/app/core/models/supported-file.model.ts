import type { Format } from '@firecrawl/anydoc-wasm';

export interface SupportedFormatInfo {
  /** The format hint AnyDoc expects — typed against the package's own Format union. */
  readonly format: Format;
  readonly label: string;
  readonly extension: string;
  readonly note: string;
}

/**
 * The single source of truth for what this app accepts, kept in sync with
 * AnyDoc's actual `Format` type (imported above) so a version bump that
 * drops or renames a format fails the build here instead of drifting quietly.
 * `xls` has no distinct AnyDoc format of its own — the package's own
 * `formatFromExtension('xls')` resolves it to `'xlsx'`, mirrored here.
 */
export const SUPPORTED_FORMATS: readonly SupportedFormatInfo[] = [
  { format: 'pdf', extension: 'pdf', label: 'PDF', note: 'Reports, scans, papers' },
  { format: 'docx', extension: 'docx', label: 'DOCX', note: 'Word documents' },
  { format: 'doc', extension: 'doc', label: 'DOC', note: 'Legacy Word documents' },
  { format: 'xlsx', extension: 'xlsx', label: 'XLSX', note: 'Spreadsheets' },
  { format: 'xlsx', extension: 'xls', label: 'XLS', note: 'Legacy spreadsheets' },
  { format: 'pptx', extension: 'pptx', label: 'PPTX', note: 'Presentations' },
  { format: 'ppt', extension: 'ppt', label: 'PPT', note: 'Legacy presentations' },
  { format: 'csv', extension: 'csv', label: 'CSV', note: 'Tabular data' },
  { format: 'odt', extension: 'odt', label: 'ODT', note: 'OpenDocument text' },
  { format: 'ods', extension: 'ods', label: 'ODS', note: 'OpenDocument spreadsheets' },
  { format: 'odp', extension: 'odp', label: 'ODP', note: 'OpenDocument presentations' },
  { format: 'rtf', extension: 'rtf', label: 'RTF', note: 'Rich text documents' },
  { format: 'epub', extension: 'epub', label: 'EPUB', note: 'E-books' },
];

export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;

export function formatInfoForExtension(extension: string): SupportedFormatInfo | undefined {
  const normalized = extension.toLowerCase();
  return SUPPORTED_FORMATS.find((f) => f.extension === normalized);
}
