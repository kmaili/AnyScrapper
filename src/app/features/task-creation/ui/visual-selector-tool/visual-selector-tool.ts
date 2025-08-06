import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { DomElementsSelectorWsService } from '../../data-access/dom-elements-selector/real-time-dom-elemnts-selector.service';
import { DomElement } from '../../models/dom-element.model';
import { HttpClientModule } from '@angular/common/http';
import { Workflow } from '../../models/workflow.model';
import { Step } from '../../models/step.model';
import { SelectOption, CustomSelectComponent } from '../custom-select/custom-select';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkflowService } from '../../data-access/workflow/workflow.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-visual-selector-tool',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, CustomSelectComponent],
  templateUrl: './visual-selector-tool.html',
  styleUrls: ['./visual-selector-tool.css']
})
export class VisualSelectorToolComponent implements OnInit, OnDestroy {
  @Input() steps: Step[] = [];
  @Input() initialized_workflow: Workflow = {
    name: '',
    startUrl: '',
    steps: []
  };
  @Output() stepsChange = new EventEmitter<Step[]>();
  @Output() workflow = new EventEmitter<Workflow>();

  @Input() isRoot: boolean = true;
  @Input() isEditing: boolean = false;

  @Input() parentStep!: Step;

  domElements: DomElement[] = [];
  private wsSubscription!: Subscription;

  isExpanded: { [key: number]: boolean } = {};

  ACTION_TYPE_CHOICES: SelectOption[] = [
    { value: 'data_collection', label: 'Data Collection', icon: 'data_exploration' },
    { value: 'interaction', label: 'Interaction', icon: 'touch_app' },
  ];

  INTERACTION_ACTION_CHOICES: SelectOption[] = [
    { value: 'element_click', label: 'Element Click', icon: 'mouse', action_type: 'interaction' },
    { value: 'element_right_click', label: 'Element Right Click', icon: 'mouse', action_type: 'interaction' },
    { value: 'element_double_click', label: 'Element Double Click', icon: 'double_arrow', action_type: 'interaction' },
    { value: 'element_hover', label: 'Element Hover', icon: 'pan_tool', action_type: 'interaction' },
    { value: 'element_input_text', label: 'Element Input Text', icon: 'edit', action_type: 'interaction' },
    { value: 'element_clear_input', label: 'Element Clear Input', icon: 'clear', action_type: 'interaction' },
    { value: 'element_long_press', label: 'Element Long Press', icon: 'touch_app', action_type: 'interaction' },
    { value: 'page_scroll_up', label: 'Page Scroll Up', icon: 'arrow_upward', action_type: 'interaction' },
    { value: 'page_scroll_down', label: 'Page Scroll Down', icon: 'arrow_downward', action_type: 'interaction' },
    { value: 'page_refresh', label: 'Page Refresh', icon: 'refresh', action_type: 'interaction' },
    { value: 'page_navigate', label: 'Page Navigate', icon: 'open_in_new', action_type: 'interaction' },
    { value: 'page_go_back', label: 'Page Go Back', icon: 'arrow_back', action_type: 'interaction' },
    { value: 'page_go_forward', label: 'Page Go Forward', icon: 'arrow_forward', action_type: 'interaction' },
    { value: 'scroll_to_element', label: 'Scroll to Element', icon: 'vertical_align_center', action_type: 'interaction' },
  ];

  DATA_COLLECTION_ACTION_CHOICES: SelectOption[] = [
    { value: 'element_text', label: 'Element Text Extraction', icon: 'text_fields', action_type: 'data_collection' },
    { value: 'element_get_inner_html', label: 'Element Get Inner HTML', icon: 'code', action_type: 'data_collection' },
    { value: 'element_get_attribute_value', label: 'Element Get Attribute Value', icon: 'description', action_type: 'data_collection' },
    { value: 'element_check_attribute_value_equals', label: 'Element Check Attribute Value Equals', icon: 'check_circle', action_type: 'data_collection' },
    { value: 'element_check_attribute_value_not_equals', label: 'Element Check Attribute Value Not Equals', icon: 'not_equal', action_type: 'data_collection' },
    { value: 'element_check_attribute_exists', label: 'Element Check Attribute Exists', icon: 'check_circle_outline', action_type: 'data_collection' },
    { value: 'element_check_attribute_value_contains', label: 'Element Check Attribute Value Contains', icon: 'search', action_type: 'data_collection' },
    { value: 'element_check_attribute_value_starts_with', label: 'Element Check Attribute Value Starts With', icon: 'format_color_text', action_type: 'data_collection' },
    { value: 'element_check_attribute_value_ends_with', label: 'Element Check Attribute Value Ends With', icon: 'format_color_text', action_type: 'data_collection' },
  ];

