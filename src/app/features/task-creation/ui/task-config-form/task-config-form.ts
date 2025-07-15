import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Step } from '../../models/step.model';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { WorkflowService } from '../../data-access/workflow/workflow.service';
import { Workflow } from '../../models/workflow.model';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-task-config-form',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxJsonViewerModule],
  templateUrl: './task-config-form.html',
  styleUrls: ['./task-config-form.css']
})
export class TaskConfigFormComponent {
  @Input() workflow: Workflow = {
    name: '',
    startUrl: '',
    steps: []
  };
  @Output() workflowSubmitted = new EventEmitter<Workflow>();
  @Output() cancel = new EventEmitter<void>();
  task = {
    name: '',
    schedule: '',
    exportFormat: ''
  };
  submitTask(): void {
    this.workflowSubmitted.emit(this.workflow);
  }

  cancelTask(): void {
    this.cancel.emit();
  }
}