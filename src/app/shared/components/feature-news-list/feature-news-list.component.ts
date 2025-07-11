import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewsResponseDTO } from '../../../models/news-response.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-feature-news-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './feature-news-list.component.html',
  styleUrl: './feature-news-list.component.css',
})
export class FeatureNewsListComponent {
  @Input() newsList: NewsResponseDTO[] = [];
  constructor(private router: Router) {}
  goToDetail(newsId: number | string) {
    this.router.navigate(['/news', newsId]);
  }
}
