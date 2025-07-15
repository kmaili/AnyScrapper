export interface Task {
  id: string;
  name: string;
  url: string;
  schedule: 'Daily' | 'Weekly' | 'Monthly';
  status: 'Active' | 'Paused' | 'Failed';
  lastRun?: Date;
}