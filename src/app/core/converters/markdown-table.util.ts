function escapeCell(value: string): string {
  return value.replace(/\|/g, '\\|').replace(/\r?\n/g, ' ').trim();
}

/** Builds a GitHub-flavored Markdown table from a header row and data rows. */
export function toMarkdownTable(header: readonly string[], rows: readonly (readonly string[])[]): string {
  const cols = header.length;
  const headerLine = `| ${header.map(escapeCell).join(' | ')} |`;
  const dividerLine = `| ${Array.from({ length: cols }, () => '---').join(' | ')} |`;
  const bodyLines = rows.map((row) => {
    const cells = Array.from({ length: cols }, (_, i) => escapeCell(row[i] ?? ''));
    return `| ${cells.join(' | ')} |`;
  });
  return [headerLine, dividerLine, ...bodyLines].join('\n');
}
