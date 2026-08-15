import { toConversionError } from './conversion.service';

function anyDocError(code: string): unknown {
  return Object.assign(new Error('detail'), { code });
}

describe('toConversionError', () => {
  it('maps each AnyDoc error code to a distinct, friendly message', () => {
    const codes = ['encrypted', 'unsupported', 'malformed', 'missingPart', 'resourceLimit'];
    const messages = codes.map((code) => toConversionError(anyDocError(code)).message);
    expect(new Set(messages).size).toBe(codes.length);
    for (const message of messages) {
      expect(message).not.toContain('Error');
      expect(message.length).toBeGreaterThan(0);
    }
  });

  it('maps every known code to reason "parser-failure"', () => {
    for (const code of ['encrypted', 'unsupported', 'malformed', 'missingPart', 'resourceLimit']) {
      expect(toConversionError(anyDocError(code)).reason).toBe('parser-failure');
    }
  });

  it('treats an error with no code as a WASM/browser failure, not a document problem', () => {
    const result = toConversionError(new Error('Failed to fetch dynamically imported module'));
    expect(result.reason).toBe('browser-unsupported');
  });
});
