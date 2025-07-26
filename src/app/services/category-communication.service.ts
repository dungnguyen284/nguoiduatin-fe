import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CategoryCommunicationService {
  private selectedCategorySubject = new BehaviorSubject<string | null>(null);

  constructor() {}

  // Observable để các component khác có thể subscribe
  getSelectedCategory(): Observable<string | null> {
    return this.selectedCategorySubject.asObservable();
  }

  // Method để set category được chọn
  setSelectedCategory(categoryId: string | null): void {
    this.selectedCategorySubject.next(categoryId);
  }

  // Method để get category hiện tại
  getCurrentCategory(): string | null {
    return this.selectedCategorySubject.value;
  }
}
