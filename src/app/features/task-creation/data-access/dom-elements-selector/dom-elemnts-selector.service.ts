import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface DomElement {
  tag_name: string;
  x_path: string;
  attributes: { name: string }[];
}

@Injectable({
  providedIn: 'root',
})
export class DomElementsSelectorWsService {
  private socket!: WebSocket;
  private domElementsSubject = new BehaviorSubject<DomElement[]>([]);
  domElements$: Observable<DomElement[]> = this.domElementsSubject.asObservable();

  constructor(private ngZone: NgZone) {}

  connect(url: string) {
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      console.log('WebSocket connected');
    };

    this.socket.onmessage = (event) => {
      // Run inside Angular zone to update bindings
      this.ngZone.run(() => {
        try {
          const data = JSON.parse(event.data);
          if (data.elements) {
            this.domElementsSubject.next(data.elements);
          }
        } catch (err) {
          console.error('WebSocket message parse error', err);
        }
      });
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
      // Optionally: auto-reconnect logic here
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error', error);
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
    }
  }
}
