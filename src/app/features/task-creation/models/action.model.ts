export interface Action {
  step?: number; // FK back to Step.id
  action_type: string;
  action_name: string;
  selector?: number | null;  // DomElement ID
  attribute?: string | null;
  value?: string | null;
  url?: string | null;
}