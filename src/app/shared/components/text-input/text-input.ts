import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Required for ngModel

/**
 * @file src/app/shared/components/text-input/text-input.component.ts
 * @description Reusable text input component with ngModel support.
 */
@Component({
  selector: 'app-text-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <input
      [type]="type"
      class="input-field p-2 border border-gray-300 rounded-md w-full mt-1"
      [placeholder]="placeholder"
      [ngModel]="value"
      (ngModelChange)="onValueChange($event)"
      [min]="min"
      [disabled]="disabled"
    />
  `,
  styles: [`
    /* No component-specific styles, using Tailwind directly */
  `]
})
export class TextInputComponent {
  @Input() value: string | number | null = '';
  @Input() placeholder: string = '';
  @Input() type: 'text' | 'number' | 'url' = 'text';
  @Input() min?: number; // Only relevant for type 'number'
  @Input() disabled: boolean = false;
  @Output() valueChange = new EventEmitter<string | number | null>();

  /**
   * Emits the new value when the input changes.
   * @param newValue The new value from the input.
   */
  onValueChange(newValue: string | number | null): void {
    this.valueChange.emit(newValue);
  }
}
