import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CheckboxModule } from 'primeng/checkbox';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { interval, timeout } from 'rxjs';
@Component({
  selector: 'app-share-popup',
  imports: [CheckboxModule, CommonModule, FormsModule],
  templateUrl: './share-popup.html',
  styleUrl: './share-popup.css'
})
export class SharePopup {
  isVisible = true;

  permissions = {
    execute: false,
    edit: false,
    delete: false
  };

  token: string = '';
  copied = false;

  generateToken() {
    const privileges_value = Number(this.permissions['execute'])+
    Number(this.permissions['edit'])+
    Number(this.permissions['delete'])-1
    this.copied = false;
  }

  copyToken() {
    navigator.clipboard.writeText(this.token);
    this.copied = true;
  }


}
