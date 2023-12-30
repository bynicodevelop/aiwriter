import {
  Pipe,
  PipeTransform,
} from '@angular/core';

export type SortOrder = 'asc' | 'desc';

@Pipe({
  standalone: true,
  name: 'sort',
})
export class SortPipe implements PipeTransform {
  transform(value: any[], sortOrder: SortOrder | string = 'asc', sortKey?: string): any {
    if (!value || value.length === 0) {
      return value;
    }

    return value.sort((a, b) => {
      const aValue = this.getNestedValue(a, sortKey);
      const bValue = this.getNestedValue(b, sortKey);

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      } else if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      } else {
        return 0;
      }
    });
  }

  private getNestedValue(obj: any, key: string | undefined): any {
    if (!key) {
      return obj;
    }
    return key.split('.').reduce((acc, part) => acc && acc[part], obj);
  }
}
