import { toMarkdownTable } from './markdown-table.util';

describe('toMarkdownTable', () => {
  it('renders a header, divider, and body rows', () => {
    const md = toMarkdownTable(['Month', 'Revenue'], [['January', '120000']]);
    expect(md).toBe('| Month | Revenue |\n| --- | --- |\n| January | 120000 |');
  });

  it('escapes pipe characters and strips newlines in cells', () => {
    const md = toMarkdownTable(['A'], [['1 | 2\n3']]);
    expect(md).toContain('1 \\| 2 3');
  });

  it('pads missing trailing cells to match the header width', () => {
    const md = toMarkdownTable(['A', 'B', 'C'], [['x']]);
    expect(md).toBe('| A | B | C |\n| --- | --- | --- |\n| x |  |  |');
  });
});
