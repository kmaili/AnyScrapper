import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { Workflow } from '../../models/workflow.model';
import { isValidUrl } from '../visual-selector-tool/visual-selector-tool';

@Component({
  selector: 'app-task-config-form',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxJsonViewerModule],
  templateUrl: './task-config-form.html',
  styleUrls: ['./task-config-form.css']
})
export class TaskConfigFormComponent {

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: BeforeUnloadEvent): void {
    $event.preventDefault();
  }
  
  @Input() workflow!: Workflow;
  @Output() workflowSubmitted = new EventEmitter<Workflow>();
  @Output() cancel = new EventEmitter<void>();
  

  validationErrors: string[] = [];

  private validateWorkflow(workflow: Workflow): boolean {
    this.validationErrors = [];

    if (!workflow.name.trim()) {
      this.validationErrors.push('Workflow name is required.');
    }
    if (!workflow.startUrl.trim()) {
      this.validationErrors.push('Start URL is required.');
    } else if (!isValidUrl(workflow.startUrl)) {
      this.validationErrors.push('Start URL must be a valid URL (e.g., https://example.com).');
    }
    else if (workflow.isScheduled && !workflow.scheduleStartTime) {
      this.validationErrors.push('Schedule start time is required for scheduled workflows.');
    }
    if (workflow.isScheduled && !workflow.scheduleFrequency) {
      this.validationErrors.push('Schedule frequency is required for scheduled workflows.');
    }

    return this.validationErrors.length === 0;
  }

  submitTask(): void {
    const isValid = this.validateWorkflow(this.workflow);
    if (!isValid) {
      return;
    }
    this.workflowSubmitted.emit(this.workflow);
  }

  cancelTask(): void {
    this.cancel.emit();
  }
}