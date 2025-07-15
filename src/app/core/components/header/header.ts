// src/app/components/header/header.component.ts
import { Component, HostListener } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
})
export class HeaderComponent {
  isLoggedIn$: typeof this.authService.isLoggedIn$;
  isMenuOpen = false;
  isMobile = window.innerWidth <= 768; // Mobile breakpoint
  isProfileOpen = false; // Controls profile sphere dropdown
  
  constructor(public authService: AuthService) {
    this.isLoggedIn$ = this.authService.isLoggedIn$;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.isMobile = window.innerWidth <= 768;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleProfile() {
    this.isProfileOpen = !this.isProfileOpen; // Toggle profile sphere menu
  }
}