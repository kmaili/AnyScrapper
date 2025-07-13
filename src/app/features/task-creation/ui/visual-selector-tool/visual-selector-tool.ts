import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DomElementsSelectorWsService } from '../../data-access/dom-elements-selector/real-time-dom-elemnts-selector.service';
import { DomElement } from '../../models/dom-element.model'; // Adjust the import path as needed
import { AutocompleteSelectorComponent } from '../autocomplete-selector/autocomplete-selector';
import { HttpClientModule } from '@angular/common/http';
import { Action } from '../../models/action.model';
import { Condition } from '../../models/condition.model';
import { Loop } from '../../models/loop.model';
import { Step } from '../../models/step.model';


@Component({
  selector: 'app-visual-selector-tool',
  standalone: true,
  imports: [CommonModule, FormsModule, AutocompleteSelectorComponent, HttpClientModule],
  templateUrl: './visual-selector-tool.html',
  styleUrls: ['./visual-selector-tool.css']
})
export class VisualSelectorToolComponent implements OnInit, OnDestroy {
  @Input() steps: Step[] = []; // This component now manages an array of steps
  @Output() stepsChange = new EventEmitter<Step[]>(); // Emits its entire steps array

  @Output() workflowCompleted = new EventEmitter<boolean>();

  domElements: DomElement[] = [];
  private wsSubscription!: Subscription;

  // isExpanded will now be a map of step references or unique IDs for expanded state,
  // or managed differently if you want global state for expansions.
  // For simplicity, we can keep it as an index-based map for the current component's direct children.
  isExpanded: { [key: number]: boolean } = {}; // For the direct children of this component instance

  constructor(private wsService: DomElementsSelectorWsService) {}

  ngOnInit() {
    // If no steps are provided, initialize with a default action
    // This logic only applies to the top-level component, or if a nested component
    // is passed an empty array for its steps.
    if (!this.steps || this.steps.length === 0) { // Check for undefined or empty array
      this.steps = [{ type: 'action', actionType: 'page', name: 'scroll_down', tag: '', selector: '' }];
      this.emitChanges(); // Emit if we initialize steps
    }

    // Initialize expansion state for existing steps
    this.steps.forEach((_, i) => this.isExpanded[i] = true);

    // Connect to WebSocket (replace with your WebSocket URL)
    this.wsService.connect('ws://localhost:8000/ws/dom-elements/', 'http://localhost:8000/api/dom-elements/');

    // Subscribe to DOM elements from WebSocket
    this.wsSubscription = this.wsService.domElements$.subscribe(elements => {
      this.domElements = elements;
      // Ensure selector is set for existing steps if needed (only if initially empty)
      this.steps.forEach(step => {
        const defaultSelector = this.domElements.length ? this.mapDomElementToSelector(this.domElements[0]) : '';
        if (step.type === 'condition' && !step.selector && this.domElements.length) {
          step.selector = defaultSelector;
        } else if (step.type === 'loop' && step.loopType === 'until_condition' && step.condition && !step.condition.selector && this.domElements.length) {
          step.condition.selector = defaultSelector;
        } else if (step.type === 'action' && step.actionType === 'element' && !step.selector && this.domElements.length) {
          step.selector = defaultSelector;
        }
      });
      this.emitChanges(); // Emit changes after potentially updating selectors
    });
  }

  ngOnDestroy() {
    this.wsSubscription.unsubscribe();
    this.wsService.disconnect();
  }

  private mapDomElementToSelector(element: DomElement): string {
    const idAttr = element.attributes.find(attr => attr.name === 'id');
    if (idAttr && idAttr.value) {
      return `#${idAttr.value}`;
    }
    const classAttr = element.attributes.find(attr => attr.name === 'class');
    if (classAttr && classAttr.value) {
      return `.${classAttr.value.replace(/\s+/g, ' ').trim().replace(/\s/g, '.')}`;
    }
    return `${element.tag_name}[data-xpath="${element.x_path}"]`;
  }

  // addStep, deleteStep will now only operate on the current component's `this.steps` array.
  // The addNestedStep/removeNestedStep logic will be simplified.

