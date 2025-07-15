export interface Action {
  type: 'action';
  actionType?: 'on_page' | 'on_element'; // Updated values
  name?: string;
  url?: string;
  selector?: number; // Made optional if not always needed for page actions
  attribute?: string;
  steps?: Action[];
  tag?: string;
  value?: string; // Added for 'element_input' or attribute comparisons
}