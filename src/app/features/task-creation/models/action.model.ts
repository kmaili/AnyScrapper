export interface Action {
  hover_duration?: number;
  key_code?: string;
  step?: number; // FK back to Step.id
  action_type: 'interaction' | 'data_collection';
  action_name: string;
  selector?: number | null;
  attribute?: string | null;
  expected_value?: string | null;
  url?: string | null;
  result?: any;
}