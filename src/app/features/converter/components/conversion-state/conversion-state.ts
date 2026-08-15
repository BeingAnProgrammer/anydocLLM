import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CONVERSION_STAGES } from '../../../../core/models/conversion.model';
import type { SelectedDocument } from '../../../../core/models/document.model';

@Component({
  selector: 'app-conversion-state',
  templateUrl: './conversion-state.html',
  styleUrl: './conversion-state.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConversionStateComponent {
  protected readonly stages = CONVERSION_STAGES;

  readonly document = input.required<SelectedDocument>();
  /** Index of the stage currently in progress. Stages before it are done. */
  readonly stageIndex = input(0);
}
