import { Action } from './action.model';

export interface Condition {
  type: 'condition';
  conditionType?: 'element_found' | 'element_not_found' | 'element_attribute_equals' | 'element_attribute_not_equals';
  selector: string;
  attribute?: string;
  value?: string;
  ifTrue: Action[];
  ifFalse: Action[];
  tag?: string;
}
