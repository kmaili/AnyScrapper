import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/auth/auth.service';


declare const chrome: any;
@Component({
  selector: 'app-url-input-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './url-input-form.html',
  styleUrls: ['./url-input-form.css']
})
export class UrlInputFormComponent {
  url: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  @Output() urlSubmitted = new EventEmitter<string>();


  constructor(private authService: AuthService) {}


  submitUrl(): void {
    if (!this.url || !this.isValidUrl(this.url)) {
      this.errorMessage = 'Please enter a valid URL';
      return;
    }
    this.isLoading = true;
    // Placeholder: Simulate async URL validation
    setTimeout(() => {
      this.isLoading = false;
      this.errorMessage = '';
      this.urlSubmitted.emit(this.url);
      chrome.runtime.sendMessage(
        'omidbmajajpjiajacaipnbddgcbkiaek',  // Extension ID
        { jwt: this.authService.getToken(), url: this.url },
        (response: any) => {
          if (chrome.runtime.lastError) {
            console.error('Error sending message to extension:', chrome.runtime.lastError.message);
          } else {
            console.log('Extension responded:', response);
          }
        }
      );

    }, 1000);
  }

  private isValidUrl(url: string): boolean {
    // Placeholder: Basic URL validation
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}