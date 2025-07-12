import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UrlInputFormComponent } from '../../ui/url-input-form/url-input-form';
import { VisualSelectorToolComponent } from '../../ui/visual-selector-tool/visual-selector-tool';
import { TaskConfigFormComponent } from '../../ui/task-config-form/task-config-form';

interface Field {
  name: string;
  selector: string;
  visualPosition: string;
}

@Component({
  selector: 'app-new-task-page',
  standalone: true,
  imports: [CommonModule, RouterLink, UrlInputFormComponent, VisualSelectorToolComponent, TaskConfigFormComponent],
  templateUrl: './new-task-page.html',
  styleUrls: ['./new-task-page.css']
})
export class NewTaskPageComponent implements OnInit {
  currentStep: number = 1;
  selectedUrl: string = '';
  selectedFields: Field[] = [];
  
  // Transform selectedFields to match the expected type for app-task-config-form
  get transformedSelectedFields(): { name: string; position: string }[] {
    return this.selectedFields.map(field => ({
      name: field.name,
      position: field.visualPosition
    }));
  }

  ngOnInit() {
    // Initialize component state if needed
  }

  onUrlSubmitted(url: string) {
    this.selectedUrl = url;
    this.currentStep = 2;
  }

  onFieldsSelected(fields: Field[]) {
    this.selectedFields = fields;
    this.currentStep = 3;
  }

  onTaskSubmitted(task: any) {
    // Handle task submission
    console.log('Task submitted:', task);
  }
}