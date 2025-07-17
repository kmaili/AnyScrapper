import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WorkflowService } from '../../../task-creation/data-access/workflow/workflow.service';
import { Workflow } from '../../../task-creation/models/workflow.model';
import { WorkflowProcessComponent } from '../../ui/workflow-process-viewer/workflow-process';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-workflow-execution-page',
  imports: [WorkflowProcessComponent, DatePipe],
  templateUrl: './workflow-execution-page.html',
  styleUrl: './workflow-execution-page.css'
})
export class WorkflowExecutionPage implements OnInit {
  workflow!: Workflow;

  constructor(private router: ActivatedRoute, private workflowService: WorkflowService, private changeDetectorRef: ChangeDetectorRef) {}


  ngOnInit(): void {
    const workflowId = this.router.snapshot.paramMap.get('id');
    if (!workflowId) {
      return;
    }

    this.workflowService.get_workflow_by_id(Number(workflowId)).subscribe({
      next: (workflow) => {
        this.workflow = workflow;
        this.changeDetectorRef.detectChanges();
        console.log('Workflow fetched:', this.workflow);
      },
      error: (error) => {
        console.error('Error fetching workflow:', error);
      }
    });
  }

}
