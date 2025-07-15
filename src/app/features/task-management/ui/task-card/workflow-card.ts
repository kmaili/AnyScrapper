import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../models/task.model';
import { Workflow } from '../../../task-creation/models/workflow.model';
import { WorkflowService } from '../../../task-creation/data-access/workflow/workflow.service';

@Component({
  selector: 'app-workflow-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './workflow-card.html',
  styleUrls: ['./workflow-card.css']
})
export class WorkflowCardComponent {
  @Input() workflow!: Workflow;

  @Output() workflowDeleted = new EventEmitter<Workflow>();

  constructor(private workflowService: WorkflowService) {}

  executeWorkflow(){
    this.workflowService.execute_workflow(this.workflow).subscribe({
      next: (response) => {
        console.log('Workflow executed successfully:', response);
      },
      error: (error) => {
        console.error('Error executing workflow:', error);
      }
    });
  }

  deleteWorkflow() {
    this.workflowService.deleteWorkflow(this.workflow.id!).subscribe({
      next: () => {
        this.workflowDeleted.emit(this.workflow);
        console.log('Workflow deleted successfully');
      },
      error: (error) => {
        console.error('Error deleting workflow:', error);
      }
    });
  }
}