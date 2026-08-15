import { toMarkdownTable } from './markdown-table.util';

export interface SpreadsheetSheet {
  readonly name: string;
  readonly rows: readonly (readonly unknown[])[];
}

export interface SpreadsheetRaw {
  readonly sheets: readonly SpreadsheetSheet[];
}

/** Handles XLSX, XLS, and CSV — SheetJS reads all three from the same buffer. */
export async function extract(buffer: ArrayBuffer): Promise<SpreadsheetRaw> {
  const XLSX = await import('xlsx');
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheets = workbook.SheetNames.map((name) => {
    const sheet = workbook.Sheets[name];
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, blankrows: false, raw: false });
    return { name, rows };
  });
  return { sheets };
}

export function structure(raw: SpreadsheetRaw): string {
  const sections = raw.sheets
    .filter((sheet) => sheet.rows.length > 0)
    .map((sheet) => {
      const [header, ...body] = sheet.rows;
      const headerCells = (header ?? []).map((cell) => String(cell ?? ''));
      const bodyRows = body.map((row) => row.map((cell) => String(cell ?? '')));
      const table = toMarkdownTable(headerCells, bodyRows);
      return raw.sheets.length > 1 ? `## ${sheet.name}\n\n${table}` : table;
    });

  if (sections.length === 0) {
    throw new Error('empty-workbook');
  }
  return sections.join('\n\n');
}
