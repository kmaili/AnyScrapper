import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // For ngModel
import { ProcessDataService } from '../../../../core/process-data/process-data';
import {
  Step,
  ActionStep,
  ConditionStep,
  LoopStep,
  ActionType,
  PageActionName,
  ElementActionName,
  ContainerActionName,
  ConditionType,
  LoopType,
  LoopCondition
} from '../../models/process.model';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { SelectInputComponent } from '../../../../shared/components/select-input/select-input';
import { TextInputComponent } from '../../../../shared/components/text-input/text-input';

/**
 * @file src/app/features/task-creation/ui/process-step/process-step.component.ts
 * @description Standalone component for rendering a single web scraping process step.
 * It handles displaying step details and emitting events for modifications.
 * This component is recursive, rendering nested steps as needed.
 */
@Component({
  selector: 'app-process-step',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    SelectInputComponent,
    TextInputComponent,
    // Self-import for recursion
    ProcessStepComponent
  ],
  templateUrl: './process-step.html',
  styleUrls: ['./process-step.scss']
})
export class ProcessStepComponent {
  @Input() step!: Step;
  @Input() path!: (string | number)[];

  // Outputs for events that modify the process data
  @Output() updateStep = new EventEmitter<{ path: (string | number)[], property: string, value: any, subProperty?: string }>();
  @Output() deleteStep = new EventEmitter<(string | number)[]>();
  @Output() addNestedStep = new EventEmitter<{ parentPath: (string | number)[], nestedType: string, stepTypeToAdd: 'action' | 'condition' | 'loop' }>();

  // Expose test selectors from the service
  readonly testSelectors: string[];

  // Options for dropdowns
  readonly stepTypes = [
    { label: 'Action', value: 'action' },
    { label: 'Condition', value: 'condition' },
    { label: 'Loop', value: 'loop' }
  ];

  readonly actionTypes = [
    { label: 'Page Action', value: 'page' },
    { label: 'Element Action', value: 'element' },
    { label: 'Container (Sequence) Action', value: 'container' }
  ];

  readonly pageActionNames = [
    { label: 'Scroll Down', value: 'scroll_down' },
    { label: 'Scroll Up', value: 'scroll_up' },
    { label: 'Refresh', value: 'refresh' },
    { label: 'Go Back', value: 'back' },
    { label: 'Go Forward', value: 'forward' },
    { label: 'Visit Link', value: 'visit_link' }
  ];

  readonly elementActionNames = [
    { label: 'Get Text', value: 'get_text' },
    { label: 'Click', value: 'click' },
    { label: 'Long Click', value: 'long_click' },
    { label: 'Right Click', value: 'right_click' },
    { label: 'Double Click', value: 'double_click' },
    { label: 'Get Attribute', value: 'get_attribute' },
    { label: 'Get Inner HTML', value: 'get_inner_html' }
  ];

  readonly containerActionNames = [
    { label: 'Sequence (Group Steps)', value: 'sequence' }
  ];

  readonly conditionTypes = [
    { label: 'Element Found', value: 'element_found' },
    { label: 'Element Not Found', value: 'element_not_found' },
    { label: 'Element Attribute Equals', value: 'element_attribute_equals' },
    { label: 'Element Attribute Not Equals', value: 'element_attribute_not_equals' }
  ];

  readonly loopTypes = [
    { label: 'Fixed Iterations', value: 'fixed_iterations' },
    { label: 'Until Condition', value: 'until_condition' }
  ];

  constructor(public processDataService: ProcessDataService) { // Inject ProcessDataService for utility functions
    this.testSelectors = this.processDataService.testSelectors;
  }

  /**
   * Helper to cast step to ActionStep for template type narrowing.
   */
  get actionStep(): ActionStep | undefined {
    return this.step.type === 'action' ? (this.step as ActionStep) : undefined;
  }

  /**
   * Helper to cast step to ConditionStep for template type narrowing.
   */
  get conditionStep(): ConditionStep | undefined {
    return this.step.type === 'condition' ? (this.step as ConditionStep) : undefined;
  }

  /**
   * Helper to cast step to LoopStep for template type narrowing.
   */
  get loopStep(): LoopStep | undefined {
    return this.step.type === 'loop' ? (this.step as LoopStep) : undefined;
  }

  /**
   * Getter for selector options for app-select-input.
   * @returns An array of { label: string, value: string } for selectors.
   */
  get selectorOptions(): { label: string, value: string }[] {
    return this.testSelectors.map(s => ({ label: s, value: s }));
  }

  /**
   * Getter for condition selector options for app-select-input.
   * @returns An array of { label: string, value: string } for selectors.
   */
  get conditionSelectorOptions(): { label: string, value: string }[] {
    return this.testSelectors.map(s => ({ label: s, value: s }));
  }

  /**
   * Getter for loop condition selector options for app-select-input.
   * @returns An array of { label: string, value: string } for selectors.
   */
  get loopConditionSelectorOptions(): { label: string, value: string }[] {
    return this.testSelectors.map(s => ({ label: s, value: s }));
  }

  /**
   * Emits an update event for a step property.
   * @param property The property name to update.
   * @param value The new value.
   * @param subProperty Optional sub-property name.
   */
  onUpdateStep(property: string, value: any, subProperty?: string): void {
    this.updateStep.emit({ path: this.path, property, value, subProperty });
  }

  /**
   * Emits a delete event for the current step.
   */
  onDeleteStep(): void {
    this.deleteStep.emit(this.path);
  }

  /**
   * Emits an event to add a nested step.
   * @param nestedType The type of nested array ('ifTrue', 'ifFalse', 'steps').
   * @param stepTypeToAdd The type of step to add ('action', 'condition', 'loop').
   */
  onAddNestedStep(nestedType: string, stepTypeToAdd: 'action' | 'condition' | 'loop'): void {
    this.addNestedStep.emit({ parentPath: this.path, nestedType, stepTypeToAdd });
  }

  /**
   * Constructs the path for a nested step.
   * This method replaces the spread operator in the template.
   * @param nestedStepsArray The array containing the nested step (e.g., actionStep.steps).
   * @param nestedStep The specific nested step item.
   * @param nestedArrayKey The key representing the nested array in the parent step (e.g., 'steps', 'ifTrue').
   * @returns The full path array for the nested step.
   */
  getNestedPath(nestedStepsArray: any[], nestedStep: any, nestedArrayKey: string): (string | number)[] {
    const index = nestedStepsArray.indexOf(nestedStep);
    return [...this.path, nestedArrayKey, index];
  }

  /**
   * Provides trackBy function for *ngFor performance.
   * @param index The index of the item.
   * @param item The item itself.
   * @returns A unique identifier for the item.
   */
  trackByFn(index: number, item: any): any {
    return index; // Simple index tracking for demonstration
  }
}
