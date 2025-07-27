import { Step } from './step.model';

export interface Workflow {
  dataGroups?: any[];
  id?: number;
  name: string;
  created_at?: Date;
  startUrl: string;
  steps: Step[];
  status?: 'completed' | 'in_progress' | 'draft' | 'failed';
  results?: any[];
}