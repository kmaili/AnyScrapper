import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Step, ActionStep, ConditionStep, LoopStep, TEST_SELECTORS } from '../../features/task-creation/models/process.model';

/**
 * @file src/app/core/services/process-data.service.ts
 * @description Service responsible for managing the web scraping process data.
 * It provides methods to add, remove, and update steps, and exposes the process
 * as an observable for components to subscribe to.
 */
@Injectable({
  providedIn: 'root'
})
export class ProcessDataService {
  // The core process data, exposed as an observable
  private processSubject = new BehaviorSubject<Step[]>([]);
  process$: Observable<Step[]> = this.processSubject.asObservable();

  // Test selectors for the UI dropdowns
  public readonly testSelectors: string[] = TEST_SELECTORS;

  constructor() {
    // Initialize with an empty process or load from storage if needed
    // For this example, we start with an empty array.
  }

  /**
   * Gets the current process array synchronously.
   * @returns The current process array.
   */
  getCurrentProcess(): Step[] {
    return this.processSubject.value;
  }

  /**
   * Updates the entire process array. Useful for loading or major resets.
   * @param newProcess The new process array.
   */
  setProcess(newProcess: Step[]): void {
    this.processSubject.next(newProcess);
  }

  /**
   * Adds a new step to the process at a specific path.
   * @param path The path where the new step should be added.
   * @param type The type of step ('action', 'condition', 'loop').
   */
  addStep(path: (string | number)[], type: 'action' | 'condition' | 'loop'): void {
    const currentProcess = this.getCurrentProcess();
    let targetArray: Step[] = currentProcess;
    let parentRef: any = currentProcess;
    let lastKey: string | number | null = null;

    // Traverse the path to find the correct array to add to
    for (let i = 0; i < path.length; i++) {
      const key = path[i];
      if (i === path.length - 1) {
        parentRef = targetArray; // The array where the new step will be pushed
        lastKey = key; // The index or property name to push into
      }
      if (typeof key === 'number') {
        targetArray = (targetArray as any[])[key];
      } else {
        targetArray = (targetArray as any)[key];
      }
    }

    let newStep: Step;
    if (type === 'action') {
      newStep = { type: 'action', actionType: 'page', name: 'scroll_down' } as ActionStep;
    } else if (type === 'condition') {
      newStep = { type: 'condition', conditionType: 'element_found', selector: this.testSelectors[0], ifTrue: [], ifFalse: [] } as ConditionStep;
    } else if (type === 'loop') {
      newStep = { type: 'loop', loopType: 'fixed_iterations', iterations: 1, steps: [], condition: { conditionType: 'element_found', selector: this.testSelectors[0] } } as LoopStep;
    } else {
      throw new Error('Invalid step type provided.');
    }

    if (lastKey !== null) {
      // If adding to a nested array (e.g., ifTrue, ifFalse, steps)
      if (Array.isArray(parentRef[lastKey])) {
        parentRef[lastKey].push(newStep);
      } else {
        console.error("Target at path is not an array:", parentRef[lastKey]);
        return;
      }
    } else {
      // If adding to the top-level process array
      currentProcess.push(newStep);
    }

    this.processSubject.next([...currentProcess]); // Emit new state to subscribers
  }

  /**
   * Removes a step from the process at a specific path.
   * @param path The path of the step to remove.
   */
  removeStep(path: (string | number)[]): void {
    const currentProcess = this.getCurrentProcess();
    let targetArray: Step[] = currentProcess;
    let indexToRemove: number = -1;

    if (path.length === 1) {
      indexToRemove = path[0] as number;
      currentProcess.splice(indexToRemove, 1);
    } else {
      // Traverse to the parent array
      for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        if (typeof key === 'number') {
          targetArray = (targetArray as any[])[key];
        } else {
          targetArray = (targetArray as any)[key];
        }
      }
      indexToRemove = path[path.length - 1] as number; // The index within that array
      (targetArray as any[]).splice(indexToRemove, 1);
    }

    this.processSubject.next([...currentProcess]); // Emit new state to subscribers
  }

  /**
   * Updates a property of a step in the process data structure.
   * @param path The path to the step.
   * @param property The name of the property to update.
   * @param value The new value for the property.
   * @param subProperty Optional, for nested properties like condition.conditionType.
   */
  updateStepProperty(path: (string | number)[], property: string, value: any, subProperty: string | null = null): void {
    const currentProcess = this.getCurrentProcess();
    let currentStep: any = currentProcess;

    for (let i = 0; i < path.length; i++) {
      currentStep = currentStep[path[i]];
    }

    if (subProperty) {
      if (!currentStep[property]) {
        currentStep[property] = {}; // Initialize if it doesn't exist
      }
      currentStep[property][subProperty] = value;
    } else {
      currentStep[property] = value;
    }

    // Handle specific logic for action type changes to reset related fields
    if (property === 'actionType') {
      const actionStep = currentStep as ActionStep;
      if (value === 'page') {
        actionStep.name = 'scroll_down';
        delete actionStep.selector;
        delete actionStep.attribute;
        delete actionStep.steps;
        delete actionStep.url;
      } else if (value === 'element') {
        actionStep.name = 'get_text';
        actionStep.selector = this.testSelectors[0]; // Set default selector
        delete actionStep.attribute;
        delete actionStep.steps;
        delete actionStep.url;
      } else if (value === 'container') {
        actionStep.name = 'sequence';
        actionStep.steps = actionStep.steps || []; // Initialize steps array
        delete actionStep.selector;
        delete actionStep.attribute;
        delete actionStep.url;
      }
    } else if (property === 'name' && currentStep.actionType === 'page') {
      const actionStep = currentStep as ActionStep;
      if (value === 'visit_link') {
        actionStep.url = actionStep.url || ''; // Initialize URL
      } else {
        delete actionStep.url; // Remove URL if not 'visit_link'
      }
    } else if (property === 'loopType') {
      const loopStep = currentStep as LoopStep;
      if (value === 'fixed_iterations') {
        delete loopStep.condition;
        loopStep.iterations = loopStep.iterations || 1;
      } else {
        delete loopStep.iterations;
        loopStep.condition = loopStep.condition || { conditionType: 'element_found', selector: this.testSelectors[0] };
      }
    } else if (property === 'conditionType' && subProperty === null && currentStep.type === 'condition') {
      // For condition step's main conditionType
      const conditionStep = currentStep as ConditionStep;
      if (value === 'element_found' || value === 'element_not_found') {
        delete conditionStep.attribute;
        delete conditionStep.value;
      } else {
        conditionStep.attribute = conditionStep.attribute || '';
        conditionStep.value = conditionStep.value || '';
      }
    } else if (property === 'condition' && subProperty === 'conditionType' && currentStep.type === 'loop') {
      // For loop's stop conditionType
      const loopStep = currentStep as LoopStep;
      if (loopStep.condition) {
        if (value === 'element_found' || value === 'element_not_found') {
          delete loopStep.condition.attribute;
          delete loopStep.condition.value;
        } else {
          loopStep.condition.attribute = loopStep.condition.attribute || '';
          loopStep.condition.value = loopStep.condition.value || '';
        }
      }
    }


    this.processSubject.next([...currentProcess]); // Emit new state to subscribers
  }

  /**
   * Helper function to capitalize the first letter and replace underscores.
   * @param string The input string.
   * @returns The formatted string.
   */
  capitalizeFirstLetter(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ');
  }
}
