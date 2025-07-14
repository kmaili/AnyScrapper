import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../models/task.model';
import { Workflow } from '../../../task-creation/models/workflow.model';

@Component({
  selector: 'app-workflow-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './workflow-card.html',
  styleUrls: ['./workflow-card.css']
})
export class WorkflowCardComponent {
  @Input() workflow!: Workflow;
}