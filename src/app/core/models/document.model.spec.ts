import { formatFileSize, toMarkdownFileName } from './document.model';

describe('toMarkdownFileName', () => {
  it('replaces the extension with .md', () => {
    expect(toMarkdownFileName('report.xlsx')).toBe('report.md');
    expect(toMarkdownFileName('Annual Report.docx')).toBe('Annual Report.md');
  });

  it('only strips the last extension', () => {
    expect(toMarkdownFileName('archive.tar.gz')).toBe('archive.tar.md');
  });

  it('appends .md when there is no extension to replace', () => {
    expect(toMarkdownFileName('README')).toBe('README.md');
  });
});

describe('formatFileSize', () => {
  it('formats sub-kilobyte sizes in bytes', () => {
    expect(formatFileSize(0)).toBe('0 B');
    expect(formatFileSize(1023)).toBe('1023 B');
  });

  it('formats kilobyte-range sizes with one decimal', () => {
    expect(formatFileSize(1024)).toBe('1.0 KB');
    expect(formatFileSize(16122)).toBe('15.7 KB');
  });

  it('formats megabyte-range sizes with one decimal', () => {
    expect(formatFileSize(1024 * 1024)).toBe('1.0 MB');
    expect(formatFileSize(25 * 1024 * 1024)).toBe('25.0 MB');
  });
});
