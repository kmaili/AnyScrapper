import { Step } from "./step.model";

export interface Loop {
  step?: number;
  loop_type: string;
  iterations_count?: number | null;
  condition_element_selector?: number | null;
  condition_type?: string | null;
  condition_element_attribute?: string | null;
  condition_attribute_value?: string | null;

  child_steps?: Step[];  // IMPORTANT: nested steps inside this loop
}