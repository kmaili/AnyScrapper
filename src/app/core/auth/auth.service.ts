// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:8000/auth'; // Adjust to your DRF API URL
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isLoggedIn$: Observable<boolean> = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient, private router: Router, private cookieService: CookieService) {
    // Initial check on service initialization
    this.checkAuthStatus();
  }

  // Login method
  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/token/`, credentials).pipe(
      tap((response: any) => {
        // Store the access token (e.g., in memory or cookie via backend)
        localStorage.setItem('access_token', response.access);
        this.cookieService.set('refresh_token', response.refresh, { secure: true, sameSite: 'Strict' });
        this.isLoggedInSubject.next(true);
        this.router.navigate(['/']); // Redirect after login
      }),
      catchError(error => {
        console.error('Login failed', error);
        throw error; // Re-throw to handle in component
      })
    );
  }

  // Logout method
  logout(): void {
    // Clear token and update state
    localStorage.removeItem('access_token'); // Clear token in production, use backend to invalidate
    this.isLoggedInSubject.next(false);
    this.router.navigate(['/auth/login']);
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }

  // Check authentication status (e.g., token existence)
  private checkAuthStatus(): void {
    const token = localStorage.getItem('access_token');
    if (token) {
      // Optionally validate token with backend (e.g., /api/token/verify/)
      this.isLoggedInSubject.next(true);
    } else {
      this.isLoggedInSubject.next(false);
    }
  }

  // Helper to check token presence
  private hasToken(): boolean {
    return !!localStorage.getItem('access_token');
  }

  // Getter for token (for API requests)
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }
}