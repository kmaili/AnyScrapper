import { Step } from './step.model';

export interface Workflow {
  id?: number;
  name: string;
  startUrl: string;
  steps: Step[]; // Optional: To hold all steps related to this workflow for easier manipulation (not directly from Django model)
  status?: 'completed' | 'in_progress' | 'draft';
}