  CONDITION_TYPE_CHOICES: SelectOption[] = [
    { value: 'element_found', label: 'Element Found', icon: 'visibility' },
    { value: 'element_not_found', label: 'Element Not Found', icon: 'visibility_off' },
    { value: 'element_text_equals', label: 'Element Text Equals', icon: 'compare_arrows' },
    { value: 'element_text_contains', label: 'Element Text Contains', icon: 'search' },
    { value: 'element_attribute_equals', label: 'Element Attribute Equals', icon: 'compare_arrows' },
    { value: 'element_attribute_not_equals', label: 'Element Attribute Not Equals', icon: 'not_equal' },
    { value: 'element_attribute_exists', label: 'Element Attribute Exists', icon: 'check_circle_outline' },
    { value: 'element_attribute_contains', label: 'Element Attribute Contains', icon: 'search' },
    { value: 'element_attribute_starts_with', label: 'Element Attribute Starts With', icon: 'format_color_text' },
    { value: 'element_attribute_ends_with', label: 'Element Attribute Ends With', icon: 'format_color_text' },
  ];

  ALL_ACTION_CHOICES: SelectOption[] = [...this.INTERACTION_ACTION_CHOICES, ...this.DATA_COLLECTION_ACTION_CHOICES];

  actionTypeChanged = new EventEmitter<{ stepId: number; newType: string }>();

  constructor(
    private wsService: DomElementsSelectorWsService,
  ) {}

  ngOnInit() {
    const useChildIterableSelector = (this.parentStep && this.parentStep.loop
    && this.parentStep.loop.loop_type === 'iterate_over_elements') ? true : undefined;
    
    if (!this.steps || this.steps.length === 0) {
      this.steps = [
        {
          id: 1,
          step_type: 'action',
          order: 1,
          workflow: 1,

            useChildIterableSelector: useChildIterableSelector,
          action: {
            step: 1,
            action_type: 'data_collection',
            action_name: 'element_text',
            fallback_selector: undefined,
          }
        }
      ];
      this.emitChanges();
    }

    this.steps.forEach((_, i) => this.isExpanded[i] = true);

    this.wsService.connect('ws://localhost:8000/ws/dom-elements/', 'http://localhost:8000/api/dom-elements/');

    this.wsSubscription = this.wsService.domElements$.subscribe(elements => {
      this.domElements = elements;
      this.emitChanges();
    });
  }

  ngOnDestroy() {
    this.wsSubscription.unsubscribe();
    this.wsService.disconnect();
  }

