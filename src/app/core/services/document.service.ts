import { Injectable } from '@angular/core';
import { formatFileSize } from '../models/document.model';
import type { SelectedDocument } from '../models/document.model';
import type { ConversionError } from '../models/conversion.model';
import { MAX_FILE_SIZE_BYTES, SUPPORTED_FORMATS, formatInfoForExtension } from '../models/supported-file.model';

export type DocumentValidationResult =
  | { readonly ok: true; readonly document: SelectedDocument }
  | { readonly ok: false; readonly error: ConversionError };

const SUPPORTED_LABELS = SUPPORTED_FORMATS.map((f) => f.label).join(', ');

/** Validates an uploaded file and turns it into a typed, ready-to-convert document. */
@Injectable({ providedIn: 'root' })
export class DocumentService {
  validate(file: File): DocumentValidationResult {
    const extension = (file.name.split('.').pop() ?? '').toLowerCase();
    const info = formatInfoForExtension(extension);
    if (!info) {
      return {
        ok: false,
        error: {
          reason: 'unsupported-format',
          message: `This file type isn't supported yet. Supported formats: ${SUPPORTED_LABELS}.`,
        },
      };
    }
    if (file.size === 0) {
      return {
        ok: false,
        error: { reason: 'invalid-file', message: 'This file appears to be empty or unreadable.' },
      };
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return {
        ok: false,
        error: { reason: 'file-too-large', message: 'This file is larger than 25 MB. Choose a smaller document.' },
      };
    }
    return {
      ok: true,
      document: {
        file,
        name: file.name,
        extension,
        format: info.format,
        sizeBytes: file.size,
        sizeLabel: formatFileSize(file.size),
      },
    };
  }
}
