import { DocumentService } from './document.service';

function fakeFile(name: string, sizeBytes: number): File {
  return new File([new Uint8Array(Math.max(sizeBytes, 0))], name);
}

describe('DocumentService', () => {
  const service = new DocumentService();

  it('accepts a supported format within the size limit', () => {
    const result = service.validate(fakeFile('report.xlsx', 1024));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.document.format).toBe('xlsx');
      expect(result.document.extension).toBe('xlsx');
    }
  });

  it('rejects an unsupported extension', () => {
    const result = service.validate(fakeFile('notes.txt', 1024));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.reason).toBe('unsupported-format');
  });

  it('rejects an empty file', () => {
    const result = service.validate(fakeFile('empty.pdf', 0));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.reason).toBe('invalid-file');
  });

  it('rejects a file over the 25 MB limit', () => {
    const result = service.validate(fakeFile('huge.pdf', 26 * 1024 * 1024));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.reason).toBe('file-too-large');
  });

  it('matches extensions case-insensitively', () => {
    const result = service.validate(fakeFile('REPORT.PDF', 1024));
    expect(result.ok).toBe(true);
  });
});
