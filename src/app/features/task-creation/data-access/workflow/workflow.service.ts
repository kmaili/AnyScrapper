import { Injectable } from '@angular/core';
import { Step } from '../../models/step.model';
import { HttpClient } from '@angular/common/http';
import { Workflow } from '../../models/workflow.model';


@Injectable({
  providedIn: 'root'
})
export class WorkflowService {

  constructor(private http:HttpClient) { }

  create_workflow(workflow: Workflow) {
    return this.http.post('http://localhost:8000/api/workflows/new/', { 
      'workflow_name': workflow.name,
      'start_url': workflow.startUrl,
      'steps': workflow.steps
  })
  }

  get_workflows() {
    return this.http.get<Workflow[]>('http://localhost:8000/api/workflows/')
  }


  execute_workflow(workflow: Workflow) {
    return this.http.post(`http://localhost:8000/api/workflows/execute/${workflow.id}/`, {});
  }

  deleteWorkflow(workflowId: number) {
    return this.http.delete(`http://localhost:8000/api/workflows/${workflowId}/`);
  }
}
