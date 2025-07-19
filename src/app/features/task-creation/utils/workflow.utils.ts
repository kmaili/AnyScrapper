import { Step } from "../models/step.model";
import { Workflow } from "../models/workflow.model";

function updateStepStatusInTree(steps: Step[], stepId: number, newStatus: 'finished' | 'failed' | 'not-executed' | 'executing') {
  for (const step of steps) {
    if (step.id === stepId) {
      step.status = newStatus;
      return; // Exit once found and updated
    }
    if (step.condition) {
      if (step.condition.if_true_child_steps) {
        updateStepStatusInTree(step.condition.if_true_child_steps, stepId, newStatus);
      }
      if (step.condition.if_false_child_steps) {
        updateStepStatusInTree(step.condition.if_false_child_steps, stepId, newStatus);
      }
    }
    if (step.loop && step.loop.child_steps) {
      updateStepStatusInTree(step.loop.child_steps, stepId, newStatus);
    }
  }
}

// Usage example in a method (e.g., where step_status is received)
export function updateStepStatus(workflow: Workflow, step_status: { id: number; status: 'finished' | 'failed' | 'not-executed' | 'executing' }) {
  updateStepStatusInTree(workflow.steps, step_status.id, step_status.status);
}