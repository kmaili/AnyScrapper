import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WorkflowService } from '../../../task-creation/data-access/workflow/workflow.service';
import { Workflow } from '../../../task-creation/models/workflow.model';
import { WorkflowProcessComponent } from '../../ui/workflow-process-viewer/workflow-process';
import { DatePipe } from '@angular/common';
import { RealTimeWorkflowExecutionService } from '../../../task-creation/data-access/workflow/real-time-workflow-execution.service';
import { updateStepStatus } from '../../../task-creation/utils/workflow.utils';
@Component({
  selector: 'app-workflow-execution-page',
  imports: [WorkflowProcessComponent, DatePipe],
  templateUrl: './workflow-execution-page.html',
  styleUrl: './workflow-execution-page.css'
})
export class WorkflowExecutionPage implements OnInit {
  workflow!: Workflow;

  constructor(private router: ActivatedRoute, private workflowService: WorkflowService, private changeDetectorRef: ChangeDetectorRef, private workflowExecutionService: RealTimeWorkflowExecutionService) {}


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

}
