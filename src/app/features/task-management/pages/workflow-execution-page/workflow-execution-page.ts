import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WorkflowService } from '../../../task-creation/data-access/workflow/workflow.service';
import { Workflow } from '../../../task-creation/models/workflow.model';
import { WorkflowProcessComponent } from '../../ui/workflow-process-viewer/workflow-process';
import { CommonModule, DatePipe } from '@angular/common';
import { RealTimeWorkflowExecutionService } from '../../../task-creation/data-access/workflow/real-time-workflow-execution.service';
import { updateStepStatus } from '../../../task-creation/utils/workflow.utils';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { MessageService } from 'primeng/api';
@Component({
  selector: 'app-workflow-execution-page',
  imports: [CommonModule ,WorkflowProcessComponent, DatePipe, NgxJsonViewerModule],
  templateUrl: './workflow-execution-page.html',
  styleUrl: './workflow-execution-page.css'
})
export class WorkflowExecutionPage implements OnInit {
  workflow!: Workflow;

  constructor(private router: ActivatedRoute, private workflowService: WorkflowService, private changeDetectorRef: ChangeDetectorRef, private workflowExecutionService: RealTimeWorkflowExecutionService, private messageService: MessageService) {}


  ngOnInit(): void {
    const workflowId = this.router.snapshot.paramMap.get('id');
    if (!workflowId) {
      return;
    }

    this.workflowService.get_workflow_by_id(Number(workflowId)).subscribe({
      next: (workflow) => {
        this.workflow = workflow;
        this.changeDetectorRef.detectChanges();
        this.startFetchingWorkflowExecution();
        console.log('Workflow fetched:', this.workflow);
      },
      error: (error) => {
        console.error('Error fetching workflow:', error);
      }
    });
  }
  startFetchingWorkflowExecution() {
    this.workflowExecutionService.setupWebSocket('ws://localhost:8000/ws/workflow_execution/', this.workflow.id!);
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
      },
      error: (error) => {
        console.error('Error fetching workflow execution:', error);
      }
    })
  }
  exportToJson() {
    try {
      const jsonString = JSON.stringify(this.workflow.results!, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'workflow-results.json';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting JSON:', error);
      alert('Failed to export JSON. Check console for details.');
    }
  }
  restartWorkflow() {
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

}
