import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { DomElement } from '../../models/dom-element.model';

@Injectable({
  providedIn: 'root',
})
export class DomElementsSelectorWsService {
  private socket!: WebSocket;
  private domElementsSubject = new BehaviorSubject<DomElement[]>([]);
  domElements$: Observable<DomElement[]> = this.domElementsSubject.asObservable();

  constructor(private ngZone: NgZone, private http: HttpClient) {}

  connect(url: string, apiUrl: string = 'http://localhost:8000/api/dom-elements/') {
    // Fetch initial DOM elements from HTTP API
    this.http.get<DomElement[]>(apiUrl).subscribe({
      next: (response) => {
        this.ngZone.run(() => {
          this.domElementsSubject.next(response || []);
          console.log('Initial DOM elements fetched from API', response);
        });
      },
      error: (error) => {
        console.error('Failed to fetch initial DOM elements', error);
        // Proceed with WebSocket connection even if HTTP fails
        this.setupWebSocket(url);
      },
      complete: () => {
        // After HTTP call completes, set up WebSocket
        this.setupWebSocket(url);
      }
    });
  }

  private setupWebSocket(url: string) {
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