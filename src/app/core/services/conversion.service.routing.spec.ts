import { TestBed } from '@angular/core/testing';
import { ConversionService } from './conversion.service';
import { AnyDocWasmService } from './anydoc-wasm.service';
import { PdfInspectorWasmService } from './pdf-inspector-wasm.service';
import type { SelectedDocument } from '../models/document.model';
import type { Format } from '@firecrawl/anydoc-wasm';

function fakeDocument(format: Format, name: string): SelectedDocument {
  return {
    file: new File(['irrelevant bytes'], name),
    name,
    extension: name.split('.').pop() ?? '',
    format,
    sizeBytes: 17,
    sizeLabel: '17 B',
  };
}

describe('ConversionService engine routing', () => {
  let pdfInspectorConvert: ReturnType<typeof vi.fn>;
  let anyDocConvert: ReturnType<typeof vi.fn>;
  let service: ConversionService;

  beforeEach(() => {
    pdfInspectorConvert = vi.fn().mockResolvedValue('# from pdf inspector');
    anyDocConvert = vi.fn().mockResolvedValue('# from anydoc');

    TestBed.configureTestingModule({
      providers: [
        ConversionService,
        { provide: PdfInspectorWasmService, useValue: { convert: pdfInspectorConvert } },
        { provide: AnyDocWasmService, useValue: { convert: anyDocConvert } },
      ],
    });
    service = TestBed.inject(ConversionService);
  });

  it('routes a PDF to PdfInspectorWasmService, never to AnyDocWasmService', async () => {
    const result = await service.convert(fakeDocument('pdf', 'report.pdf'), () => {});
    expect(pdfInspectorConvert).toHaveBeenCalledTimes(1);
    expect(anyDocConvert).not.toHaveBeenCalled();
    expect(result.markdown).toBe('# from pdf inspector');
  });

  it.each<[Format, string]>([
    ['docx', 'report.docx'],
    ['xlsx', 'report.xlsx'],
    ['pptx', 'report.pptx'],
    ['csv', 'report.csv'],
  ])('routes %s to AnyDocWasmService, never to PdfInspectorWasmService', async (format, name) => {
    const result = await service.convert(fakeDocument(format, name), () => {});
    expect(anyDocConvert).toHaveBeenCalledTimes(1);
    expect(pdfInspectorConvert).not.toHaveBeenCalled();
    expect(result.markdown).toBe('# from anydoc');
  });

  it('still maps a PDF Inspector failure through the shared error translator', async () => {
    pdfInspectorConvert.mockRejectedValue(Object.assign(new Error('bad pdf'), { code: 'malformed' }));
    await expect(service.convert(fakeDocument('pdf', 'bad.pdf'), () => {})).rejects.toMatchObject({
      reason: 'parser-failure',
    });
  });

  it('still maps an AnyDoc failure through the shared error translator', async () => {
    anyDocConvert.mockRejectedValue(Object.assign(new Error('bad docx'), { code: 'encrypted' }));
    await expect(service.convert(fakeDocument('docx', 'bad.docx'), () => {})).rejects.toMatchObject({
      reason: 'parser-failure',
    });
  });
});
