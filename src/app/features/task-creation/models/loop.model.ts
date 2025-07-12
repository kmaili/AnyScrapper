import { Action } from './action.model';

export interface Loop {
  type: 'loop';
  loopType?: 'fixed_iterations' | 'until_condition';
  iterations?: number;
  condition?: { conditionType?: string; selector: string; attribute?: string; value?: string };
  steps: Action[];
  tag?: string;
}
