import { Step } from "./step.model";

export interface Loop {
  step?: number;
  loop_type: string;
  iterations_count?: number;
  condition_element_selector?: number;
  condition_type?: string;
  condition_element_attribute?: string;
  condition_attribute_value?: string;

  child_steps?: Step[];  // IMPORTANT: nested steps inside this loop
}