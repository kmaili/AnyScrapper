/**
 * @file src/app/features/task-creation/models/process.model.ts
 * @description Defines TypeScript interfaces for the web scraping process steps.
 * This ensures type safety and a clear structure for the process definition.
 */

/**
 * Represents the type of an action.
 */
export type ActionType = 'page' | 'element' | 'container';

/**
 * Represents the specific name for a page action.
 */
export type PageActionName = 'scroll_down' | 'scroll_up' | 'refresh' | 'back' | 'forward' | 'visit_link';

/**
 * Represents the specific name for an element action.
 */
export type ElementActionName = 'get_text' | 'click' | 'long_click' | 'right_click' | 'double_click' | 'get_attribute' | 'get_inner_html';

/**
 * Represents the specific name for a container action (currently only 'sequence').
 */
export type ContainerActionName = 'sequence';

/**
 * Represents the type of a condition.
 */
export type ConditionType = 'element_found' | 'element_not_found' | 'element_attribute_equals' | 'element_attribute_not_equals';

/**
 * Represents the type of a loop.
 */
export type LoopType = 'fixed_iterations' | 'until_condition';

/**
 * Base interface for any step in the process.
 */
export interface BaseStep {
  type: 'action' | 'condition' | 'loop';
  // Common properties for all steps can go here if needed
}

/**
 * Interface for a Condition within a Loop.
 */
export interface LoopCondition {
  conditionType: ConditionType;
  selector: string;
  attribute?: string;
  value?: string;
}

/**
 * Interface for an Action step.
 */
export interface ActionStep extends BaseStep {
  type: 'action';
  actionType: ActionType;
  name: PageActionName | ElementActionName | ContainerActionName;
  selector?: string; // Used for 'element' actions
  attribute?: string; // Used for 'get_attribute'
  url?: string; // Used for 'visit_link'
  steps?: Step[]; // Used for 'container' (sequence) actions
}

/**
 * Interface for a Condition step.
 */
export interface ConditionStep extends BaseStep {
  type: 'condition';
  conditionType: ConditionType;
  selector: string;
  attribute?: string;
  value?: string;
  ifTrue: Step[];
  ifFalse: Step[];
}

/**
 * Interface for a Loop step.
 */
export interface LoopStep extends BaseStep {
  type: 'loop';
  loopType: LoopType;
  iterations?: number; // Used for 'fixed_iterations'
  condition?: LoopCondition; // Used for 'until_condition'
  steps: Step[];
}

/**
 * Union type for all possible step types.
 */
export type Step = ActionStep | ConditionStep | LoopStep;

/**
 * Predefined list of CSS selectors for testing purposes.
 */
export const TEST_SELECTORS: string[] = [
  '#main-content',
  '.product-title',
  'a.nav-link',
  'div.item-card',
  'p.description',
  'h1',
  'h2',
  'button.submit-btn',
  'input[type="text"]',
  'span.price',
  'img',
  'body',
  'html'
];
