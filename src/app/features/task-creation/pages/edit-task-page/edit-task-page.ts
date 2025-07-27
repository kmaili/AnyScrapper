import { Component, OnInit } from '@angular/core';
import { DomElementsSelectorWsService } from '../../data-access/dom-elements-selector/real-time-dom-elemnts-selector.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { WorkflowService } from '../../data-access/workflow/workflow.service';
import { Workflow } from '../../models/workflow.model';
import { VisualSelectorToolComponent } from '../../ui/visual-selector-tool/visual-selector-tool';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-task-page',
  imports: [CommonModule, VisualSelectorToolComponent, FormsModule],
  templateUrl: './edit-task-page.html',
  styleUrl: './edit-task-page.css'
})
export class EditTaskPage implements OnInit {

 workflow: Workflow | null = null;


  constructor(private wsService: DomElementsSelectorWsService, private route: ActivatedRoute,
    private workflowService: WorkflowService, private router: Router,
    private messageService: MessageService
  ) {}
  ngOnInit(): void {
    const workflowId = this.route.snapshot.paramMap.get('id');
      if (workflowId) {
        this.workflowService.get_workflow_by_id(Number(workflowId)).subscribe({
          next: (workflow) => {
            this.workflow = workflow;
          },
          error: (error) => {
            console.error('Error fetching workflow:', error);
          }
        });
      }
  }



  updateWorkflow(workflow: any) {
    this.workflow!.steps = workflow.steps;
    console.log("--------", this.workflow);
    this.workflowService.update_workflow(this.workflow!).subscribe({
      next: (workflow) => {
        this.router.navigate(['/']);
        this.messageService.add({ severity: 'success', summary: 'Workflow Updated', detail: `Workflow "${workflow}" has been updated successfully.` });
      }
    })
  }

}
