import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WorkflowCardComponent } from '../../ui/task-card/workflow-card';
import { WorkflowService } from '../../../task-creation/data-access/workflow/workflow.service';
import { Workflow } from '../../../task-creation/models/workflow.model';

@Component({
  selector: 'app-task-list-page',
  standalone: true,
  imports: [CommonModule, RouterLink, WorkflowCardComponent],
  templateUrl: './task-list-page.html',
  styleUrls: ['./task-list-page.css']
})
export class TaskListPageComponent implements OnInit {
  workflow_list: Workflow[] = [];
  loaded = false;

  constructor(
    private workflowService: WorkflowService,
    private cdr: ChangeDetectorRef
  ) {}  

  ngOnInit() {
    this.loadUserWorkflows();
  }

  loadUserWorkflows() {
  this.workflowService.get_workflows().subscribe({
    next: (workflows: Workflow[]) => {
      this.workflow_list = workflows ?? [];
      this.loaded = true;
      this.cdr.detectChanges(); // Forcer la détection des changements
      console.log('Workflows loaded:', this.workflow_list);
    },
    error: (err) => {
      console.error('Erreur lors du chargement des workflows:', err);
      this.loaded = true;
      this.cdr.detectChanges(); // Forcer la détection des changements
    }
  });
}

}
