export type SupportedFormat = 'pdf' | 'docx' | 'xlsx' | 'xls' | 'csv' | 'pptx';

export interface SupportedFormatInfo {
  readonly format: SupportedFormat;
  readonly label: string;
  readonly extension: string;
  readonly mimeTypes: readonly string[];
  readonly note: string;
}

/** The only formats the in-browser conversion engines actually handle. */
export const SUPPORTED_FORMATS: readonly SupportedFormatInfo[] = [
  {
    format: 'pdf',
    label: 'PDF',
    extension: 'pdf',
    mimeTypes: ['application/pdf'],
    note: 'Reports, scans, papers',
  },
  {
    format: 'docx',
    label: 'DOCX',
    extension: 'docx',
    mimeTypes: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    note: 'Word documents',
  },
  {
    format: 'xlsx',
    label: 'XLSX',
    extension: 'xlsx',
    mimeTypes: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    note: 'Spreadsheets',
  },
  {
    format: 'pptx',
    label: 'PPTX',
    extension: 'pptx',
    mimeTypes: ['application/vnd.openxmlformats-officedocument.presentationml.presentation'],
    note: 'Presentations',
  },
  {
    format: 'csv',
    label: 'CSV',
    extension: 'csv',
    mimeTypes: ['text/csv'],
    note: 'Tabular data',
  },
  {
    format: 'xls',
    label: 'XLS',
    extension: 'xls',
    mimeTypes: ['application/vnd.ms-excel'],
    note: 'Legacy spreadsheets',
  },
];

export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;

export function formatInfoForExtension(extension: string): SupportedFormatInfo | undefined {
  const normalized = extension.toLowerCase();
  return SUPPORTED_FORMATS.find((f) => f.extension === normalized);
}
