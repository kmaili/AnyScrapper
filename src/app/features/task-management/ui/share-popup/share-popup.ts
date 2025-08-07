import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CheckboxModule } from 'primeng/checkbox';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { WorkflowService } from '../../../task-creation/data-access/workflow/workflow.service';

@Component({
  selector: 'app-share-popup',
  standalone: true,
  imports: [CheckboxModule, CommonModule, FormsModule],
  templateUrl: './share-popup.html',
  styleUrl: './share-popup.css'
})
export class SharePopup {
  @ViewChild('modal') modalTemplate: any;
  @Input() workflowId!: number;

  permissions = {
    execute: false,
    edit: false,
    delete: false
  };
  token: string = '';
  constructor(private modalService: NgbModal, private workflowService: WorkflowService) {}

  openModal() {
    this.modalService.open(this.modalTemplate, { centered: true, backdrop: 'static' });
  }

  copyToken() {
    navigator.clipboard.writeText(this.token);
  }

  generateToken() {
    const privileges_value = Number(this.permissions['execute'])+
    Number(this.permissions['edit'])+
    Number(this.permissions['delete'])-1

    this.workflowService.shareWorkflow(this.workflowId, privileges_value).subscribe({
      next: (response: any) => {
        this.token = response.token;
        this.copyToken();
      },
      error: (error) => {
        console.error('Error generating token:', error);
      }
    });
  }
}
