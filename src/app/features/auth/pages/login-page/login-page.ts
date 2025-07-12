import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login-page.html',
  styleUrls: ['./login-page.css']
})
export class LoginPageComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: ActivatedRoute, private messageService: MessageService) { }
  onSubmit() {
    if (!this.username || !this.password) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }
    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: () => {
        this.errorMessage = '';
        this.messageService.add({ severity: 'success', summary: 'Login Successful', detail: 'Welcome back!' });
      },
      error: (error) => {
        console.error('Login failed', error);
        this.errorMessage = 'Invalid email or password.';
      }
    });
    
  }

  // Placeholder for Google OAuth login
  onGoogleLogin() {
    // Replace with actual Google OAuth URL and client ID
    const clientId = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
    const redirectUri = 'http://localhost:4200/auth/callback'; // Update with your redirect URI
    const scope = 'email profile';
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&prompt=consent`;
    
    // Open OAuth popup (client-side flow)
    window.location.href = authUrl;
    // Note: In a real app, handle the callback and token exchange via a backend
  }
}