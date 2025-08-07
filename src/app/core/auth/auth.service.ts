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
  private readonly apiUrl = 'http://127.0.0.1:8000/api/users/'; // Adjust to your DRF API URL
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isLoggedIn$: Observable<boolean> = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient, private router: Router, private cookieService: CookieService) {
    this.checkAuthStatus();
  }

  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}register/`, user).pipe(
      tap(() => {
        console.log('User registered successfully');
      }),
      catchError(error => {
        console.error('Registration failed', error);
        throw error;
      })
    );
  }

  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}auth/token/`, credentials).pipe(
      tap((response: any) => {
        localStorage.setItem('access_token', response.access);
        this.cookieService.set('refresh_token', response.refresh, { secure: true, sameSite: 'Strict' });
        this.isLoggedInSubject.next(true);
        this.router.navigate(['/']);
      }),
      catchError(error => {
        console.error('Login failed', error);
        throw error; // Re-throw to handle in component
      })
    );
  }

  logout(): void {
    localStorage.removeItem('access_token'); // Clear token in production, use backend to invalidate
    this.isLoggedInSubject.next(false);
    this.router.navigate(['/auth/login']);
  }

  isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }

  private checkAuthStatus(): void {
    const token = localStorage.getItem('access_token');
    if (token) {
      this.isLoggedInSubject.next(true);
    } else {
      this.isLoggedInSubject.next(false);
    }
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('access_token');
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }
}