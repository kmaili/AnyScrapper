import { Step } from "./step.model";

export interface Condition {
  step?: number;
  condition_type: string;
  selector: number;  // DomElement ID
  attribute?: string | null;
  value?: string | null;

  if_true_child_steps?: Step[] | null;
  if_false_child_steps?: Step[] | null;
}