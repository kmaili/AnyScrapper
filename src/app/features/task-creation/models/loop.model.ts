import { DomElement } from "./dom-element.model";
import { Step } from "./step.model";

export interface Loop {
  fallback_selector?: number;
  step?: number;
  loop_type: string;
  iterations_count?: number;
  condition_element_selector?: number;
  condition_type?: string;
  condition_element_attribute?: string;
  condition_attribute_value?: string;

  parent_iterable_element_selector?: number;
  parent_iterable_element_selector_fallback?: number;
  child_iterable_element_selector?: number;
  child_iterable_element_selector_fallback?: number;

  child_steps?: Step[];
}