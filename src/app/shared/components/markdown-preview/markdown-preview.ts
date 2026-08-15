import { ChangeDetectionStrategy, Component, ViewEncapsulation, effect, input, signal } from '@angular/core';

@Component({
  selector: 'app-markdown-preview',
  templateUrl: './markdown-preview.html',
  styleUrl: './markdown-preview.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Content arrives as innerHTML from marked, so component styles must reach
  // past Angular's emulated encapsulation to style it — scoped by the
  // .markdown-preview class below instead.
  encapsulation: ViewEncapsulation.None,
})
export class MarkdownPreviewComponent {
  readonly markdown = input('');

  // Plain string, not a SafeHtml wrapper: bound via [innerHTML] below, Angular's
  // own template sanitizer strips unsafe content — no bypassSecurityTrustHtml needed.
  protected readonly renderedHtml = signal('');

  constructor() {
    effect(() => {
      const source = this.markdown();
      void this.render(source);
    });
  }

  private async render(source: string): Promise<void> {
    const { parse } = await import('marked');
    const html = await parse(source, { breaks: true });
    this.renderedHtml.set(html);
  }
}