  private mapDomElementToSelector(element: DomElement): number {
    return element.id;
  }

addStep(type: 'action' | 'condition' | 'loop') {
  const newId = this.steps.length > 0 ? Math.max(...this.steps.map(s => s.id)) + 1 : 1;
  const useChildIterableSelector = (this.parentStep && this.parentStep.loop
    && this.parentStep.loop.loop_type === 'iterate_over_elements') ? true : undefined;
  let newStep: Step;

  if (type === 'action') {
    newStep = {
      id: newId,
      step_type: 'action',
      order: this.steps.length + 1,
      workflow: this.initialized_workflow.steps.length > 0 ? this.initialized_workflow.steps[0].workflow : 1,

        useChildIterableSelector: useChildIterableSelector,
      action: {
        step: newId,
        action_type: 'data_collection',
        action_name: 'element_text',
        fallback_selector: undefined,
      }
    };
  } else if (type === 'condition') {
    newStep = {
      id: newId,
      step_type: 'condition',
      order: this.steps.length + 1,
      workflow: this.initialized_workflow.steps.length > 0 ? this.initialized_workflow.steps[0].workflow : 1,
        useChildIterableSelector: useChildIterableSelector,
      condition: {
        step: newId,
        condition_type: 'element_found',
        selector: undefined,
        fallback_selector: undefined,
        if_true_child_steps: [],
        if_false_child_steps: [],
      }
    };
  } else {
    newStep = {
      id: newId,
      step_type: 'loop',
      order: this.steps.length + 1,
      workflow: this.initialized_workflow.steps.length > 0 ? this.initialized_workflow.steps[0].workflow : 1,
      useChildIterableSelector: useChildIterableSelector,
      loop: {
        step: newId,
        loop_type: 'fixed_iterations',
        iterations_count: 1,
        child_steps: [],
        condition_element_selector: undefined,
        fallback_selector: undefined,
        parent_iterable_element_selector: undefined,
        parent_iterable_element_selector_fallback: undefined,
        child_iterable_element_selector: undefined,
        child_iterable_element_selector_fallback: undefined
      }
    };
  }
  this.steps.push(newStep);
  this.isExpanded[this.steps.length - 1] = true;
  this.reorderSteps();
  this.emitChanges();
}

addStepBefore(index: number, type: 'action' | 'condition' | 'loop', event: Event) {
  event.stopPropagation();
  const newId = this.steps.length > 0 ? Math.max(...this.steps.map(s => s.id)) + 1 : 1;
  let newStep: Step;

  if (type === 'action') {
    newStep = {
      id: newId,
      step_type: 'action',
      order: this.steps[index].order,
      workflow: this.initialized_workflow.steps.length > 0 ? this.initialized_workflow.steps[0].workflow : 1,
      action: {
        step: newId,
        action_type: 'data_collection',
        action_name: 'element_text',
        fallback_selector: undefined
      }
    };
  } else if (type === 'condition') {
    newStep = {
      id: newId,
      step_type: 'condition',
      order: this.steps[index].order,
      workflow: this.initialized_workflow.steps.length > 0 ? this.initialized_workflow.steps[0].workflow : 1,
      condition: {
        step: newId,
        condition_type: 'element_found',
        selector: undefined,
        fallback_selector: undefined,
        if_true_child_steps: [],
        if_false_child_steps: []
      }
    };
  } else {
    newStep = {
      id: newId,
      step_type: 'loop',
      order: this.steps[index].order,
      workflow: this.initialized_workflow.steps.length > 0 ? this.initialized_workflow.steps[0].workflow : 1,
      loop: {
        step: newId,
        loop_type: 'fixed_iterations',
        iterations_count: 1,
        child_steps: [],
        condition_element_selector: undefined,
        fallback_selector: undefined,
        parent_iterable_element_selector: undefined,
        parent_iterable_element_selector_fallback: undefined,
        child_iterable_element_selector: undefined,
        child_iterable_element_selector_fallback: undefined
      }
    };
  }
  this.steps.splice(index, 0, newStep);
  this.isExpanded[index] = true;
  this.reorderSteps();
  this.emitChanges();
}

  duplicateStep(index: number, event: Event) {
    event.stopPropagation();
    const stepToDuplicate = this.steps[index];
    const newId = this.steps.length > 0 ? Math.max(...this.steps.map(s => s.id)) + 1 : 1;
    const newStep: Step = JSON.parse(JSON.stringify(stepToDuplicate)); // Deep copy
    newStep.id = newId;
    newStep.order = stepToDuplicate.order + 1;

    if (newStep.action) {
      newStep.action.step = newId;
      newStep.action.fallback_selector = stepToDuplicate.action?.fallback_selector || undefined; // Copy fallback_selector
    }
    if (newStep.condition) {
      newStep.condition.step = newId;
      newStep.condition.fallback_selector = stepToDuplicate.condition?.fallback_selector || undefined; // Copy fallback_selector
      newStep.condition.if_true_child_steps = this.deepCopySteps(newStep.condition.if_true_child_steps!, newId);
      newStep.condition.if_false_child_steps = this.deepCopySteps(newStep.condition.if_false_child_steps!, newId);
    }
    if (newStep.loop) {
      newStep.loop.step = newId;
      newStep.loop.fallback_selector = stepToDuplicate.loop?.fallback_selector || undefined; // Copy fallback_selector
      newStep.loop.child_steps = this.deepCopySteps(newStep.loop.child_steps, newId);
    }

    this.steps.splice(index + 1, 0, newStep);
    this.isExpanded[index + 1] = true;
    this.reorderSteps();
    this.emitChanges();
  }

