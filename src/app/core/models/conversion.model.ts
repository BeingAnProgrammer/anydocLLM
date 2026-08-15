export type ConverterState = 'idle' | 'selected' | 'converting' | 'completed' | 'error';

/** A conversion stage the engine reports progress through. Order matters. */
export interface ConversionStage {
  readonly label: string;
}

/**
 * Both conversion engines (AnyDoc, PDF Inspector) convert in one call — they
 * extract, structure, and emit Markdown as a single atomic step, so there's
 * no honest way to report progress through those as separate stages. Two
 * real stages: reading the file into memory, then handing it to whichever
 * engine handles the format — the UI doesn't know or say which one that is.
 */
export const CONVERSION_STAGES: readonly ConversionStage[] = [
  { label: 'Reading document' },
  { label: 'Converting document' },
];

export interface ConversionResult {
  readonly markdown: string;
}

export type ConversionErrorReason =
  | 'unsupported-format'
  | 'file-too-large'
  | 'invalid-file'
  | 'parser-failure'
  | 'browser-unsupported';

export interface ConversionError {
  readonly reason: ConversionErrorReason;
  /** User-facing message only — never a stack trace or raw exception text. */
  readonly message: string;
}
