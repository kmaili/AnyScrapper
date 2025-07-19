import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterActions',
  standalone: true // If using Angular 14+
})
export class FilterActionsPipe implements PipeTransform {
  transform(actionNames: { value: string; label: string; icon: string}[], actionType: 'on_page' | 'on_element'): { value: string; label: string; icon: string }[] {
    if (!actionNames || !actionType) {
      return [];
    }

    if (actionType === 'on_page') {
      return actionNames.filter(name => name.value.includes('page'));
    } else if (actionType === 'on_element') {
      return actionNames.filter(name => name.value.includes('element'));
    }
    return [];
  }
}