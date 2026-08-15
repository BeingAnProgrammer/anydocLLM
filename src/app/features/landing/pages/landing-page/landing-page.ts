import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SUPPORTED_FORMATS } from '../../../../core/models/supported-file.model';
import { SeoService } from '../../../../core/services/seo.service';
import { PreviewDemoComponent } from '../../components/preview-demo/preview-demo';

@Component({
  selector: 'app-landing-page',
  imports: [RouterLink, PreviewDemoComponent],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPageComponent implements OnInit {
  private readonly seoService = inject(SeoService);

  protected readonly formats = SUPPORTED_FORMATS;

  ngOnInit(): void {
    this.seoService.update({
      path: '',
      description:
        'Convert PDF, DOCX, XLSX, PPTX, CSV and more into clean, LLM-ready Markdown — entirely in your browser. Free and open source, no upload, no account.',
      robots: 'index, follow',
    });
  }
}
