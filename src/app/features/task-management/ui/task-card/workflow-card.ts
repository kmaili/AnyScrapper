import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Workflow } from '../../../task-creation/models/workflow.model';
import { WorkflowService } from '../../../task-creation/data-access/workflow/workflow.service';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

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

  constructor(private workflowService: WorkflowService, private router: Router, private messageService: MessageService) {}

  executeWorkflow(){
    this.workflowService.execute_workflow(this.workflow).subscribe({
      next: (_) => {
        this.workflow.status = 'in_progress';
        this.messageService.add({ severity: 'success', summary: 'Workflow Executed', detail: `Workflow "${this.workflow.name}" has been executed successfully.` });
        this.openWorkflowProgress();
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
  openWorkflowProgress() {
    console.log('Editing workflow:', this.workflow);
    this.router.navigate(['/workflow', this.workflow.id]);
  }
}