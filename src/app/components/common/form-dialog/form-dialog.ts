import { Component, contentChild, input, output, TemplateRef } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-form-dialog',
  imports: [DialogModule, ButtonModule, ReactiveFormsModule, NgTemplateOutlet],
  templateUrl: './form-dialog.html',
  styleUrl: './form-dialog.scss',
})
export class FormDialog<T extends Record<string, any>> {
  // signals
  visible = input<boolean>(false);
  title = input<string>('');
  submitLabel = input<string>('Save');
  form = input.required<FormGroup<T>>();

  formFieldsTemplate = contentChild.required(TemplateRef);

  // outputs
  onVisibleChange = output<boolean>();
  onSubmit = output<ReturnType<FormGroup['getRawValue']>>();
  submissionInProgress = input<boolean>(false);

  handleSubmit() {
    if (this.form().invalid) {
      this.form().markAllAsTouched();
      return;
    }
    this.onSubmit.emit(this.form().getRawValue());
  }

  close() {
    this.form().reset();
    this.onVisibleChange.emit(false);
  }
}