  private deepCopySteps(steps: Step[] | undefined, parentStepId: number): Step[] {
    if (!steps) return [];
    const newIdBase = this.steps.length > 0 ? Math.max(...this.steps.map(s => s.id)) + 1 : 1;
    return steps.map((step, i) => {
      const newStep: Step = JSON.parse(JSON.stringify(step));
      newStep.id = newIdBase + i;
      newStep.order = i + 1;
      newStep.workflow = step.workflow;
      newStep.parent_loop = step.parent_loop || parentStepId;

      if (newStep.action) {
        newStep.action.step = newStep.id;
        newStep.action.fallback_selector = step.action?.fallback_selector || undefined; // Copy fallback_selector
      }
      if (newStep.condition) {
        newStep.condition.step = newStep.id;
        newStep.condition.fallback_selector = step.condition?.fallback_selector || undefined; // Copy fallback_selector
        newStep.condition.if_true_child_steps = this.deepCopySteps(newStep.condition.if_true_child_steps!, newStep.id);
        newStep.condition.if_false_child_steps = this.deepCopySteps(newStep.condition.if_false_child_steps!, newStep.id);
      }
      if (newStep.loop) {
        newStep.loop.step = newStep.id;
        newStep.loop.fallback_selector = step.loop?.fallback_selector || undefined; // Copy fallback_selector
        newStep.loop.child_steps = this.deepCopySteps(newStep.loop.child_steps, newStep.id);
      }
      return newStep;
    });
  }

  deleteStep(index: number, event: Event) {
    event.stopPropagation();
    this.steps.splice(index, 1);
    delete this.isExpanded[index];
    const newIsExpanded: { [key: number]: boolean } = {};
    this.steps.forEach((_, i) => {
      if (typeof this.isExpanded[i] !== 'undefined') {
        newIsExpanded[i] = this.isExpanded[i];
      } else if (typeof this.isExpanded[i + 1] !== 'undefined') {
        newIsExpanded[i] = this.isExpanded[i + 1];
      } else {
        newIsExpanded[i] = true;
      }
    });
    this.isExpanded = newIsExpanded;
    this.reorderSteps();
    this.emitChanges();
  }


  updateStepType(index: number, stepType: 'action' | 'condition' | 'loop') {
    const originalStep = this.steps[index];
    const newId = originalStep.id;
    let newStep: Step;
    const useChildIterableSelector = (this.parentStep && this.parentStep.loop
    && this.parentStep.loop.loop_type === 'iterate_over_elements') ? true : undefined;
    if (stepType === 'action') {
      newStep = {
        id: newId,
        step_type: 'action',
        order: originalStep.order,
        workflow: originalStep.workflow,
        useChildIterableSelector: useChildIterableSelector,
        action: {
          step: newId,
          action_type: 'data_collection',
          action_name: 'element_text',
        }
      };
    } else if (stepType === 'condition') {
      newStep = {
        id: newId,
        step_type: 'condition',
        order: originalStep.order,
        workflow: originalStep.workflow,
          useChildIterableSelector: useChildIterableSelector,
        condition: {
          step: newId,
          condition_type: 'element_found',
          selector: undefined,
          if_true_child_steps: [],
          if_false_child_steps: [],
        }
      };
    } else {
      newStep = {
        id: newId,
        step_type: 'loop',
        order: originalStep.order,
        workflow: originalStep.workflow,

          useChildIterableSelector: useChildIterableSelector,
        loop: {
          step: newId,
          loop_type: 'fixed_iterations',
          iterations_count: 1,
          child_steps: [],
        }
      };
    }
    this.steps[index] = newStep;
    this.reorderSteps();
    this.emitChanges();
  }

  updateActionType(index: number, actionType: string) {
    const step = this.steps[index];
    if (step.step_type !== 'action' || !step.action) return;
    const oldType = step.action.action_type;
    step.action.action_type = actionType as 'interaction' | 'data_collection';

    
    if (actionType === 'interaction') {
      step.action.action_name = 'page_scroll_down';
      step.action.selector = undefined;
      delete step.action.attribute;
      delete step.action.expected_value;
      delete step.action.url;
    } else if (actionType === 'data_collection') {
      step.action.action_name = 'element_text';
      step.action.selector = undefined;
      delete step.action.attribute;
      delete step.action.expected_value;
      delete step.action.url;
    }
    if (oldType !== actionType) {
      this.actionTypeChanged.emit({ stepId: step.id, newType: actionType });
    }
    this.emitChanges();
  }

