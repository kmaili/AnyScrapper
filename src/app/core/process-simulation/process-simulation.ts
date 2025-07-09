import { Injectable } from '@angular/core';
import { ProcessDataService } from '../process-data/process-data';
import { Step, ActionStep, ConditionStep, LoopStep, LoopCondition } from '../../features/task-creation/models/process.model';

/**
 * @file src/app/core/services/process-simulation.service.ts
 * @description Service responsible for simulating the execution of the web scraping process.
 * It logs actions to the console and mimics browser interactions.
 */
@Injectable({
  providedIn: 'root'
})
export class ProcessSimulationService {

  constructor(private processDataService: ProcessDataService) {}

  /**
   * Simulates running the defined process.
   * Logs actions to the console and checks for element existence.
   * @param steps The array of steps to execute.
   * @param indent String for console indentation.
   */
  async runProcessSimulation(steps: Step[], indent: string = ''): Promise<void> {
    for (const step of steps) {
      console.log(`${indent}Executing: ${this.processDataService.capitalizeFirstLetter(step.type)} - ${this.processDataService.capitalizeFirstLetter((step as any).name || (step as any).conditionType || (step as any).loopType)}`);

      if (step.type === 'action') {
        const actionStep = step as ActionStep;
        if (actionStep.actionType === 'page') {
          console.log(`${indent}  Page Action: ${actionStep.name}`);
          if (actionStep.name === 'scroll_down') {
            // Simulate scroll (actual scroll in browser)
            window.scrollBy(0, 500);
          } else if (actionStep.name === 'scroll_up') {
            // Simulate scroll (actual scroll in browser)
            window.scrollBy(0, -500);
          } else if (actionStep.name === 'visit_link') {
            console.log(`${indent}    Simulating visit to URL: ${actionStep.url || 'No URL specified'}`);
            // In a real scenario, this would navigate. For security in iframe, we just log.
          }
          // For refresh, back, forward, we just log.
        } else if (actionStep.actionType === 'element') {
          const element = document.querySelector(actionStep.selector || '');
          if (element) {
            console.log(`${indent}  Element Action: Found element with selector "${actionStep.selector}". Performing "${actionStep.name}".`);
            if (actionStep.name === 'get_text') {
              console.log(`${indent}    Text: "${element.textContent?.trim().substring(0, 100)}..."`);
            } else if (actionStep.name === 'get_attribute') {
              const attrValue = element.getAttribute(actionStep.attribute || '');
              console.log(`${indent}    Attribute "${actionStep.attribute}": "${attrValue}"`);
            } else if (actionStep.name === 'get_inner_html') {
              console.log(`${indent}    Inner HTML: "${element.innerHTML?.trim().substring(0, 100)}..."`);
            }
            // For click, long_click, right_click, double_click, we just log.
          } else {
            console.warn(`${indent}  Element Action: Element with selector "${actionStep.selector}" not found.`);
          }
        } else if (actionStep.actionType === 'container' && actionStep.name === 'sequence') {
          console.log(`${indent}  Starting Sequence Action.`);
          if (actionStep.steps) {
            await this.runProcessSimulation(actionStep.steps, indent + '  '); // Recursively run steps within the sequence
          }
          console.log(`${indent}  Finished Sequence Action.`);
        }
      } else if (step.type === 'condition') {
        const conditionStep = step as ConditionStep;
        let conditionMet = false;
        const element = document.querySelector(conditionStep.selector);

        if (conditionStep.conditionType === 'element_found') {
          conditionMet = !!element;
        } else if (conditionStep.conditionType === 'element_not_found') {
          conditionMet = !element;
        } else if (conditionStep.conditionType === 'element_attribute_equals') {
          conditionMet = !!element && element.getAttribute(conditionStep.attribute || '') === conditionStep.value;
        } else if (conditionStep.conditionType === 'element_attribute_not_equals') {
          conditionMet = !!element && element.getAttribute(conditionStep.attribute || '') !== conditionStep.value;
        }

        console.log(`${indent}  Condition "${this.processDataService.capitalizeFirstLetter(conditionStep.conditionType)}" on "${conditionStep.selector}" evaluated to: ${conditionMet}`);

        if (conditionMet) {
          console.log(`${indent}  -> Condition TRUE. Executing If True branch.`);
          await this.runProcessSimulation(conditionStep.ifTrue, indent + '  ');
        } else {
          console.log(`${indent}  -> Condition FALSE. Executing If False branch.`);
          await this.runProcessSimulation(conditionStep.ifFalse, indent + '  ');
        }
      } else if (step.type === 'loop') {
        const loopStep = step as LoopStep;
        if (loopStep.loopType === 'fixed_iterations') {
          for (let i = 0; i < (loopStep.iterations || 0); i++) {
            console.log(`${indent}  Loop Iteration ${i + 1}/${loopStep.iterations}`);
            await this.runProcessSimulation(loopStep.steps, indent + '  ');
          }
        } else if (loopStep.loopType === 'until_condition') {
          let iteration = 0;
          let stopConditionMet = false;
          while (!stopConditionMet) {
            iteration++;
            console.log(`${indent}  Loop Iteration ${iteration}`);
            await this.runProcessSimulation(loopStep.steps, indent + '  ');

            const condition = loopStep.condition as LoopCondition;
            const element = document.querySelector(condition.selector);

            if (condition.conditionType === 'element_found') {
              stopConditionMet = !!element;
            } else if (condition.conditionType === 'element_not_found') {
              stopConditionMet = !element;
            } else if (condition.conditionType === 'element_attribute_equals') {
              stopConditionMet = !!element && element.getAttribute(condition.attribute || '') === condition.value;
            } else if (condition.conditionType === 'element_attribute_not_equals') {
              stopConditionMet = !!element && element.getAttribute(condition.attribute || '') !== condition.value;
            }
            console.log(`${indent}  Loop Stop Condition "${this.processDataService.capitalizeFirstLetter(condition.conditionType)}" on "${condition.selector}" evaluated to: ${stopConditionMet}`);

            // Prevent infinite loops in simulation if condition is never met
            if (!stopConditionMet && iteration > 100) {
              console.warn(`${indent}  Loop reached 100 iterations without stop condition met. Breaking loop.`);
              break;
            }
          }
        }
      }
    }
  }
}
