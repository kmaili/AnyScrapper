import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkflowService } from '../../../task-creation/data-access/workflow/workflow.service';

@Component({
  selector: 'app-workflow-results',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './workflow-results.html',
  styleUrls: ['./workflow-results.css']
})
export class WorkflowResultsComponent implements OnInit {
  results: any;
  selectedIndex: number | null = null;
  selectedResult: any = null;

  @Input() workflowId!: number;

  constructor(private workflowService: WorkflowService) {}

  ngOnInit() {
    this.fetchWorkflowResults();
  }
  fetchWorkflowResults() {
    this.workflowService.getWorkflowResults(this.workflowId).subscribe({
      next: (res: any) => {
        this.results = res;
        this.selectResult(this.results.length - 1);
      },
      error: (error) => {
        console.error('Error fetching workflow results:', error);
      }
  })
}

  selectResult(index: number): void {
    this.selectedIndex = index;
    this.selectedResult = this.results[index].data;
  }

  exportToJson(selectedResult: any): void {
    try {
      const jsonString = JSON.stringify(selectedResult, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'workflow-results.json';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting JSON:', error);
      alert('Failed to export JSON. Check console for details.');
    }
  }
}