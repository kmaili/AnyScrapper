// src/app/models/step.model.ts
import { Action } from './action.model';
import { Condition } from './condition.model';
import { Loop } from './loop.model';

export interface Step {
  id: number;
  tag?: string | null;
  step_type: 'action' | 'condition' | 'loop';
  workflow: number;
  parent_loop?: number | null;  // FK to Loop id, nullable
  order: number;

  // Detailed step data depending on type
  action?: Action;
  condition?: Condition;
  loop?: Loop;
}