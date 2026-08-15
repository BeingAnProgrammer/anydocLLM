import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toMarkdownFileName } from '../../../../core/models/document.model';
import type { SelectedDocument } from '../../../../core/models/document.model';
import type { ConversionError, ConverterState } from '../../../../core/models/conversion.model';
import { ClipboardService } from '../../../../core/services/clipboard.service';
import { ConversionService } from '../../../../core/services/conversion.service';
import { DocumentService } from '../../../../core/services/document.service';
import { DownloadService } from '../../../../core/services/download.service';
import { SeoService } from '../../../../core/services/seo.service';
import { ConversionErrorComponent } from '../../components/conversion-error/conversion-error';
import { ConversionStateComponent } from '../../components/conversion-state/conversion-state';
import { ConversionWorkspaceComponent } from '../../components/conversion-workspace/conversion-workspace';
import { SelectedFileComponent } from '../../components/selected-file/selected-file';
import { UploadStateComponent } from '../../components/upload-state/upload-state';

@Component({
  selector: 'app-converter-page',
  imports: [
    RouterLink,
    UploadStateComponent,
    SelectedFileComponent,
    ConversionStateComponent,
    ConversionWorkspaceComponent,
    ConversionErrorComponent,
  ],
  templateUrl: './converter-page.html',
  styleUrl: './converter-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConverterPageComponent {
  private readonly documentService = inject(DocumentService);
  private readonly conversionService = inject(ConversionService);
  private readonly clipboardService = inject(ClipboardService);
  private readonly downloadService = inject(DownloadService);

  constructor() {
    inject(SeoService).update({
      path: 'convert',
      description: 'Upload a document and convert it to Markdown instantly in your browser — free, private, and open source.',
      // Thin, state-driven utility page — kept out of search results while
      // still linked from and linking back to the indexable homepage.
      robots: 'noindex, follow',
    });
  }

  protected readonly state = signal<ConverterState>('idle');
  protected readonly selectedDocument = signal<SelectedDocument | null>(null);
  protected readonly notice = signal<ConversionError | null>(null);
  protected readonly error = signal<ConversionError | null>(null);
  protected readonly stageIndex = signal(0);
  protected readonly markdown = signal('');
  protected readonly originalMarkdown = signal('');
  protected readonly copied = signal(false);

  protected readonly mdFileName = computed(() => {
    const document = this.selectedDocument();
    return document ? toMarkdownFileName(document.name) : 'document.md';
  });

  protected onFileSelected(file: File): void {
    const result = this.documentService.validate(file);
    if (!result.ok) {
      this.notice.set(result.error);
      return;
    }
    this.notice.set(null);
    this.selectedDocument.set(result.document);
    this.state.set('selected');
  }

  protected onRemove(): void {
    this.selectedDocument.set(null);
    this.state.set('idle');
  }

  protected async onConvert(): Promise<void> {
    const document = this.selectedDocument();
    if (!document) return;

    this.state.set('converting');
    this.stageIndex.set(0);

    try {
      const result = await this.conversionService.convert(document, (stage) => this.stageIndex.set(stage));
      this.markdown.set(result.markdown);
      this.originalMarkdown.set(result.markdown);
      this.state.set('completed');
    } catch (thrown) {
      this.error.set(thrown as ConversionError);
      this.state.set('error');
    }
  }

  protected onRetry(): void {
    this.error.set(null);
    void this.onConvert();
  }

  protected onChooseAnother(): void {
    this.error.set(null);
    this.selectedDocument.set(null);
    this.state.set('idle');
  }

  protected onNewDocument(): void {
    const isEdited = this.markdown() !== this.originalMarkdown();
    if (isEdited && !confirm('Discard your edits to this Markdown?')) return;

    this.selectedDocument.set(null);
    this.markdown.set('');
    this.originalMarkdown.set('');
    this.state.set('idle');
  }

  protected async copyMarkdown(): Promise<void> {
    const ok = await this.clipboardService.copy(this.markdown());
    if (!ok) return;
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 1600);
  }

  protected downloadMarkdown(): void {
    this.downloadService.downloadMarkdown(this.markdown(), this.mdFileName());
  }
}
