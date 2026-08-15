import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { SelectedDocument } from '../../../../core/models/document.model';

@Component({
  selector: 'app-selected-file',
  templateUrl: './selected-file.html',
  styleUrl: './selected-file.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectedFileComponent {
  readonly document = input.required<SelectedDocument>();
  readonly convert = output<void>();
  readonly remove = output<void>();
}
