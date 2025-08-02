import { Component, Input, Output, EventEmitter, OnInit, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface SelectOption {
  value: any;
  label: string;
  icon: string;
  action_type?: 'interaction' | 'data_collection';
}

@Component({
  selector: 'app-custom-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './custom-select.html',
  styles: [`
    .custom-select-container {
      position: relative;
      width: 100%;
    }

    .custom-select-button {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .custom-select-button:hover {
      border-color: #d1d5db;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .custom-select-button.focused {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .select-content {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
      min-width: 0;
    }

    .select-icon {
      color: #6b7280;
      font-size: 18px;
      flex-shrink: 0;
    }

    .select-text {
      color: #111827;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .select-text.placeholder {
      color: #9ca3af;
    }

    .chevron {
      color: #9ca3af;
      font-size: 18px;
      transition: transform 0.2s ease;
      flex-shrink: 0;
    }

    .chevron.rotated {
      transform: rotate(180deg);
    }

    .custom-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      z-index: 1000;
      margin-top: 4px;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      overflow: hidden;
      max-height: 280px;
      backdrop-filter: blur(10px);
    }

    .search-container {
      position: relative;
      padding: 12px;
      border-bottom: 1px solid #f3f4f6;
    }

    .search-icon {
      position: absolute;
      left: 24px;
      top: 50%;
      transform: translateY(-50%);
      color: #9ca3af;
      font-size: 16px;
    }

    .search-input {
      width: 100%;
      background-color: #fff;
      color: black;
      padding: 8px 12px 8px 36px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      font-size: 13px;
      outline: none;
      transition: border-color 0.2s ease;
    }

    .search-input:focus {
      border-color: #3b82f6;
    }

    .options-container {
      max-height: 200px;
      overflow-y: auto;
    }

    .custom-option {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      cursor: pointer;
      transition: background-color 0.15s ease;
      gap: 12px;
    }

    .custom-option:hover {
      background-color: #f8fafc;
    }

    .custom-option.selected {
      background-color: #eff6ff;
      color: #3b82f6;
    }

    .option-icon {
      color: #6b7280;
      font-size: 18px;
      flex-shrink: 0;
    }

    .custom-option.selected .option-icon {
      color: #3b82f6;
    }

    .option-text {
      flex: 1;
      font-size: 14px;
      font-weight: 500;
    }

    .check-icon {
      color: #3b82f6;
      font-size: 16px;
      flex-shrink: 0;
    }

    .no-options {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 20px;
      color: #9ca3af;
      font-size: 13px;
    }

    .no-options .material-icons {
      font-size: 18px;
    }

    /* Custom scrollbar */
    .options-container::-webkit-scrollbar {
      width: 6px;
    }

    .options-container::-webkit-scrollbar-track {
      background: #f1f5f9;
    }

    .options-container::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 3px;
    }

    .options-container::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }
  `]
})
export class CustomSelectComponent implements OnInit {
  @Input() value: any;
  @Input() options: SelectOption[] = [];
  @Input() placeholder: string = 'Select an option';
  @Input() searchable: boolean = true;
  @Input() categoryFilter?: 'interaction' | 'data_collection'; // New input to filter by category
  @Output() valueChange = new EventEmitter<any>();

  isOpen = false;
  searchTerm = '';
  filteredOptions: SelectOption[] = [];
  selectedOption: SelectOption | null = null;

  constructor(private elementRef: ElementRef) {}

  ngOnInit() {
    this.filteredOptions = this.filterOptions([...this.options]);
    this.updateSelectedOption();
  }

  ngOnChanges() {
    this.updateSelectedOption();
    this.onSearch();
  }

  private updateSelectedOption() {
    this.selectedOption = this.options.find(option => option.value === this.value && (!this.categoryFilter || option.action_type === this.categoryFilter)) || null;
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
    if (!this.isOpen) {
      this.searchTerm = '';
      this.filteredOptions = this.filterOptions([...this.options]);
    }
  }

  closeDropdown() {
    this.isOpen = false;
    this.searchTerm = '';
    this.filteredOptions = this.filterOptions([...this.options]);
  }

  selectOption(option: SelectOption) {
    this.value = option.value;
    this.selectedOption = option;
    this.valueChange.emit(option.value);
    this.closeDropdown();
  }

  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredOptions = this.filterOptions([...this.options]);
    } else {
      this.filteredOptions = this.filterOptions(this.options.filter(option =>
        option.label.toLowerCase().includes(this.searchTerm.toLowerCase())
      ));
    }
  }

  selectFirstFiltered(event: Event) {
    event.preventDefault();
    if (this.filteredOptions.length > 0) {
      this.selectOption(this.filteredOptions[0]);
    }
  }

  trackByValue(index: number, option: SelectOption): any {
    return option.value;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeDropdown();
    }
  }

  private filterOptions(options: SelectOption[]): SelectOption[] {
    return this.categoryFilter ? options.filter(option => !option.action_type || option.action_type === this.categoryFilter) : options;
  }

}