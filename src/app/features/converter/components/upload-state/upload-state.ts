import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { ConversionError } from '../../../../core/models/conversion.model';
import { FileUploadComponent } from '../../../../shared/components/file-upload/file-upload';

@Component({
  selector: 'app-upload-state',
  imports: [FileUploadComponent],
  templateUrl: './upload-state.html',
  styleUrl: './upload-state.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadStateComponent {
  readonly notice = input<ConversionError | null>(null);
  readonly fileSelected = output<File>();
}
