import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Step } from '../../../task-creation/models/step.model';
import { Condition } from '../../../task-creation/models/condition.model';
import { Loop } from '../../../task-creation/models/loop.model';
import { Action } from '../../../task-creation/models/action.model';
import { ActivatedRoute } from '@angular/router';
import { RealTimeWorkflowExecutionService } from '../../../task-creation/data-access/workflow/real-time-workflow-execution.service';

@Component({
  selector: 'app-workflow-process-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './workflow-process.html',
  styleUrls: ['./workflow-process.css']
})
export class WorkflowProcessComponent implements OnInit{
  @Input() steps: Step[] = [];
  @Input() stepStatuses: { [id: string]: 'not-executed' | 'executing' | 'finished' | 'failed' } = {};
  @Input() isRoot = true; // set this only in the top-level component

  expandedSteps = new Set<any>();



  ngOnInit(): void {
    
    this.steps.forEach(step => {
      this.expandedSteps.add(step)
    })
    
  }
  

  toggleStep(step: any): void {
    if (this.expandedSteps.has(step)) {
      this.expandedSteps.delete(step);
    } else {
      this.expandedSteps.add(step);
    }
  }

  isExpanded(step: any): boolean {
    return this.expandedSteps.has(step);
  }

  getStatusClass(step: any): string {
    const status = step.status || 'not-executed';
    return `status-${status}`;
  }

  isAction(step: any): step is Action {
    return step.step_type === 'action';
  }

  isLoop(step: any): step is Loop {
    return step.step_type === 'loop';
  }

  isCondition(step: any): step is Condition {
    return step.step_type === 'condition';
  }

  conditionIsTrueStep(step: any): any {
    return step.condition.if_true_child_steps;
  }

  conditionIsFalseStep(step: any): any {
    return step.condition.if_false_child_steps;
  }

  getStepName(step: Step): string {
  if (!step) return 'Unnamed Step';

  switch (step.step_type) {
    case 'action':
      if (step.action) {
        const actionLabel = {
          'element_text': 'Extracting text',
          'element_get_inner_html': 'Extracting inner HTML',
          'element_get_attribute_value': `Extracting ${step.action.attribute || 'attribute'} value`,
          'element_check_attribute_value_equals': `Checking if ${step.action.attribute || 'attribute'} equals ${step.action.expected_value || 'value'}`,
          'element_check_attribute_value_not_equals': `Checking if ${step.action.attribute || 'attribute'} not equals ${step.action.expected_value || 'value'}`,
          'element_check_attribute_exists': 'Checking if attribute exists',
          'element_check_attribute_value_contains': `Checking if ${step.action.attribute || 'attribute'} contains ${step.action.expected_value || 'value'}`,
          'element_check_attribute_value_starts_with': `Checking if ${step.action.attribute || 'attribute'} starts with ${step.action.expected_value || 'value'}`,
          'element_check_attribute_value_ends_with': `Checking if ${step.action.attribute || 'attribute'} ends with ${step.action.expected_value || 'value'}`,
          'element_click': 'Clicking element',
          'element_right_click': 'Right-clicking element',
          'element_double_click': 'Double-clicking element',
          'element_hover': 'Hovering over element',
          'element_input_text': `Inputting text ${step.action.expected_value || ''}`,
          'element_clear_input': 'Clearing input',
          'element_long_press': 'Long pressing element',
          'page_scroll_up': 'Scrolling page up',
          'page_scroll_down': 'Scrolling page down',
          'page_refresh': 'Refreshing page',
          'page_navigate': `Navigating to ${step.action.url || 'URL'}`,
          'page_go_back': 'Going back in page history',
          'page_go_forward': 'Going forward in page history',
          'scroll_to_element': 'Scrolling to element'
        }[step.action.action_name] || 'Performing action';

        return step.action.selector !== undefined && step.action.selector !== null
          ? `${actionLabel} from element (Selector: ${step.action.selector})`
          : `${actionLabel}`;
      }
      break;

    case 'condition':
      if (step.condition) {
        const conditionLabel = {
          'element_found': 'Checking if element is found',
          'element_not_found': 'Checking if element is not found',
          'element_text_equals': `Checking if element text equals ${step.condition.expected_value || 'value'}`,
          'element_text_contains': `Checking if element text contains ${step.condition.expected_value || 'value'}`,
          'element_attribute_equals': `Checking if ${step.condition.attribute || 'attribute'} equals ${step.condition.expected_value || 'value'}`,
          'element_attribute_not_equals': `Checking if ${step.condition.attribute || 'attribute'} not equals ${step.condition.expected_value || 'value'}`,
          'element_attribute_exists': 'Checking if attribute exists',
          'element_attribute_contains': `Checking if ${step.condition.attribute || 'attribute'} contains ${step.condition.expected_value || 'value'}`,
          'element_attribute_starts_with': `Checking if ${step.condition.attribute || 'attribute'} starts with ${step.condition.expected_value || 'value'}`,
          'element_attribute_ends_with': `Checking if ${step.condition.attribute || 'attribute'} ends with ${step.condition.expected_value || 'value'}`
        }[step.condition.condition_type] || 'Evaluating condition';

        return step.condition.selector !== undefined && step.condition.selector !== null
          ? `${conditionLabel} (Selector: ${step.condition.selector})`
          : `${conditionLabel}`;
      }
      break;

    case 'loop':
      if (step.loop) {
        const loopLabel = step.loop.loop_type === 'fixed_iterations'
          ? `Looping ${step.loop.iterations_count || 'N'} times`
          : `Looping until ${step.loop.condition_type ? this.getConditionDescription(step.loop.condition_type, step.loop.condition_element_attribute, step.loop.condition_attribute_value) : 'condition met'}`;
        return `${loopLabel}`;
      }
      break;
  }

  return `Performing ${step.step_type || 'unknown'} step`;
}

getConditionDescription(conditionType: string, attribute?: string, value?: string): string {
  switch (conditionType) {
    case 'element_found':
      return 'element is found';
    case 'element_not_found':
      return 'element is not found';
    case 'element_attribute_equals':
      return `attribute ${attribute || 'unknown'} equals ${value || 'value'}`;
    case 'element_attribute_not_equals':
      return `attribute ${attribute || 'unknown'} not equals ${value || 'value'}`;
    default:
      return 'condition met';
  }
}
}