  updateActionName(index: number, actionName: string) {
    const step = this.steps[index];
    if (step.step_type !== 'action' || !step.action) return;
    const oldType = step.action.action_type;
    step.action.action_name = actionName;

    const action_type = this.getActionType(actionName);
    step.action.action_type = action_type;

    if (actionName === 'page_navigate') {
      step.action.url = step.action.url || '';
      delete step.action.attribute;
      delete step.action.expected_value;
      delete step.action.fallback_selector; // Clear fallback if not needed
    } else if (this.requiresSelector(actionName)) {
      step.action.selector = step.action.selector || undefined;
      step.action.fallback_selector = step.action.fallback_selector || undefined; // Preserve or initialize fallback
      delete step.action.url;
      if (actionName.includes('element_check_attribute_value_')) {
        step.action.expected_value = step.action.expected_value || '';
      } else {
        delete step.action.expected_value;
      }
      if (actionName === 'element_get_attribute_value' || actionName.includes('element_check_attribute')) {
        step.action.attribute = step.action.attribute || '';
      } else {
        delete step.action.attribute;
      }
    } else {
      delete step.action.selector;
      delete step.action.fallback_selector;
      delete step.action.url;
      delete step.action.attribute;
      delete step.action.expected_value;
    }
    if (this.getActionType(actionName) !== oldType) {
      this.actionTypeChanged.emit({ stepId: step.id, newType: action_type });
    }
    this.emitChanges();
  }

  updateLoopType(index: number, loopType: 'fixed_iterations' | 'until_condition' | 'iterate_over_elements') {
  const step = this.steps[index];
  if (step.step_type !== 'loop' || !step.loop) return;
  step.loop.loop_type = loopType;


  if (loopType === 'fixed_iterations') {
    delete step.loop.condition_type;
    delete step.loop.condition_element_selector;
    delete step.loop.fallback_selector;
    delete step.loop.condition_element_attribute;
    delete step.loop.condition_attribute_value;
    step.loop.iterations_count = step.loop.iterations_count || 1;
    step.loop.child_steps?.forEach(step => { this.useChildIterableSelectorInStep(step, undefined) })
  } else if (loopType === 'until_condition') {
    delete step.loop.iterations_count;
    step.loop.condition_element_selector = step.loop.condition_element_selector || undefined;
    step.loop.fallback_selector = step.loop.fallback_selector || undefined;
    step.loop.condition_type = step.loop.condition_type || 'element_found';
    step.loop.child_steps?.forEach(step => { this.useChildIterableSelectorInStep(step, undefined) })

  } else if (loopType === 'iterate_over_elements') {
    delete step.loop.iterations_count;
    delete step.loop.condition_type;
    delete step.loop.condition_element_selector;
    delete step.loop.fallback_selector;
    delete step.loop.condition_element_attribute;
    delete step.loop.condition_attribute_value;
    step.loop.parent_iterable_element_selector = step.loop.parent_iterable_element_selector || undefined;
    step.loop.parent_iterable_element_selector_fallback = step.loop.parent_iterable_element_selector_fallback || undefined;
    step.loop.child_iterable_element_selector = step.loop.child_iterable_element_selector || undefined;
    step.loop.child_iterable_element_selector_fallback = step.loop.child_iterable_element_selector_fallback || undefined;
    step.loop.child_steps?.forEach(step => { this.useChildIterableSelectorInStep(step, false) })
  }
  this.emitChanges();
}

  useChildIterableSelectorInStep(step: Step, isUsed: undefined | boolean){
    step.useChildIterableSelector = isUsed
  }


  onNestedStepsChange(parentStep: Step, branch: 'if_true_child_steps' | 'if_false_child_steps' | 'child_steps', updatedSteps: Step[]) {
    if (parentStep.step_type === 'condition' && parentStep.condition && (branch === 'if_true_child_steps' || branch === 'if_false_child_steps')) {
      if (parentStep.condition) {
        parentStep.condition[branch] = updatedSteps;
      }
    } else if (parentStep.step_type === 'loop' && parentStep.loop && branch === 'child_steps') {
      if (parentStep.loop) {
        parentStep.loop.child_steps = updatedSteps;
      }
    }
    this.reorderSteps();
    this.emitChanges();
  }

