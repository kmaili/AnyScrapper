// new-task-page.ts (corrigé)

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
// Retirer RouterLink si non utilisé dans template
import { UrlInputFormComponent } from '../../ui/url-input-form/url-input-form';
import { VisualSelectorToolComponent } from '../../ui/visual-selector-tool/visual-selector-tool';
import { TaskConfigFormComponent } from '../../ui/task-config-form/task-config-form';

@Component({
  selector: 'app-new-task-page',
  standalone: true,
  imports: [CommonModule, UrlInputFormComponent, VisualSelectorToolComponent, TaskConfigFormComponent],
  templateUrl: './new-task-page.html',
  styleUrls: ['./new-task-page.css']
})
export class NewTaskPageComponent {
  currentStep: number = 1;
  submittedUrl: string = '';

  // Adapter le type pour correspondre à ce que TaskConfigFormComponent attend (position au lieu de visualPosition)
  selectedFields: { name: string; position: string }[] = [];

  onUrlSubmitted(url: string): void {
    this.submittedUrl = url;
    this.currentStep = 2;
  }

  onFieldsSelected(fields: { name: string; selector: string; visualPosition: string }[]): void {
    // Transformer en {name, position}
    this.selectedFields = fields.map(f => ({
      name: f.name,
      position: f.visualPosition
    }));
    this.currentStep = 3;
  }

  onTaskSubmitted(task: any): void {
    console.log('Task submitted:', task);
  }

  cancel(): void {
    console.log('Task creation cancelled');
  }
}
