export type ConverterState = 'idle' | 'selected' | 'converting' | 'completed' | 'error';

/** A conversion stage the engine reports progress through. Order matters. */
export interface ConversionStage {
  readonly label: string;
}

/**
 * AnyDoc converts in one call — it extracts, structures, and emits Markdown
 * as a single atomic step, so there's no honest way to report progress
 * through those as separate stages. Two real stages: reading the file into
 * memory, then handing it to the engine.
 */
export const CONVERSION_STAGES: readonly ConversionStage[] = [
  { label: 'Reading document' },
  { label: 'Converting with AnyDoc' },
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
