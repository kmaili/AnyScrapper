import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

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
  errorMessage: string = '';

  onSubmit() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }
    // Placeholder for signup logic (e.g., API call)
    console.log('Signup attempt:', { email: this.email, password: this.password });
    this.errorMessage = 'Signup successful!'; // Replace with actual API response
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