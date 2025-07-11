import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewsResponseDTO } from '../../../models/news-response.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-row-news-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './row-news-list.component.html',
  styleUrl: './row-news-list.component.css',
})
export class RowNewsListComponent {
  @Input() newsList: NewsResponseDTO[] = [];
  constructor(private router: Router) {}
  goToDetail(newsId: number | string) {
    this.router.navigate(['/news', newsId]);
  }
}
