import { Injectable } from '@angular/core';
import { Step } from '../../models/step.model';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class Task {

  constructor(private http:HttpClient) { }

  create_task(steps: Step[]) {
    return this.http.post('http://localhost:8000/api/tasks/', { steps });
  }
}
