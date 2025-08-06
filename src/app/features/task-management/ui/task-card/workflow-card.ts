import { Component, EventEmitter, Input, Output, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Workflow } from '../../../task-creation/models/workflow.model';
import { WorkflowService } from '../../../task-creation/data-access/workflow/workflow.service';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { SharePopup } from '../share-popup/share-popup';

@Component({
  selector: 'app-workflow-card',
  standalone: true,
  imports: [CommonModule, ToastModule, ButtonModule, AvatarGroupModule, AvatarModule, SharePopup],
  templateUrl: './workflow-card.html',
  styleUrls: ['./workflow-card.css']
})
export class WorkflowCardComponent {
  @Input() workflow!: Workflow;
  @Output() workflowDeleted = new EventEmitter<Workflow>();

  menuOpen: boolean = false;

  sharingToken!: string;

  constructor(private workflowService: WorkflowService, private router: Router, private messageService: MessageService) {}

  toggleMenu(event: Event) {
    event.stopPropagation();
    this.menuOpen = !this.menuOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const targetElement = event.target as HTMLElement;
    if (!targetElement.closest('.actions-menu-container')) {
      this.menuOpen = false;
    }
  }

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

  shareWorkflow() {
    this.workflowService.shareWorkflow(this.workflow.id!).subscribe({
      next: (response: any)=> {
        this.sharingToken = response.token;
      }
    })
  }
  deleteWorkflow() {
    const deleteConfirmed = window.confirm('Do you want to delete this workflow?');
    if (deleteConfirmed){
      this.onDeleteConfirm();
    }
  }
  
  onDeleteConfirm() {
    this.workflowService.deleteWorkflow(this.workflow.id!).subscribe({
      next: () => {
        this.workflowDeleted.emit(this.workflow);
        this.messageService.add({ severity: 'success', summary: 'Workflow Deleted', detail: `Workflow "${this.workflow.name}" has been deleted successfully.` });
      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: `Error deleting workflow: ${error}` });
      }
    });
  }

  openWorkflowProgress() {
    this.menuOpen = false;
    this.router.navigate(['/workflow', this.workflow.id]);
  }

  editWorkflow() {
    this.menuOpen = false;
    this.router.navigate(['/task-creation/edit', this.workflow.id]);
  }
}