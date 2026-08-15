export type ConverterState = 'idle' | 'selected' | 'converting' | 'completed' | 'error';

/** A conversion stage the engine reports progress through. Order matters. */
export interface ConversionStage {
  readonly label: string;
}

export const CONVERSION_STAGES: readonly ConversionStage[] = [
  { label: 'Reading document' },
  { label: 'Extracting content' },
  { label: 'Structuring document' },
  { label: 'Generating Markdown' },
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
