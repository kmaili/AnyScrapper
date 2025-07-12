
export interface Action {
  type: 'action';
  actionType?: 'page' | 'element' | 'container';
  name?: string;
  url?: string;
  selector: string;
  attribute?: string;
  steps?: Action[];
  tag?: string;
}
