import { Step } from './step.model';

export interface Workflow {
  id?: number;
  name: string;
  created_at?: string;
  start_step?: number; // ID of the starting step
  steps?: Step[]; // Optional: To hold all steps related to this workflow for easier manipulation (not directly from Django model)
}