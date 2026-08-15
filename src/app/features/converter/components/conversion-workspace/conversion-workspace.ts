import { ChangeDetectionStrategy, Component, computed, inject, input, model, signal } from '@angular/core';
import { toMarkdownFileName } from '../../../../core/models/document.model';
import type { SelectedDocument } from '../../../../core/models/document.model';
import { ClipboardService } from '../../../../core/services/clipboard.service';
import { DownloadService } from '../../../../core/services/download.service';
import { MarkdownEditorComponent } from '../../../../shared/components/markdown-editor/markdown-editor';
import { MarkdownPreviewComponent } from '../../../../shared/components/markdown-preview/markdown-preview';

type WorkspaceView = 'split' | 'markdown' | 'preview';

@Component({
  selector: 'app-conversion-workspace',
  imports: [MarkdownEditorComponent, MarkdownPreviewComponent],
  templateUrl: './conversion-workspace.html',
  styleUrl: './conversion-workspace.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConversionWorkspaceComponent {
  private readonly clipboardService = inject(ClipboardService);
  private readonly downloadService = inject(DownloadService);

  readonly document = input.required<SelectedDocument>();
  readonly originalMarkdown = input('');
  readonly markdown = model('');

  protected readonly view = signal<WorkspaceView>('split');
  protected readonly copied = signal(false);

  protected readonly mdFileName = computed(() => toMarkdownFileName(this.document().name));
  protected readonly stats = computed(() => {
    const content = this.markdown();
    const lines = content === '' ? 0 : content.split('\n').length;
    const words = content.trim() === '' ? 0 : content.trim().split(/\s+/).length;
    return `${lines} lines · ${words} words`;
  });

  protected setView(view: WorkspaceView): void {
    this.view.set(view);
  }

  protected revertEdits(): void {
    this.markdown.set(this.originalMarkdown());
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
