import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, signal, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SUPPORTED_FORMATS } from '../../../../core/models/supported-file.model';

type PreviewStage = 'idle' | 'converting' | 'done';
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

@Component({
  selector: 'app-landing-page',
  imports: [RouterLink],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPageComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  protected readonly formats = SUPPORTED_FORMATS;
  protected readonly demoFileName = DEMO_FILE_NAME;
  protected readonly mdLines = MD_LINES;

  protected readonly stage = signal<PreviewStage>('idle');
  protected readonly progress = signal(0);
  protected readonly typedCount = signal(0);

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

  private progressTimer: ReturnType<typeof setInterval> | undefined;
  private typingTimer: ReturnType<typeof setInterval> | undefined;
  private startTimer: ReturnType<typeof setTimeout> | undefined;
  private finishTimer: ReturnType<typeof setTimeout> | undefined;

  ngOnInit(): void {
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
}
