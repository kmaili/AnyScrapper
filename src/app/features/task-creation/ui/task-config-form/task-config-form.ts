import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-task-config-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-config-form.html',
  styleUrls: ['./task-config-form.css']
})
export class TaskConfigFormComponent {
  @Input() selectedFields: { name: string; position: string }[] = [];
  @Output() taskSubmitted = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();
  task = {
    name: '',
    schedule: '',
    exportFormat: ''
  };

  isFormValid(): boolean {
    return !!this.task.name && !!this.task.schedule && !!this.task.exportFormat && this.selectedFields.every(field => !!field.name);
  }

  submitTask(): void {
    if (this.isFormValid()) {
      this.taskSubmitted.emit({
        ...this.task,
        fields: this.selectedFields
      });
    }
  }

  cancelTask(): void {
    this.cancel.emit();
  }
}