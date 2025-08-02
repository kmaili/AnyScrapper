import { Step } from "./step.model";

export interface Condition {
  fallback_selector?: number;
  step?: number;
  condition_type: string;
  selector?: number;  // DomElement ID
  attribute?: string | null;
  expected_value?: string | null;

  if_true_child_steps?: Step[] | null;
  if_false_child_steps?: Step[] | null;
  useChildIterableSelector?: boolean;
}