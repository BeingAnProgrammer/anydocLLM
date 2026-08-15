import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, signal, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SUPPORTED_FORMATS } from '../../../../core/models/supported-file.model';
import { SeoService } from '../../../../core/services/seo.service';

type PreviewStage = 'idle' | 'converting' | 'done';
type PreviewView = 'split' | 'markdown' | 'preview';
type MarkdownLineKind = 'heading' | 'table-rule' | 'table' | 'body';

interface MarkdownLine {
  readonly text: string;
  readonly kind: MarkdownLineKind;
}

const DEMO_FILE_NAME = 'financial-report.xlsx';

/** Mirrors the original Claude Design demo's exact example content. */
const MD_LINES: readonly MarkdownLine[] = [
  { text: '# Annual Financial Report', kind: 'heading' },
  { text: ' ', kind: 'body' },
  { text: '## Revenue', kind: 'heading' },
  { text: ' ', kind: 'body' },
  { text: '| Month | Revenue | Growth |', kind: 'table' },
  { text: '|---|---:|---:|', kind: 'table-rule' },
  { text: '| January | $120,000 | 8.2% |', kind: 'table' },
  { text: '| February | $138,000 | 15.0% |', kind: 'table' },
  { text: '| March | $151,000 | 9.4% |', kind: 'table' },
  { text: ' ', kind: 'body' },
  { text: '## Summary', kind: 'heading' },
  { text: ' ', kind: 'body' },
  { text: 'Revenue increased consistently throughout', kind: 'body' },
  { text: 'the first quarter, led by enterprise renewals', kind: 'body' },
  { text: 'and a full quarter of the new pricing tiers.', kind: 'body' },
];

/** Progress thresholds for the converting-stage status line, from the original demo. */
const PROGRESS_STEPS: readonly (readonly [number, string])[] = [
  [0, 'Reading document…'],
  [22, 'Extracting document structure…'],
  [48, 'Detecting tables and headings…'],
  [74, 'Normalising to Markdown…'],
  [94, 'Finalising output…'],
];

const TYPING_SPEED_MS = 55;
const PROGRESS_TICK_MS = 70;
const START_DELAY_MS = 1400;
const FINISH_PAUSE_MS = 260;
const COPIED_LABEL_MS = 1600;

@Component({
  selector: 'app-landing-page',
  imports: [RouterLink],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPageComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly seoService = inject(SeoService);

  protected readonly formats = SUPPORTED_FORMATS;
  protected readonly demoFileName = DEMO_FILE_NAME;
  protected readonly mdLines = MD_LINES;

  protected readonly stage = signal<PreviewStage>('idle');
  protected readonly progress = signal(0);
  protected readonly typedCount = signal(0);
  protected readonly view = signal<PreviewView>('split');
  protected readonly copied = signal(false);

  protected readonly stageLabel = computed(() => {
    switch (this.stage()) {
      case 'idle':
        return 'Ready';
      case 'converting':
        return 'Converting';
      case 'done':
        return 'Converted';
    }
  });
  protected readonly progressPercent = computed(() => `${Math.min(100, Math.round(this.progress()))}%`);
  protected readonly statusText = computed(() => {
    const pct = Math.min(100, Math.round(this.progress()));
    const step = [...PROGRESS_STEPS].reverse().find(([threshold]) => threshold <= pct);
    return step ? step[1] : 'Reading document…';
  });
  protected readonly visibleLines = computed(() => this.mdLines.slice(0, this.typedCount()));
  protected readonly isTypingDone = computed(() => this.typedCount() >= this.mdLines.length);
  protected readonly previewOpacity = computed(() => (this.isTypingDone() ? 1 : 0.25));
  protected readonly showMarkdownPane = computed(() => this.view() !== 'preview');
  protected readonly showPreviewPane = computed(() => this.view() !== 'markdown');
  protected readonly copyLabel = computed(() => (this.copied() ? 'Copied' : 'Copy'));

  private progressTimer: ReturnType<typeof setInterval> | undefined;
  private typingTimer: ReturnType<typeof setInterval> | undefined;
  private startTimer: ReturnType<typeof setTimeout> | undefined;
  private finishTimer: ReturnType<typeof setTimeout> | undefined;

  ngOnInit(): void {
    this.seoService.update({
      path: '',
      description:
        'Convert PDF, DOCX, XLSX, PPTX, CSV and more into clean, LLM-ready Markdown — entirely in your browser. Free and open source, no upload, no account.',
      robots: 'index, follow',
    });
    this.destroyRef.onDestroy(() => this.clearTimers());

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      this.stage.set('done');
      this.typedCount.set(this.mdLines.length);
      this.progress.set(100);
      return;
    }

    this.startTimer = setTimeout(() => this.startConverting(), START_DELAY_MS);
  }

  private startConverting(): void {
    this.stage.set('converting');
    this.progress.set(0);
    this.progressTimer = setInterval(() => {
      const next = this.progress() + 2 + Math.random() * 3;
      if (next >= 100) {
        clearInterval(this.progressTimer);
        this.progress.set(100);
        this.finishTimer = setTimeout(() => this.startTyping(), FINISH_PAUSE_MS);
        return;
      }
      this.progress.set(next);
    }, PROGRESS_TICK_MS);
  }

  private startTyping(): void {
    this.stage.set('done');
    this.typedCount.set(0);
    this.typingTimer = setInterval(() => {
      const next = this.typedCount() + 1;
      if (next >= this.mdLines.length) {
        clearInterval(this.typingTimer);
      }
      this.typedCount.set(next);
    }, TYPING_SPEED_MS);
  }

  private clearTimers(): void {
    clearTimeout(this.startTimer);
    clearTimeout(this.finishTimer);
    clearInterval(this.progressTimer);
    clearInterval(this.typingTimer);
  }

  protected setView(view: PreviewView): void {
    this.view.set(view);
  }

  protected copyMarkdown(): void {
    void navigator.clipboard.writeText(this.markdownText());
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), COPIED_LABEL_MS);
  }

  protected downloadMarkdown(): void {
    const blob = new Blob([this.markdownText()], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'report.md';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /** Matches the original demo: Reset only returns to idle — it doesn't auto-replay. */
  protected reset(): void {
    this.clearTimers();
    this.stage.set('idle');
    this.progress.set(0);
    this.typedCount.set(0);
    this.view.set('split');
  }

  /** The idle state has no real file input on the landing page — clicking it just replays the demo. */
  protected restartDemo(): void {
    if (this.stage() !== 'idle') return;
    this.clearTimers();
    this.startConverting();
  }

  private markdownText(): string {
    return this.mdLines.map((line) => line.text).join('\n');
  }
}
