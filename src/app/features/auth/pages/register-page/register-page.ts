import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-signup-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register-page.html',
  styleUrls: ['./register-page.css']
})
export class RegisterPageComponent {
  email: string = '';
  password: string = '';
  username: string = '';
  errorMessage: string = '';

    constructor(private authService: AuthService, private router: Router, private messageService: MessageService) { }
    
  onSubmit() {
    if (!this.email || !this.password || !this.username) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }
    this.authService.register({ email: this.email, password: this.password, username: this.username }).subscribe({
      next: () => {
        this.errorMessage = '';
        this.messageService.add({ severity: 'success', summary: 'Registration Successful', detail: 'You can now log in.' });
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        console.error('Registration failed', error);
        if (error.error.username) {
          this.errorMessage = 'Username already exists.';
        } else if (error.error.email) {
          this.errorMessage = 'Email already exists.';
        } else {
          this.errorMessage = 'Registration failed. Please try again.';
        }
      }
    });
    
  }

  // Placeholder for Google OAuth login
  onGoogleLogin() {
    // Replace with actual Google OAuth URL and client ID
    const clientId = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
    const redirectUri = 'http://127.0.0.1:4200/auth/callback'; // Update with your redirect URI
    const scope = 'email profile';
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&prompt=consent`;
    
    // Open OAuth popup (client-side flow)
    window.location.href = authUrl;
    // Note: In a real app, handle the callback and token exchange via a backend
  }
}