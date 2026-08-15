import { Injectable } from '@angular/core';

/** Triggers a browser download of Markdown content. No backend involved. */
@Injectable({ providedIn: 'root' })
export class DownloadService {
  downloadMarkdown(markdown: string, fileName: string): void {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
