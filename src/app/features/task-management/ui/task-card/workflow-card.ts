import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Workflow } from '../../../task-creation/models/workflow.model';
import { WorkflowService } from '../../../task-creation/data-access/workflow/workflow.service';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';

@Component({
  selector: 'app-workflow-card',
  standalone: true,
  imports: [CommonModule, ToastModule, ButtonModule, AvatarGroupModule, AvatarModule],
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
    this.messageService.add({
      key: 'deleteWorkflow',
      severity: 'warn',
      summary: 'Delete Workflow',
      detail: `Are you sure you want to delete the workflow "${this.workflow.name}"?`,
      sticky: true,
      closable: true,
    })
  }
  onDeleteConfirm(message: any) {
    this.workflowService.deleteWorkflow(this.workflow.id!).subscribe({
      next: () => {
        this.workflowDeleted.emit(this.workflow);
        console.log('Workflow deleted successfully');
      },
      error: (error) => {
        console.error('Error deleting workflow:', error);
      }
    });
    this.messageService.clear('deleteWorkflow');
  }

  onDeleteRefuse(message: any) {

    this.messageService.clear('deleteWorkflow');
  }


  openWorkflowProgress() {
    console.log('Editing workflow:', this.workflow);
    this.router.navigate(['/workflow', this.workflow.id]);
  }
  editWorkflow() {
    console.log('Editing workflow:', this.workflow);
    this.router.navigate(['/task-creation/edit', this.workflow.id]);
  }
}