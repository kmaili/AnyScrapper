import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DomElementsSelectorWsService } from '../../data-access/dom-elements-selector/real-time-dom-elemnts-selector.service';
import { DomElement } from '../../models/dom-element.model';
import { AutocompleteSelectorComponent } from '../autocomplete-selector/autocomplete-selector';
import { HttpClientModule } from '@angular/common/http';
import { Action } from '../../models/action.model';
import { Condition } from '../../models/condition.model';
import { Loop } from '../../models/loop.model';
import { Step } from '../../models/step.model';
import { FilterActionsPipe } from '../../pipes/filter-actions-pipe';
import { Workflow } from '../../models/workflow.model';

@Component({
  selector: 'app-visual-selector-tool',
  standalone: true,
  imports: [CommonModule, FormsModule, AutocompleteSelectorComponent, HttpClientModule, FilterActionsPipe],
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

  domElements: DomElement[] = [];
  private wsSubscription!: Subscription;

  isExpanded: { [key: number]: boolean } = {};

  ACTION_TYPE_CHOICES = [
    { value: 'on_element', label: 'On Element' },
    { value: 'on_page', label: 'On Page' },
  ];

  ACTION_NAME_CHOICES = [
    { value: 'element_click', label: 'Element Click' },
    { value: 'element_right_click', label: 'Element Right Click' },
    { value: 'element_text', label: 'Element Text Extraction' },
    { value: 'element_input', label: 'Element Input' }, // Keep this, assuming you might add an input value field later
    { value: 'element_long_press', label: 'Element Long Press' },
    { value: 'element_double_click', label: 'Element Double Click' },
    { value: 'element_inner_html', label: 'Element Inner HTML' },
    { value: 'element_get_attribute', label: 'Element Get Attribute' }, // <--- ADD THIS LINE
    { value: 'page_scroll_up', label: 'Page Scroll Up' },
    { value: 'page_scroll_down', label: 'Page Scroll Down' },
    { value: 'page_refresh', label: 'Page Refresh' },
    { value: 'page_navigate', label: 'Page Navigate' },
    { value: 'page_go_back', label: 'Page Go Back' },
    { value: 'page_go_forward', label: 'Page Go Forward' },
  ];

  constructor(private wsService: DomElementsSelectorWsService) {}

  ngOnInit() {
    if (!this.steps || this.steps.length === 0) {
      this.steps = [{ type: 'action', actionType: 'on_page', name: 'page_scroll_down', tag: '', selector: -1 }];
      this.emitChanges();
    }

    this.steps.forEach((_, i) => this.isExpanded[i] = true);

    this.wsService.connect('ws://localhost:8000/ws/dom-elements/', 'http://localhost:8000/api/dom-elements/');

    this.wsSubscription = this.wsService.domElements$.subscribe(elements => {
      this.domElements = elements;
      this.steps.forEach(step => {
        const defaultSelector = this.mapDomElementToSelector(this.domElements[0]);
        if (step.type === 'condition' && !step.selector && this.domElements.length) {
          step.selector = defaultSelector;
        } else if (step.type === 'loop' && step.loopType === 'until_condition' && step.condition && !step.condition.selector && this.domElements.length) {
          step.condition.selector = defaultSelector;
        } else if (step.type === 'action' && step.actionType === 'on_element' && !step.selector && this.domElements.length) {
          step.selector = defaultSelector;
        }
      });
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
    let newStep: Step;
    const defaultSelector = this.mapDomElementToSelector(this.domElements[0]);

    if (type === 'action') {
      newStep = { type: 'action', actionType: 'on_page', name: 'page_scroll_down', tag: '', selector: -1 } as Action;
    } else if (type === 'condition') {
      newStep = {
        type: 'condition',
        conditionType: 'element_found',
        selector: defaultSelector,
        ifTrue: [],
        ifFalse: [],
        tag: ''
      } as Condition;
    } else { // type === 'loop'
      newStep = {
        type: 'loop',
        loopType: 'fixed_iterations',
        iterations: 1,
        steps: [],
        condition: {
          conditionType: 'element_found',
          selector: defaultSelector
        },
        tag: ''
      } as Loop;
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

  addNestedActionToBranch(parentStep: Step, branch: 'ifTrue' | 'ifFalse' | 'steps') {
    const newNestedAction: Action = { type: 'action', actionType: 'on_page', name: 'page_scroll_down', tag: '', selector: -1 };

    if (parentStep.type === 'condition' && (branch === 'ifTrue' || branch === 'ifFalse')) {
      if (!parentStep[branch]) {
        parentStep[branch] = [];
      }
      parentStep[branch].push(newNestedAction);
    } else if ((parentStep.type === 'loop' || (parentStep.type === 'action' && (parentStep as Action).name === 'sequence')) && branch === 'steps') {
      if (!parentStep.steps) {
        parentStep.steps = [];
      }
      parentStep.steps.push(newNestedAction);
    }
    this.emitChanges();
  }

  updateStepType(index: number, type: 'action' | 'condition' | 'loop') {
    const originalStep = this.steps[index];
    let newStep: Step;
    const defaultSelector = this.mapDomElementToSelector(this.domElements[0]);

    if (type === 'action') {
      newStep = {
        type: 'action',
        actionType: 'on_page', // Default to 'on_page'
        name: 'page_scroll_down', // Default to 'page_scroll_down'
        tag: originalStep.tag || '',
        selector: -1
      } as Action;
      if ((originalStep as Action).steps) {
        (newStep as Action).steps = (originalStep as Action).steps;
      }
    } else if (type === 'condition') {
      newStep = {
        type: 'condition',
        conditionType: 'element_found',
        selector: defaultSelector,
        ifTrue: (originalStep as Condition).ifTrue || [],
        ifFalse: (originalStep as Condition).ifFalse || [],
        tag: originalStep.tag || ''
      } as Condition;
    } else { // type === 'loop'
      newStep = {
        type: 'loop',
        loopType: 'fixed_iterations',
        iterations: (originalStep as Loop).iterations || 1,
        steps: (originalStep as Loop).steps || [],
        condition: (originalStep as Loop).condition || {
          conditionType: 'element_found',
          selector: defaultSelector
        },
        tag: originalStep.tag || ''
      } as Loop;
    }
    this.steps[index] = newStep;
    this.emitChanges();
  }

  updateActionType(index: number, actionType: 'on_page' | 'on_element') {
    const step = this.steps[index] as Action;
    step.actionType = actionType;

    const defaultSelector = this.mapDomElementToSelector(this.domElements[0]);

    if (actionType === 'on_page') {
      step.name = 'page_scroll_down'; // Default page action
      step.selector = -1;
      delete step.attribute; // Clear attribute for page actions
      delete step.steps;
      delete step.url;
      delete step.value; // Clear value for page actions
    } else if (actionType === 'on_element') {
      step.name = 'element_text'; // Default element action
      step.selector = defaultSelector;
      delete step.attribute; // Clear attribute for element actions, unless it's specifically 'get_attribute'
      delete step.steps;
      delete step.url;
      delete step.value; // Clear value for element actions
    }
    this.emitChanges();
  }

  updateActionName(index: number, name: string) {
    const step = this.steps[index] as Action;
    step.name = name;

    // Reset URL and Attribute based on new action name
    if (name === 'page_navigate') {
      step.url = step.url || '';
      delete step.attribute;
      delete step.value;
    } else if (name === 'element_get_attribute') { // <--- ADD THIS CONDITION
      step.attribute = step.attribute || ''; // Initialize attribute
      delete step.url;
      delete step.value;
    }
    else if (name === 'element_input') { // Assuming element_input will have a value
      step.value = step.value || '';
      delete step.attribute;
      delete step.url;
    }
    else { // For other actions, clear URL, attribute, and value
      delete step.url;
      delete step.attribute;
      delete step.value;
    }
    this.emitChanges();
  }

  updateLoopType(index: number, loopType: 'fixed_iterations' | 'until_condition') {
    const step = this.steps[index] as Loop;
    step.loopType = loopType;

    const defaultSelector = this.mapDomElementToSelector(this.domElements[0]);

    if (loopType === 'fixed_iterations') {
      delete step.condition;
      step.iterations = step.iterations || 1;
    } else { // 'until_condition'
      step.condition = step.condition || {
        conditionType: 'element_found',
        selector: defaultSelector
      };
      delete step.iterations;
    }
    this.emitChanges();
  }

  onNestedStepsChange(parentStep: Step, branch: 'ifTrue' | 'ifFalse' | 'steps', updatedSteps: Step[]) {
    if (parentStep.type === 'condition' && (branch === 'ifTrue' || branch === 'ifFalse')) {
      parentStep[branch] = updatedSteps as Action[];
    } else if ((parentStep.type === 'loop' || (parentStep.type === 'action' && (parentStep as Action).name === 'sequence')) && branch === 'steps') {
      parentStep.steps = updatedSteps as Action[];
    }
    this.emitChanges();
  }

  toggleCollapse(index: number) {
    this.isExpanded[index] = !this.isExpanded[index];
  }

  exportToJson() {
    console.log('Steps data before export:', this.steps);

    try {
      const jsonString = JSON.stringify(this.steps, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'process-steps.json';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting JSON:', error);
      alert('Failed to export JSON. Check console for details. (Likely a circular reference)');
    }
  }

  private emitChanges() {
    this.stepsChange.emit([...this.steps]);
  }

  getStepLabel(step: Step): string {
    if (step.type === 'action') {
      const actionName = this.ACTION_NAME_CHOICES.find(choice => choice.value === (step as Action).name)?.label;
      return `Action: ${actionName || 'Unnamed'}`;
    }
    if (step.type === 'condition') return `Condition: ${((step as Condition).conditionType || 'Unnamed')}`;
    return `Loop: ${((step as Loop).loopType || 'Unnamed')}`;
  }

  getStepClasses(step: Step): { [key: string]: boolean } {
    return {
      'action': step.type === 'action',
      'condition': step.type === 'condition',
      'loop': step.type === 'loop',
      'bg-purple-50': step.type === 'action'
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
}