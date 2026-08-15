import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';
import { SUPPORTED_FORMATS } from '../../../core/models/supported-file.model';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.html',
  styleUrl: './file-upload.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileUploadComponent {
  protected readonly formats = SUPPORTED_FORMATS;
  protected readonly accept = SUPPORTED_FORMATS.map((f) => `.${f.extension}`).join(',');
  protected readonly isDragOver = signal(false);

  readonly fileSelected = output<File>();

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(true);
  }

  protected onDragLeave(): void {
    this.isDragOver.set(false);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) this.fileSelected.emit(file);
  }

  protected onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (file) this.fileSelected.emit(file);
  }
}
