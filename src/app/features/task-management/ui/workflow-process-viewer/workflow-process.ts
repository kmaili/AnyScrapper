import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Step } from '../../../task-creation/models/step.model';
import { Condition } from '../../../task-creation/models/condition.model';
import { Loop } from '../../../task-creation/models/loop.model';
import { Action } from '../../../task-creation/models/action.model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-workflow-process-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './workflow-process.html',
  styleUrls: ['./workflow-process.css']
})
export class WorkflowProcessComponent implements OnInit{
  @Input() steps: Step[] = [];
  @Input() stepStatuses: { [id: string]: 'not-executed' | 'executing' | 'finished' | 'failed' } = {};
  @Input() isRoot = true; // set this only in the top-level component

  expandedSteps = new Set<any>();

  ngOnInit(): void {
    if (!this.isRoot) {
      return;
    }
  }
  

  toggleStep(step: any): void {
    if (this.expandedSteps.has(step)) {
      this.expandedSteps.delete(step);
    } else {
      this.expandedSteps.add(step);
    }
  }

  isExpanded(step: any): boolean {
    return this.expandedSteps.has(step);
  }

  getStatusClass(step: any): string {
    const status = this.stepStatuses[step.id] || 'not-executed';
    return `status-${status}`;
  }

  isAction(step: any): step is Action {
    return step.step_type === 'action';
  }

  isLoop(step: any): step is Loop {
    return step.step_type === 'loop';
  }

  isCondition(step: any): step is Condition {
    return step.step_type === 'condition';
  }

  conditionIsTrueStep(step: any): any {
    return step.condition.if_true_child_steps;
  }

  conditionIsFalseStep(step: any): any {
    return step.condition.if_false_child_steps;
  }
}
