import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomElement } from '../../models/dom-element.model';

@Component({
  selector: 'app-autocomplete-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './autocomplete-selector.html',
  styleUrls: ['./autocomplete-selector.css'],
})
export class AutocompleteSelectorComponent implements AfterViewInit {
  @Input() domElements: DomElement[] = [];
  @Input() selectedSelector: string = '';
  @Output() selectedSelectorChange = new EventEmitter<string>();

  @ViewChild('input') input!: ElementRef<HTMLInputElement>;

  searchQuery: string = '';
  filteredElements: DomElement[] = [];
  showList: boolean = false;
  selectedIndex: number = -1;

  ngAfterViewInit() {
    this.filterElements();
  }

  filterElements() {
    const query = this.searchQuery.toLowerCase();
    this.filteredElements = this.domElements.filter((element) =>
      element.tag_name.toLowerCase().includes(query) ||
      element.attributes.some(
        (attr) =>
          attr.name.toLowerCase().includes(query) ||
          attr.value.toLowerCase().includes(query)
      )
    );
    this.selectedIndex = -1;
    if (this.searchQuery && this.filteredElements.length) {
      this.showList = true;
    }
  }

  selectElement(element: DomElement) {
    const selector = this.mapDomElementToSelector(element);
    this.selectedSelector = selector;
    this.selectedSelectorChange.emit(selector);
    this.searchQuery = selector;
    this.showList = false;
    this.selectedIndex = -1;
  }

  onBlur() {
    setTimeout(() => {
      this.showList = false;
      this.searchQuery = this.selectedSelector || '';
    }, 200);
  }

  onKeydown(event: KeyboardEvent) {
    if (!this.filteredElements.length) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedIndex = (this.selectedIndex + 1) % this.filteredElements.length;
        this.scrollIntoView();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.selectedIndex =
          (this.selectedIndex - 1 + this.filteredElements.length) %
          this.filteredElements.length;
        this.scrollIntoView();
        break;
      case 'Enter':
        event.preventDefault();
        if (this.selectedIndex >= 0) {
          this.selectElement(this.filteredElements[this.selectedIndex]);
        }
        break;
      case 'Escape':
        this.showList = false;
        this.searchQuery = this.selectedSelector || '';
        this.input.nativeElement.blur();
        break;
    }
  }

  private scrollIntoView() {
    const list = this.input.nativeElement.parentElement?.querySelector('.results-panel');
    const selectedItem = list?.querySelectorAll('.result-item')[this.selectedIndex];
    if (selectedItem && list) {
      selectedItem.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }

  mapDomElementToSelector(element: DomElement): string {
    const idAttr = element.attributes.find((attr) => attr.name === 'id');
    if (idAttr) {
      return `#${idAttr.value}`;
    }

    const classAttr = element.attributes.find((attr) => attr.name === 'class');
    if (classAttr) {
      const cleaned = classAttr.value.trim().replace(/\s+/g, '.');
      return `.${cleaned}`;
    }

    return element.tag_name.toLowerCase(); // Fallback to tag only
  }

  getShortSelector(element: DomElement): string {
    const idAttr = element.attributes.find((attr) => attr.name === 'id');
    if (idAttr) {
      return `#${idAttr.value}`;
    }

    const classAttr = element.attributes.find((attr) => attr.name === 'class');
    if (classAttr) {
      const classes = classAttr.value.split(' ').filter((cls) => cls.trim());
      return `.${classes.slice(0, 2).join('.')}${classes.length > 2 ? '...' : ''}`;
    }

    return element.tag_name.toLowerCase();
  }

  getIconForTag(tagName: string): string {
    switch (tagName.toLowerCase()) {
      case 'div':
        return 'view_module';
      case 'span':
        return 'text_fields';
      case 'a':
        return 'link';
      case 'button':
        return 'smart_button';
      case 'input':
        return 'edit';
      case 'textarea':
        return 'notes';
      case 'select':
        return 'arrow_drop_down_circle';
      case 'img':
        return 'image';
      case 'video':
        return 'play_circle';
      case 'audio':
        return 'volume_up';
      case 'form':
        return 'description';
      case 'table':
        return 'table_chart';
      case 'ul':
      case 'ol':
        return 'list';
      case 'li':
        return 'fiber_manual_record';
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        return 'title';
      case 'p':
        return 'article';
      case 'nav':
        return 'menu';
      case 'header':
        return 'vertical_align_top';
      case 'footer':
        return 'vertical_align_bottom';
      case 'main':
        return 'web_asset';
      case 'section':
        return 'view_agenda';
      case 'aside':
        return 'view_sidebar';
      case 'canvas':
        return 'brush';
      case 'svg':
        return 'palette';
      case 'iframe':
        return 'web';
      default:
        return 'code';
    }
  }
}