  toggleCollapse(index: number) {
    this.isExpanded[index] = !this.isExpanded[index];
  }

  exportToJson() {
    console.log('Steps data before export:', this.steps);
    try {
      const exportableSteps = this.steps.map(step => ({
        ...step,
        action: step.action ? { ...step.action, extractedData: step.action.result } : undefined,
        condition: step.condition ? { ...step.condition } : undefined,
        loop: step.loop ? { ...step.loop } : undefined
      }));
      const jsonString = JSON.stringify({ workflow: this.initialized_workflow, steps: exportableSteps }, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'process-steps.json';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting JSON:', error);
      alert('Failed to export JSON. Check console for details.');
    }
  }

  emitChanges() {
    this.stepsChange.emit([...this.steps]);
  }

  private reorderSteps() {
    this.steps.sort((a, b) => a.order - b.order);
    let currentOrder = 1;
    this.steps.forEach(step => {
      step.order = currentOrder++;
      if (step.condition) {
        if (step.condition.if_true_child_steps) step.condition.if_true_child_steps.forEach(s => s.order = currentOrder++);
        if (step.condition.if_false_child_steps) step.condition.if_false_child_steps.forEach(s => s.order = currentOrder++);
      }
      if (step.loop && step.loop.child_steps) {
        step.loop.child_steps.forEach(s => s.order = currentOrder++);
      }
    });
  }

  getStepLabel(step: Step): string {
    if (step.step_type === 'action' && step.action) {
      const actionName = this.getAllActionChoices().find(choice => choice.value === step.action?.action_name)?.label;
      return `Action: ${actionName || 'Unnamed'}`;
    }
    if (step.step_type === 'condition' && step.condition) {
      return `Condition: ${step.condition.condition_type || 'Unnamed'}`;
    }
    if (step.step_type === 'loop' && step.loop) {
      return `Loop: ${step.loop.loop_type || 'Unnamed'}`;
    }
    return 'Unnamed Step';
  }

  getStepClasses(step: Step): { [key: string]: boolean } {
    return {
      'action': step.step_type === 'action',
      'condition': step.step_type === 'condition',
      'loop': step.step_type === 'loop',
      'bg-purple-50': step.step_type === 'action'
    };
  }

  getIconForStep(type: string): string {
    switch (type) {
      case 'action':
        return 'play_arrow';
      case 'condition':
        return 'rule';
      case 'loop':
        return 'loop';
      default:
        return 'help_outline';
    }
  }

  completeWorkflow() {
    this.workflow.emit({
      name: this.initialized_workflow.name,
      startUrl: this.initialized_workflow.startUrl,
      steps: this.steps
    });
  }

  private getActionType(actionName: string): 'interaction' | 'data_collection' {
    const choice = this.getAllActionChoices().find(c => c.value === actionName);
    return choice?.action_type || 'interaction';
  }

  private getAllActionChoices(): SelectOption[] {
    return this.ALL_ACTION_CHOICES;
  }

  requiresSelector(actionName: string): boolean {
    const selectorRequiredActions = [
      'element_click', 'element_right_click', 'element_double_click', 'element_hover',
      'element_input_text', 'element_clear_input', 'element_long_press', 'scroll_to_element',
      'element_text', 'element_get_inner_html', 'element_get_attribute_value',
      'element_check_attribute_value_equals', 'element_check_attribute_value_not_equals',
      'element_check_attribute_exists', 'element_check_attribute_value_contains',
      'element_check_attribute_value_starts_with', 'element_check_attribute_value_ends_with'
    ];
    return selectorRequiredActions.includes(actionName);
  }

  onUseChildIterableSelectorChange(step: Step, event: any) {
    step.useChildIterableSelector = event.target.checked;
    if (step.step_type === 'action' && step.action) {
      step.action.selector = undefined;
      step.action.fallback_selector = undefined;
    }
    if (step.step_type === 'condition' && step.condition) {
      step.condition.selector = undefined;
      step.condition.fallback_selector = undefined;
    }
    if (step.step_type === 'loop' && step.loop) {
      step.loop.condition_element_selector = undefined;
      step.loop.fallback_selector = undefined;

    }
  }
}
