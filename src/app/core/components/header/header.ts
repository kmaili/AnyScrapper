// src/app/components/header/header.component.ts
import { Component, HostListener } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { FormsModule } from '@angular/forms';
import { WorkflowService } from '../../../features/task-creation/data-access/workflow/workflow.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
})
export class HeaderComponent {
  isLoggedIn$: typeof this.authService.isLoggedIn$;
  isMenuOpen = false;
  isMobile = window.innerWidth <= 768; // Mobile breakpoint
  isAccessSharedWorkflowOpen = false; // Controls profile sphere dropdown
  input_token!: string;
  constructor(public authService: AuthService, private workflowService: WorkflowService, private messageService: MessageService) {
    this.isLoggedIn$ = this.authService.isLoggedIn$;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.isMobile = window.innerWidth <= 768;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleAccessWorkflow() {
    console.log(this.isAccessSharedWorkflowOpen)
    this.isAccessSharedWorkflowOpen = !this.isAccessSharedWorkflowOpen; // Toggle profile sphere menu
  }

  accessSharedWorkflow() {
    if (!this.input_token)
      return
    if (!this.checkUUID(this.input_token)){
      this.messageService.add({ severity: 'error', summary: 'Error', detail: `Invalid token` });
      return
    }
    
    this.workflowService.accessSharedWorkflow(this.input_token).subscribe({
      next: (_) => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: `Workflow shared with you` });
      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: `check your token` });
      }
    })
  }

  checkUUID(uuid: string) {
    const regex = /^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}$/;
    return regex.test(uuid);
  }
}