import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DomElementsSelectorWsService } from '../../data-access/dom-elements-selector/real-time-dom-elemnts-selector.service';
import { DomElement } from '../../models/dom-element.model'; // Adjust the import path as needed
import { AutocompleteSelectorComponent } from '../autocomplete-selector/autocomplete-selector';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Action } from '../../models/action.model';
import { Condition } from '../../models/condition.model';
import { Loop } from '../../models/loop.model';
import { Step } from '../../models/step.model';


@Component({
  selector: 'app-visual-selector-tool',
  standalone: true,
  imports: [CommonModule, FormsModule, AutocompleteSelectorComponent],
  templateUrl: './visual-selector-tool.html',
  styleUrls: ['./visual-selector-tool.css']
})
export class VisualSelectorToolComponent implements OnInit, OnDestroy {
  @Input() steps: Step[] = [];
  @Output() stepsChange = new EventEmitter<Step[]>();
  domElements: DomElement[] = [];
  private wsSubscription!: Subscription;

  constructor(private wsService: DomElementsSelectorWsService) {}

  ngOnInit() {
    if (!this.steps.length) {
      this.steps = [{ type: 'action', actionType: 'page', name: 'scroll_down', tag: '', selector: '' }];
    }
    this.steps.forEach((_, i) => this.isExpanded[i] = true);

    // Connect to WebSocket (replace with your WebSocket URL)
    this.wsService.connect('ws://localhost:8000/ws/dom-elements/', 'http://localhost:8000/api/dom-elements/');

    // Subscribe to DOM elements from WebSocket
    this.wsSubscription = this.wsService.domElements$.subscribe(elements => {
      this.domElements = elements;
      // Ensure selector is set for existing steps if needed
      this.steps.forEach((step, index) => {
        if (step.type === 'condition' && !step.selector) {
          step.selector = this.domElements.length ? this.mapDomElementToSelector(this.domElements[0]) : '';
          this.emitChanges();
        } else if (step.type === 'loop' && step.loopType === 'until_condition' && step.condition && !step.condition.selector) {
          step.condition.selector = this.domElements.length ? this.mapDomElementToSelector(this.domElements[0]) : '';
          this.emitChanges();
        } else if (step.type === 'action' && step.actionType === 'element' && !step.selector) {
          step.selector = this.domElements.length ? this.mapDomElementToSelector(this.domElements[0]) : '';
          this.emitChanges();
        }
      });
    });
  }

  ngOnDestroy() {
    this.wsSubscription.unsubscribe();
    this.wsService.disconnect();
  }

  private mapDomElementToSelector(element: DomElement): string {
    // Prioritize ID attributes for concise selectors
    const idAttr = element.attributes.find(attr => attr.name === 'id');
    if (idAttr) {
      return `#${idAttr.name}`;
    }
    // Fallback to class attributes
    const classAttr = element.attributes.find(attr => attr.name === 'class');
    if (classAttr) {
      return `.${classAttr.name.replace(/\s+/g, '.')}`;
    }
    // Fallback to tag name with XPath as a pseudo-selector
    return `${element.tag_name}[data-xpath="${element.x_path}"]`;
  }

  isExpanded: { [key: number]: boolean } = {};

  addStep(type: 'action' | 'condition' | 'loop') {
    let newStep: Step;
    if (type === 'action') {
      newStep = { type: 'action', actionType: 'page', name: 'scroll_down', tag: '', selector: '' };
    } else if (type === 'condition') {
      newStep = { 
        type: 'condition', 
        conditionType: 'element_found', 
        selector: this.domElements.length ? this.mapDomElementToSelector(this.domElements[0]) : '', 
        ifTrue: [], 
        ifFalse: [], 
        tag: '' 
      };
    } else {
      newStep = { 
        type: 'loop', 
        loopType: 'fixed_iterations', 
        iterations: 1, 
        steps: [], 
        condition: { 
          conditionType: 'element_found', 
          selector: this.domElements.length ? this.mapDomElementToSelector(this.domElements[0]) : '' 
        }, 
        tag: '' 
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
    this.emitChanges();
  }

  addNestedStep(index: number, branch: 'ifTrue' | 'ifFalse' | 'steps' = 'steps') {
    const step = this.steps[index];
    if (step.type === 'condition' && (branch === 'ifTrue' || branch === 'ifFalse')) {
      if (!step[branch].length) step[branch] = [];
      step[branch].push({ type: 'action', actionType: 'page', name: 'scroll_down', tag: '', selector: '' });
    } else if ((step.type === 'loop' || (step.type === 'action' && (step as Action).name === 'sequence')) && branch === 'steps') {
      if (!step.steps) step.steps = [];
      step.steps.push({ type: 'action', actionType: 'page', name: 'scroll_down', tag: '', selector: '' });
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
    if (type === 'action') {
      newStep = { type: 'action', actionType: 'page', name: 'scroll_down', tag: step.tag || '', selector: '' };
    } else if (type === 'condition') {
      newStep = { 
        type: 'condition', 
        conditionType: 'element_found', 
        selector: this.domElements.length ? this.mapDomElementToSelector(this.domElements[0]) : '', 
        ifTrue: [], 
        ifFalse: [], 
        tag: step.tag || '' 
      };
    } else {
      newStep = { 
        type: 'loop', 
        loopType: 'fixed_iterations', 
        iterations: 1, 
        steps: [], 
        condition: { 
          conditionType: 'element_found', 
          selector: this.domElements.length ? this.mapDomElementToSelector(this.domElements[0]) : '' 
        }, 
        tag: step.tag || '' 
      };
    }
    this.steps[index] = newStep;
    this.emitChanges();
  }

  updateActionType(index: number, actionType: 'page' | 'element' | 'container') {
    const step = this.steps[index] as Action;
    step.actionType = actionType;
    if (actionType === 'page') {
      step.name = 'scroll_down';
      step.selector = '';
      delete step.attribute;
      delete step.steps;
      delete step.url;
    } else if (actionType === 'element') {
      step.name = 'get_text';
      step.selector = this.domElements.length ? this.mapDomElementToSelector(this.domElements[0]) : '';
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
    if (loopType === 'fixed_iterations') {
      delete step.condition;
      step.iterations = step.iterations || 1;
    } else {
      step.condition = step.condition || { 
        conditionType: 'element_found', 
        selector: this.domElements.length ? this.mapDomElementToSelector(this.domElements[0]) : '' 
      };
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

  exportToJson() {
    const jsonString = JSON.stringify(this.steps, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'process-steps.json';
    a.click();
    window.URL.revokeObjectURL(url);
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
}