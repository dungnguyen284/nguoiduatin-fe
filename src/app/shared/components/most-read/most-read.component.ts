import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { NewsService } from '../../../services/news.service';
import { CategoryCommunicationService } from '../../../services/category-communication.service';
import { NewsResponseDTO } from '../../../models/news-response.model';

@Component({
  selector: 'app-most-read',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './most-read.component.html',
  styleUrl: './most-read.component.css',
})
export class MostReadComponent implements OnInit, OnDestroy {
  mostReadNews: NewsResponseDTO[] = [];
  loading = false;
  private categorySubscription: Subscription = new Subscription();

  constructor(
    private newsService: NewsService,
    private categoryCommunicationService: CategoryCommunicationService
  ) {}

  ngOnInit(): void {
    // Load tin đọc nhiều ban đầu (tất cả chuyên mục)
    this.loadMostReadNews(null);

    // Lắng nghe thay đổi category
    this.categorySubscription = this.categoryCommunicationService
      .getSelectedCategory()
      .subscribe((categoryId) => {
        this.loadMostReadNews(categoryId);
      });
  }

  ngOnDestroy(): void {
    if (this.categorySubscription) {
      this.categorySubscription.unsubscribe();
    }
  }

  loadMostReadNews(categoryId: string | null): void {
    this.loading = true;
    
    if (categoryId) {
      // Lấy tin đọc nhiều theo chuyên mục
      this.newsService.getNewsByCategoryPaged(categoryId, 0, 5, [0]).subscribe({
        next: (news) => {
          // Sắp xếp theo số lượng view giảm dần và lấy 5 tin đầu
          this.mostReadNews = news
            .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
            .slice(0, 5);
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to load most read news by category:', err);
          this.mostReadNews = [];
          this.loading = false;
        }
      });
    } else {
      // Lấy tin đọc nhiều tất cả chuyên mục
      this.newsService.getNewsPaged(0, 50, [0]).subscribe({
        next: (news) => {
          // Sắp xếp theo số lượng view giảm dần và lấy 5 tin đầu
          this.mostReadNews = news
            .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
            .slice(0, 5);
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to load most read news:', err);
          this.mostReadNews = [];
          this.loading = false;
        }
      });
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
}
