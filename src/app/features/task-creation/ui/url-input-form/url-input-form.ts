import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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