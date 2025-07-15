import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * @file src/app/shared/components/button/button.component.ts
 * @description Reusable button component.
 * It supports different styles and emits a click event.
 */
@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [ngClass]="getButtonClasses()"
      (click)="onClick.emit($event)"
      [type]="type"
      [disabled]="disabled"
    >
      <ng-content></ng-content>
    </button>
  `,
  styles: [`
    /* Tailwind classes are used directly in the template via [ngClass] */
    /* Custom styles for button component if needed, but Tailwind is preferred */
  `]
})
export class ButtonComponent {
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() styleType: 'primary' | 'secondary' | 'danger' | 'small' = 'primary';
  @Input() disabled: boolean = false;
  @Output() onClick = new EventEmitter<Event>();

  /**
   * Dynamically generates CSS classes based on the styleType input.
   * @returns A string of Tailwind CSS classes.
   */
  getButtonClasses(): string {
    let classes = 'btn py-3 px-6 rounded-lg font-semibold transition-colors duration-200 ease-in-out cursor-pointer';

    switch (this.styleType) {
      case 'primary':
        classes += ' bg-blue-500 text-white hover:bg-blue-600';
        break;
      case 'secondary':
        classes += ' bg-gray-600 text-white hover:bg-gray-700';
        break;
      case 'danger':
        classes += ' bg-red-500 text-white hover:bg-red-600';
        break;
      case 'small':
        classes = 'btn py-1 px-3 text-sm rounded-md font-semibold transition-colors duration-200 ease-in-out cursor-pointer';
        classes += ' bg-blue-500 text-white hover:bg-blue-600'; // Default small to primary color
        break;
    }

    if (this.disabled) {
      classes += ' opacity-50 cursor-not-allowed';
    }

    return classes;
  }
}
