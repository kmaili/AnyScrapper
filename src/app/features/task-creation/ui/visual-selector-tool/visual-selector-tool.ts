import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Action {
  type: 'action';
  actionType?: 'page' | 'element' | 'container';
  name?: string;
  url?: string;
  selector?: string;
  attribute?: string;
  steps?: Action[];
}

interface Condition {
  type: 'condition';
  conditionType?: 'element_found' | 'element_not_found' | 'element_attribute_equals' | 'element_attribute_not_equals';
  selector?: string;
  attribute?: string;
  value?: string;
  ifTrue: Action[];
  ifFalse: Action[];
}

interface Loop {
  type: 'loop';
  loopType?: 'fixed_iterations' | 'until_condition';
  iterations?: number;
  condition?: { conditionType?: string; selector?: string; attribute?: string; value?: string };
  steps: Action[];
}

type Step = Action | Condition | Loop;

@Component({
  selector: 'app-visual-selector-tool',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './visual-selector-tool.html',
  styleUrls: ['./visual-selector-tool.css']
})
export class VisualSelectorToolComponent implements OnInit {
  @Input() steps: Step[] = [];
  @Output() stepsChange = new EventEmitter<Step[]>();
  testSelectors = [
    '#main-content', '.product-title', 'a.nav-link', 'div.item-card', 'p.description',
    'h1', 'h2', 'button.submit-btn', 'input[type="text"]', 'span.price', 'img', 'body', 'html'
  ];
  isExpanded: { [key: number]: boolean } = {};

  ngOnInit() {
    if (!this.steps.length) this.steps = [{ type: 'action', actionType: 'page', name: 'scroll_down' }];
    this.steps.forEach((_, i) => this.isExpanded[i] = true);
  }

  addStep(type: 'action' | 'condition' | 'loop') {
    let newStep: Step;
    if (type === 'action') newStep = { type: 'action' as const, actionType: 'page', name: 'scroll_down' };
    else if (type === 'condition') newStep = { type: 'condition' as const, conditionType: 'element_found', selector: this.testSelectors[0], ifTrue: [], ifFalse: [] };
    else newStep = { type: 'loop' as const, loopType: 'fixed_iterations', iterations: 1, steps: [], condition: { conditionType: 'element_found', selector: this.testSelectors[0] } };
    this.steps.push(newStep);
    this.isExpanded[this.steps.length - 1] = true;
    this.emitChanges();
  }

  deleteStep(index: number, event: Event) {
    event.stopPropagation();
    this.steps.splice(index, 1);
    delete this.isExpanded[index];
    this.emitChanges();
  }

  addNestedStep(index: number, branch: 'ifTrue' | 'ifFalse' | 'steps' = 'steps') {
    const step = this.steps[index];
    if (step.type === 'condition' && (branch === 'ifTrue' || branch === 'ifFalse')) {
      if (!step[branch].length) step[branch] = [];
      step[branch].push({ type: 'action', actionType: 'page', name: 'scroll_down' });
    } else if ((step.type === 'loop' || (step.type === 'action' && (step as Action).name === 'sequence')) && branch === 'steps') {
      if (!step.steps) step.steps = [];
      step.steps.push({ type: 'action', actionType: 'page', name: 'scroll_down' });
    }
    this.emitChanges();
  }

  removeNestedStep(index: number, actionIndex: number, branch: 'ifTrue' | 'ifFalse' | 'steps') {
    const step = this.steps[index];
    if (step.type === 'condition' && (branch === 'ifTrue' || branch === 'ifFalse')) {
      step[branch].splice(actionIndex, 1);
    } else if ((step.type === 'loop' || (step.type === 'action' && (step as Action).name === 'sequence')) && branch === 'steps') {
      step.steps!.splice(actionIndex, 1);
    }
    this.emitChanges();
  }

  updateStepType(index: number, type: string) {
    const step = this.steps[index];
    let newStep: Step;
    if (type === 'action') newStep = { type: 'action' as const, actionType: 'page', name: 'scroll_down' };
    else if (type === 'condition') newStep = { type: 'condition' as const, conditionType: 'element_found', selector: this.testSelectors[0], ifTrue: [], ifFalse: [] };
    else newStep = { type: 'loop' as const, loopType: 'fixed_iterations', iterations: 1, steps: [], condition: { conditionType: 'element_found', selector: this.testSelectors[0] } };
    this.steps[index] = newStep;
    this.emitChanges();
  }

  updateActionType(index: number, actionType: 'page' | 'element' | 'container') {
    const step = this.steps[index] as Action;
    step.actionType = actionType;
    if (actionType === 'page') {
      step.name = 'scroll_down';
      delete step.selector;
      delete step.attribute;
      delete step.steps;
      delete step.url;
    } else if (actionType === 'element') {
      step.name = 'get_text';
      step.selector = this.testSelectors[0];
      delete step.attribute;
      delete step.steps;
      delete step.url;
    } else if (actionType === 'container') {
      step.name = 'sequence';
      step.steps = step.steps || [];
      delete step.selector;
      delete step.attribute;
      delete step.url;
    }
    this.emitChanges();
  }

  updateActionName(index: number, name: string) {
    const step = this.steps[index] as Action;
    step.name = name;
    if (name === 'visit_link') step.url = step.url || '';
    else delete step.url;
    this.emitChanges();
  }

  updateLoopType(index: number, loopType: 'fixed_iterations' | 'until_condition') {
    const step = this.steps[index] as Loop;
    step.loopType = loopType;
    if (loopType === 'fixed_iterations') {
      delete step.condition;
      step.iterations = step.iterations || 1;
    } else {
      delete step.iterations;
      step.condition = step.condition || { conditionType: 'element_found', selector: this.testSelectors[0] };
    }
    this.emitChanges();
  }

  updateNestedAction(index: number, actionIndex: number, branch: 'ifTrue' | 'ifFalse' | 'steps', event: Step[]) {
    const step = this.steps[index];
    if (step.type === 'condition' && (branch === 'ifTrue' || branch === 'ifFalse')) {
      step[branch][actionIndex] = event[0] as Action;
    } else if ((step.type === 'loop' || (step.type === 'action' && (step as Action).name === 'sequence')) && branch === 'steps') {
      step.steps![actionIndex] = event[0] as Action;
    }
    this.emitChanges();
  }

  toggleCollapse(index: number) {
    this.isExpanded[index] = !this.isExpanded[index];
  }

  private emitChanges() {
    this.stepsChange.emit(this.steps);
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
      'bg-purple-50': step.type === 'action' && (step as Action)?.name === 'sequence'
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
}