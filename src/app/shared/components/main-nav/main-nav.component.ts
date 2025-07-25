import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CategoryCommunicationService } from '../../../services/category-communication.service';

@Component({
  selector: 'app-main-nav',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './main-nav.component.html',
  styleUrl: './main-nav.component.css',
})
export class MainNavComponent {
  constructor(private categoryCommunicationService: CategoryCommunicationService) {}

  onCategoryClick(categoryId: string | null): void {
    this.categoryCommunicationService.setSelectedCategory(categoryId);
  }
}
