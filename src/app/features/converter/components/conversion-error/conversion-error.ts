import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { ConversionError } from '../../../../core/models/conversion.model';

@Component({
  selector: 'app-conversion-error',
  templateUrl: './conversion-error.html',
  styleUrl: './conversion-error.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConversionErrorComponent {
  readonly error = input.required<ConversionError>();
  readonly retry = output<void>();
  readonly chooseAnother = output<void>();
}
