import { Injectable } from '@angular/core';
import { Step } from '../../models/step.model';
import { HttpClient } from '@angular/common/http';
import { Workflow } from '../../models/workflow.model';


@Injectable({
  providedIn: 'root'
})
export class WorkflowService {
  getWorkflowResults(workflowId: number) {
    return this.http.get(`http://127.0.0.1:8000/api/workflows/results/${workflowId}/`);
  }

  constructor(private http:HttpClient) { }
  
  update_workflow(workflow: Workflow) {
    return this.http.put(`http://127.0.0.1:8000/api/workflows/${workflow.id}/`, { 
      'workflow_name': workflow.name,
      'start_url': workflow.startUrl,
      'steps': workflow.steps,
      'is_scheduled': workflow.isScheduled,
      'schedule_start_time': workflow.scheduleStartTime,
      'schedule_frequency': workflow.scheduleFrequency
    })
  }


  create_workflow(workflow: Workflow) {
    return this.http.post('http://127.0.0.1:8000/api/workflows/new/', { 
      'workflow_name': workflow.name,
      'start_url': workflow.startUrl,
      'steps': workflow.steps,
      'is_scheduled': workflow.isScheduled,
      'schedule_start_time': workflow.scheduleStartTime,
      'schedule_frequency': workflow.scheduleFrequency
  })
  }

  get_workflows() {
    return this.http.get<Workflow[]>('http://127.0.0.1:8000/api/workflows/')
  }
  get_workflow_by_id(id: number) {
    return this.http.get<Workflow>(`http://127.0.0.1:8000/api/workflows/${id}/`);
  }


  execute_workflow(workflow: Workflow) {
    return this.http.post(`http://127.0.0.1:8000/api/workflows/execute/${workflow.id}/`, {});
  }

  deleteWorkflow(workflowId: number) {
    return this.http.delete(`http://127.0.0.1:8000/api/workflows/${workflowId}/`);
  }

  shareWorkflow(workflowId: number, privileges_value: number) {
    return this.http.post(`http://127.0.0.1:8000/api/workflows/share/`, {
      'workflow_id': workflowId,
      'privileges_level': privileges_value
    })
  }

  accessSharedWorkflow(token: string) {
    return this.http.post(`http://127.0.0.1:8000/api/workflows/access-shared/${token}/`, {})
  }

  getWorkflowPermissionLevel(workflowId: number) {
    return this.http.get(`http://127.0.0.1:8000/api/workflows/permissions/${workflowId}/`)
  }
}
