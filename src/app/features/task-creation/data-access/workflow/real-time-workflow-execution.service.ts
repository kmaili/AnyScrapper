import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class RealTimeWorkflowExecutionService {
    private socket!: WebSocket;
    workfklowExecutionSubject = new BehaviorSubject<any>(null);
    workflowExecution$ = this.workfklowExecutionSubject.asObservable();



    setupWebSocket(url: string = 'ws://127.0.0.1:8000/ws/workflow_execution/', workflowId: number) {
        this.socket = new WebSocket(url + workflowId + '/');

        this.socket.onopen = () => {
            console.log('WebSocket connected');
        };

        this.socket.onmessage = (event) => {
            this.workfklowExecutionSubject.next(JSON.parse(event.data));
        };

        this.socket.onclose = () => {
            console.log('WebSocket disconnected');
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket error', error);
        };
    }

    disconnect() {
        this.socket.close();
    }

}