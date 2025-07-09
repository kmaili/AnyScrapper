import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Required for ngModel

/**
 * @file src/app/shared/components/select-input/select-input.component.ts
 * @description Reusable select dropdown component with ngModel support.
 */
@Component({
  selector: 'app-select-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <select
      class="select-field p-2 border border-gray-300 rounded-md w-full mt-1 bg-white"
      [ngModel]="value"
      (ngModelChange)="onValueChange($event)"
      [disabled]="disabled"
    >
      <option *ngIf="placeholder" [value]="null" disabled>{{ placeholder }}</option>
      <option *ngFor="let option of options" [value]="option.value">
        {{ option.label }}
      </option>
    </select>
  `,
  styles: [`
    /* No component-specific styles, using Tailwind directly */
  `]
})
export class SelectInputComponent {
  @Input() value: any;
  @Input() options: { label: string; value: any }[] = [];
  @Input() placeholder: string = '';
  @Input() disabled: boolean = false;
  @Output() valueChange = new EventEmitter<any>();

  /**
   * Emits the new value when the select input changes.
   * @param newValue The new value from the select input.
   */
  onValueChange(newValue: any): void {
    this.valueChange.emit(newValue);
  }
}
