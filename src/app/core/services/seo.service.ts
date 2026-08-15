import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';

export const SITE_URL = 'https://anydocllm.rvnk.in';

export interface RouteSeoData {
  /** Route path with no leading slash, e.g. '' for home or 'convert'. */
  readonly path: string;
  readonly description: string;
  readonly robots: string;
}

/**
 * Angular's Router already sets document.title from each route's `title`
 * property. This covers what that doesn't: per-route meta description,
 * robots directive, and a self-referencing canonical link — needed because
 * every route shares the same static index.html.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  update(data: RouteSeoData): void {
    this.meta.updateTag({ name: 'description', content: data.description });
    this.meta.updateTag({ name: 'robots', content: data.robots });

    let link = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', `${SITE_URL}/${data.path}`);
  }
}
