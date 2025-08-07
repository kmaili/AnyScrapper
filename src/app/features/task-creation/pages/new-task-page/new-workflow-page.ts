import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { UrlInputFormComponent } from '../../ui/url-input-form/url-input-form';
import { VisualSelectorToolComponent } from '../../ui/visual-selector-tool/visual-selector-tool';
import { TaskConfigFormComponent } from '../../ui/task-config-form/task-config-form';
import { Step } from '../../models/step.model';
import { Workflow } from '../../models/workflow.model';
import { WorkflowService } from '../../data-access/workflow/workflow.service';
import { MessageService } from 'primeng/api';


@Component({
  selector: 'app-new-task-page',
  standalone: true,
  imports: [CommonModule, UrlInputFormComponent, VisualSelectorToolComponent, TaskConfigFormComponent, RouterModule],
  templateUrl: './new-workflow-page.html',
  styleUrls: ['./new-workflow-page.css']
})
export class NewTaskPageComponent implements OnInit {
  currentStep: number = 1;
  workflow: Workflow = {
    name: '',
    startUrl: '',
    steps: [],
    isScheduled: false
  };
  constructor(private workflowService: WorkflowService, private messageService: MessageService, private router: Router) {}
  

  ngOnInit() {
    // Initialize component state if needed
  }

  onUrlSubmitted(url: string) {
    this.workflow.startUrl = url;
    this.currentStep = 2;
  }

  onWorkflowCompleted(event: any) {
    this.workflow = event;
    this.currentStep = 3;
  }

  onworkflowSubmitted(workflow: any) {
    this.workflowService.create_workflow(this.workflow).subscribe({
      next: (response: any) => {
        console.log('Task created successfully:', response);
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Workflow created successfully!' });
        this.router.navigate(['/']);
      }
      , error: (error) => {
        console.error('Error creating task:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create workflow.' });
      }
  });

  }
}