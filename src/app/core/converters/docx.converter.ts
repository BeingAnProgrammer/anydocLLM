import { toMarkdownTable } from './markdown-table.util';

export type DocxRaw = string;

/** DOCX → HTML via mammoth (BSD-2-Clause), which reads the document's actual structure. */
export async function extract(buffer: ArrayBuffer): Promise<DocxRaw> {
  const mammoth = await import('mammoth');
  const result = await mammoth.convertToHtml({ arrayBuffer: buffer });
  return result.value;
}

/**
 * HTML → Markdown via turndown (MIT). Turndown has no built-in table support,
 * and the standard GFM plugin only converts tables that already have a <th>
 * header row — Word tables rarely do — so tables get their own rule here,
 * treating the first row as the header either way.
 */
export async function structure(html: DocxRaw): Promise<string> {
  const { default: TurndownService } = await import('turndown');
  const turndown = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
  turndown.addRule('table', {
    filter: 'table',
    replacement: (_content, node) => {
      const rows = Array.from((node as HTMLTableElement).rows).map((row) =>
        Array.from(row.cells).map((cell) => cell.textContent?.trim() ?? ''),
      );
      const [header, ...body] = rows;
      if (!header) return '';
      return '\n\n' + toMarkdownTable(header, body) + '\n\n';
    },
  });
  return turndown.turndown(html);
}
