import { Step } from './step.model';

export interface Workflow {
  id?: number;
  name: string;
  created_at?: Date;
  startUrl: string;
  steps: Step[];
  status?: 'completed' | 'in_progress' | 'draft' | 'failed';
  results?: number[];

  isScheduled: boolean;
  scheduleStartTime?: Date;
  scheduleFrequency?: 'once' | 'daily' | 'weekly';
}