  addStep(type: 'action' | 'condition' | 'loop') {
    let newStep: Step;
    const defaultSelector = this.domElements.length ? this.mapDomElementToSelector(this.domElements[0]) : '';

    if (type === 'action') {
      newStep = { type: 'action', actionType: 'page', name: 'scroll_down', tag: '', selector: '' } as Action;
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
    // Cleanup expansion state
    delete this.isExpanded[index];
    // Re-index isExpanded keys if needed (for consistency if you reorder, not strictly needed for splice)
    // For simplicity, re-initialize isExpanded on delete for consistency with remaining steps
    const newIsExpanded: { [key: number]: boolean } = {};
    this.steps.forEach((_, i) => {
        if (typeof this.isExpanded[i] !== 'undefined') {
            newIsExpanded[i] = this.isExpanded[i];
        } else if (typeof this.isExpanded[i + 1] !== 'undefined') { // Adjust for deleted index
            newIsExpanded[i] = this.isExpanded[i + 1];
        } else {
             newIsExpanded[i] = true; // Default to expanded if state not found
        }
    });
    this.isExpanded = newIsExpanded;

    this.emitChanges();
  }

  // --- NEW/SIMPLIFIED NESTED STEP HANDLING ---
  // These methods will be called by buttons *within* the current component's template,
  // to add/remove steps to its *own* `steps` array, which are then passed to children.

  addNestedActionToBranch(parentStep: Step, branch: 'ifTrue' | 'ifFalse' | 'steps') {
      const newNestedAction: Action = { type: 'action', actionType: 'page', name: 'scroll_down', tag: '', selector: '' };

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

  // No separate removeNestedStep method in *this* component.
  // The nested `app-visual-selector-tool` component will handle deleting its own steps
  // and emit the updated array back.

  // The updateNestedAction method is no longer needed.
  // Instead, the @Input `steps` of the child component will be updated directly
  // by `ngModelChange` or when its `(stepsChange)` event fires and the parent
  // updates its own data structure.

  // --- Existing Methods (Minor adjustments for robustness) ---

  updateStepType(index: number, type: 'action' | 'condition' | 'loop') {
    const originalStep = this.steps[index];
    let newStep: Step;
    const defaultSelector = this.domElements.length ? this.mapDomElementToSelector(this.domElements[0]) : '';

    if (type === 'action') {
      newStep = {
        type: 'action',
        actionType: 'page',
        name: 'scroll_down',
        tag: originalStep.tag || '',
        selector: ''
      } as Action;
      if ((originalStep as Action).actionType === 'container' && (originalStep as Action).name === 'sequence' && (originalStep as Action).steps) {
        (newStep as Action).actionType = 'container';
        (newStep as Action).name = 'sequence';
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

  updateActionType(index: number, actionType: 'page' | 'element' | 'container') {
    const step = this.steps[index] as Action;
    step.actionType = actionType;

    const defaultSelector = this.domElements.length ? this.mapDomElementToSelector(this.domElements[0]) : '';

    if (actionType === 'page') {
      step.name = 'scroll_down';
      step.selector = '';
      delete step.attribute;
      delete step.steps;
      delete step.url;
    } else if (actionType === 'element') {
      step.name = 'get_text';
      step.selector = defaultSelector;
      delete step.attribute;
      delete step.steps;
      delete step.url;
    } else if (actionType === 'container') {
      step.name = 'sequence';
      step.steps = step.steps || [];
      step.selector = '';
      delete step.attribute;
      delete step.url;
    }
    this.emitChanges();
  }

  updateActionName(index: number, name: string) {
    const step = this.steps[index] as Action;
    step.name = name;
    if (name === 'visit_link') {
      step.url = step.url || '';
    } else {
      delete step.url;
    }
    this.emitChanges();
  }

  updateLoopType(index: number, loopType: 'fixed_iterations' | 'until_condition') {
    const step = this.steps[index] as Loop;
    step.loopType = loopType;

    const defaultSelector = this.domElements.length ? this.mapDomElementToSelector(this.domElements[0]) : '';

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

  // --- IMPORTANT NEW METHOD FOR NESTED COMPONENTS ---
  // This method will be called when a child app-visual-selector-tool emits its stepsChange event.
  // It receives the *full updated array* from the child and updates the parent's model.
  onNestedStepsChange(parentStep: Step, branch: 'ifTrue' | 'ifFalse' | 'steps', updatedSteps: Step[]) {
      if (parentStep.type === 'condition' && (branch === 'ifTrue' || branch === 'ifFalse')) {
          parentStep[branch] = updatedSteps as Action[]; // Assign the whole updated array
      } else if ((parentStep.type === 'loop' || (parentStep.type === 'action' && (parentStep as Action).name === 'sequence')) && branch === 'steps') {
          parentStep.steps = updatedSteps as Action[]; // Assign the whole updated array
      }
      this.emitChanges(); // Propagate the change up
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
    // Always emit a new array reference to ensure Angular's OnPush change detection works if used.
    this.stepsChange.emit([...this.steps]);
  }

  getStepLabel(step: Step): string {
    if (step.type === 'action') return `Action: ${((step as Action).name || 'Unnamed')}`;
    if (step.type === 'condition') return `Condition: ${((step as Condition).conditionType || 'Unnamed')}`;
    return `Loop: ${((step as Loop).loopType || 'Unnamed')}`;
  }

  getStepClasses(step: Step): { [key: string]: boolean } {
    return {
      'action': step.type === 'action',
      'condition': step.type === 'condition',
      'loop': step.type === 'loop',
      'bg-purple-50': step.type === 'action' && (step as Action).name === 'sequence'
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
    // Emit an event to notify that the workflow is completed
    this.workflowCompleted.emit(true);
    console.log('Workflow completed with steps:', this.steps);
  }
}