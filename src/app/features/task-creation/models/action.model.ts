export interface Action {
  fallback_selector?: number;
  hover_duration?: number;
  key_code?: string;
  step?: number; // FK back to Step.id
  action_type: 'interaction' | 'data_collection';
  action_name: string;
  selector?: number;
  attribute?: string;
  expected_value?: string;
  url?: string;
  result?: any;
  useChildIterableSelector?: boolean;
}