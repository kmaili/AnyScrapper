import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DomElementsSelectorWsService } from '../../data-access/dom-elements-selector/real-time-dom-elemnts-selector.service';
import { DomElement } from '../../models/dom-element.model';
import { HttpClientModule } from '@angular/common/http';
import { Workflow } from '../../models/workflow.model';
import { Step } from '../../models/step.model';
import { SelectOption, CustomSelectComponent } from '../custom-select/custom-select';

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

  constructor(private wsService: DomElementsSelectorWsService) {}

  ngOnInit() {
    if (!this.steps || this.steps.length === 0) {
      this.steps = [
        {
          id: 1,
          step_type: 'action',
          order: 1,
          workflow: 1,
          action: {
            step: 1,
            action_type: 'interaction',
            action_name: 'page_scroll_down',
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
    const defaultSelector = this.domElements.length > 0 ? this.mapDomElementToSelector(this.domElements[0]) : -1;
    let newStep: Step;

    if (type === 'action') {
      newStep = {
        id: newId,
        step_type: 'action',
        order: this.steps.length + 1,
        workflow: this.initialized_workflow.steps.length > 0 ? this.initialized_workflow.steps[0].workflow : 1,
        action: {
          step: newId,
          action_type: 'interaction',
          action_name: 'page_scroll_down',
        }
      };
    } else if (type === 'condition') {
      newStep = {
        id: newId,
        step_type: 'condition',
        order: this.steps.length + 1,
        workflow: this.initialized_workflow.steps.length > 0 ? this.initialized_workflow.steps[0].workflow : 1,
        condition: {
          step: newId,
          condition_type: 'element_found',
          selector: defaultSelector,
          if_true_child_steps: [],
          if_false_child_steps: []
        }
      };
    } else { // type === 'loop'
      newStep = {
        id: newId,
        step_type: 'loop',
        order: this.steps.length + 1,
        workflow: this.initialized_workflow.steps.length > 0 ? this.initialized_workflow.steps[0].workflow : 1,
        loop: {
          step: newId,
          loop_type: 'fixed_iterations',
          iterations_count: 1,
          child_steps: []
        }
      };
    }
    this.steps.push(newStep);
    this.isExpanded[this.steps.length - 1] = true;
    this.emitChanges();
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

    this.emitChanges();
  }

  addNestedStep(parentStep: Step, branch: 'if_true_child_steps' | 'if_false_child_steps' | 'child_steps', parentIndex: number) {
    const newId = this.steps.length > 0 ? Math.max(...this.steps.map(s => s.id)) + 1 : 1;
    const defaultSelector = this.domElements.length > 0 ? this.mapDomElementToSelector(this.domElements[0]) : -1;
    let order = 1;
    let nestedSteps: Step[] | null | undefined;

    if (parentStep.step_type === 'condition' && parentStep.condition && (branch === 'if_true_child_steps' || branch === 'if_false_child_steps')) {
      nestedSteps = parentStep.condition[branch];
      order = (nestedSteps?.length || 0) + 1;
    } else if (parentStep.step_type === 'loop' && parentStep.loop && branch === 'child_steps') {
      nestedSteps = parentStep.loop.child_steps;
      order = (nestedSteps?.length || 0) + 1;
    }

    const newNestedStep: Step = {
      id: newId,
      step_type: 'action',
      order: order,
      workflow: parentStep.workflow,
      parent_loop: parentStep.step_type === 'loop' ? parentStep.id : parentStep.parent_loop,
      action: {
        step: newId,
        action_type: 'interaction',
        action_name: 'page_scroll_down',
      }
    };

    if (parentStep.step_type === 'condition' && parentStep.condition && (branch === 'if_true_child_steps' || branch === 'if_false_child_steps')) {
      if (!parentStep.condition[branch]) {
        parentStep.condition[branch] = [];
      }
      parentStep.condition[branch]!.push(newNestedStep);
    } else if (parentStep.step_type === 'loop' && parentStep.loop && branch === 'child_steps') {
      if (!parentStep.loop.child_steps) {
        parentStep.loop.child_steps = [];
      }
      parentStep.loop.child_steps!.push(newNestedStep);
    }

    this.steps.splice(parentIndex + 1, 0, newNestedStep);
    this.isExpanded[this.steps.length - 1] = true;
    this.emitChanges();
  }

  updateStepType(index: number, stepType: 'action' | 'condition' | 'loop') {
    const originalStep = this.steps[index];
    const newId = originalStep.id;
    const defaultSelector = this.domElements.length > 0 ? this.mapDomElementToSelector(this.domElements[0]) : -1;
    let newStep: Step;

    if (stepType === 'action') {
      newStep = {
        id: newId,
        step_type: 'action',
        order: originalStep.order,
        workflow: originalStep.workflow,
        action: {
          step: newId,
          action_type: 'interaction',
          action_name: 'page_scroll_down',
        }
      };
    } else if (stepType === 'condition') {
      newStep = {
        id: newId,
        step_type: 'condition',
        order: originalStep.order,
        workflow: originalStep.workflow,
        condition: {
          step: newId,
          condition_type: 'element_found',
          selector: defaultSelector,
          if_true_child_steps: [],
          if_false_child_steps: []
        }
      };
    } else { // stepType === 'loop'
      newStep = {
        id: newId,
        step_type: 'loop',
        order: originalStep.order,
        workflow: originalStep.workflow,
        loop: {
          step: newId,
          loop_type: 'fixed_iterations',
          iterations_count: 1,
          child_steps: []
        }
      };
    }
    this.steps[index] = newStep;
    this.emitChanges();
  }

  updateActionType(index: number, actionType: string) {
    const step = this.steps[index];
    if (step.step_type !== 'action' || !step.action) return;
    step.action.action_type = actionType as 'interaction' | 'data_collection';

    const defaultSelector = this.domElements.length > 0 ? this.mapDomElementToSelector(this.domElements[0]) : -1;

    if (actionType === 'interaction') {
      step.action.action_name = 'page_scroll_down';
      step.action.selector = null;
      delete step.action.attribute;
      delete step.action.expected_value;
      delete step.action.url;
    } else if (actionType === 'data_collection') {
      step.action.action_name = 'element_text';
      step.action.selector = defaultSelector;
      delete step.action.attribute;
      delete step.action.expected_value;
      delete step.action.url;
    }
    this.emitChanges();
  }

  updateActionName(index: number, actionName: string) {
    const step = this.steps[index];
    if (step.step_type !== 'action' || !step.action) return;
    step.action.action_name = actionName;

    const action_type = this.getActionType(actionName);
    step.action.action_type = action_type;

    if (actionName === 'page_navigate') {
      step.action.url = step.action.url || '';
      delete step.action.attribute;
      delete step.action.expected_value;
    } else if (actionName === 'element_get_attribute_value' || actionName.includes('element_check_attribute')) {
      step.action.attribute = step.action.attribute || '';
      delete step.action.url;
      if (actionName.includes('element_check_attribute_value_')) {
        step.action.expected_value = step.action.expected_value || '';
      } else {
        delete step.action.expected_value;
      }
    } else if (actionName === 'element_input_text') {
      step.action.expected_value = step.action.expected_value || '';
      delete step.action.attribute;
      delete step.action.url;
    } else if (actionName === 'element_clear_input' || actionName === 'element_hover') {
      delete step.action.attribute;
      delete step.action.expected_value;
      delete step.action.url;
    } else {
      delete step.action.url;
      delete step.action.attribute;
      delete step.action.expected_value;
    }
    this.emitChanges();
  }

  updateLoopType(index: number, loopType: 'fixed_iterations' | 'until_condition') {
    const step = this.steps[index];
    if (step.step_type !== 'loop' || !step.loop) return;
    step.loop.loop_type = loopType;

    const defaultSelector = this.domElements.length > 0 ? this.mapDomElementToSelector(this.domElements[0]) : -1;

    if (loopType === 'fixed_iterations') {
      delete step.loop.condition_type;
      delete step.loop.condition_element_selector;
      delete step.loop.condition_element_attribute;
      delete step.loop.condition_attribute_value;
      step.loop.iterations_count = step.loop.iterations_count || 1;
    } else { // 'until_condition'
      delete step.loop.iterations_count;
      step.loop.condition_element_selector = step.loop.condition_element_selector || defaultSelector;
      step.loop.condition_type = step.loop.condition_type || 'element_found';
    }
    this.emitChanges();
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
}