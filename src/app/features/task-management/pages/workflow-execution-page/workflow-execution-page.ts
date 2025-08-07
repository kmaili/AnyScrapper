import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WorkflowService } from '../../../task-creation/data-access/workflow/workflow.service';
import { Workflow } from '../../../task-creation/models/workflow.model';
import { WorkflowProcessComponent } from '../../ui/workflow-process-viewer/workflow-process';
import { CommonModule, DatePipe } from '@angular/common';
import { RealTimeWorkflowExecutionService } from '../../../task-creation/data-access/workflow/real-time-workflow-execution.service';
import { updateStepStatus } from '../../../task-creation/utils/workflow.utils';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { MessageService } from 'primeng/api';
import { Step } from '../../../task-creation/models/step.model';
import { WorkflowResultsComponent } from '../../ui/workflow-results/workflow-results';
@Component({
  selector: 'app-workflow-execution-page',
  imports: [CommonModule ,WorkflowProcessComponent, DatePipe, NgxJsonViewerModule, WorkflowResultsComponent],
  templateUrl: './workflow-execution-page.html',
  styleUrl: './workflow-execution-page.css'
})
export class WorkflowExecutionPage implements OnInit {
  workflow!: Workflow;

  @ViewChild('workflowResults') workflowResults!: ElementRef;
  constructor(private router: ActivatedRoute, private workflowService: WorkflowService, private changeDetectorRef: ChangeDetectorRef, private workflowExecutionService: RealTimeWorkflowExecutionService, private messageService: MessageService) {}


  ngOnInit(): void {
    const workflowId = this.router.snapshot.paramMap.get('id');
    if (!workflowId) {
      return;
    }

    this.workflowService.get_workflow_by_id(Number(workflowId)).subscribe({
      next: (workflow) => {
        this.workflow = workflow;
        console.log('Workflow fetched:', this.workflow);
        this.changeDetectorRef.detectChanges();
        this.scrollToWorkflowResults();
        this.startFetchingWorkflowExecution();
      },
      error: (error) => {
        console.error('Error fetching workflow:', error);
      }
    });
  }
  scrollToWorkflowResults() {
    if (this.workflowResults) {
      this.workflowResults.nativeElement.scrollIntoView({ behavior: 'smooth' });
      console.log('Scrolling to workflow results');
    }
  }
  startFetchingWorkflowExecution() {
    this.workflowExecutionService.setupWebSocket('ws://127.0.0.1:8000/ws/workflow_execution/', this.workflow.id!);
    this.workflowExecutionService.workflowExecution$.subscribe({
      next: (workflowExecution) => {
        console.log('Workflow execution updated:', workflowExecution);
        if (!workflowExecution) {
          return;
        }
        workflowExecution.steps_status.forEach((step_status: any) => {
          updateStepStatus(this.workflow, step_status);
        })
        this.changeDetectorRef.detectChanges();
        this.refreshIfFinished();
      },
      error: (error) => {
        console.error('Error fetching workflow execution:', error);
      }
    })
  }
  
  restartWorkflow() {
    this.workflow.results = [];
    this.workflowService.execute_workflow(this.workflow).subscribe({
      next: () => {
        this.workflow.status = 'in_progress';
        this.messageService.add({ severity: 'success', summary: 'Workflow Executed', detail: `Workflow "${this.workflow.name}" has been executed successfully.` });
      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: `Error executing workflow: ${error}` });
      }
    });
  }

  refreshIfFinished() {
    this.workflow.steps.forEach((step: Step) => {
      if (step.status === 'finished' || step.status === 'failed') {
       window.location.reload();
      }
    })
  }

}

