import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewsService } from '../../../services/news.service';
import { NewsResponseDTO } from '../../../models/news-response.model';
import { Router } from '@angular/router';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardComponent } from 'ng-zorro-antd/card';

@Component({
  selector: 'app-my-news',
  standalone: true,
  imports: [
    CommonModule,
    NzTableModule,
    NzCardComponent,
    NzTagModule,
    NzButtonModule,
  ],
  templateUrl: './my-news.component.html',
  styleUrl: './my-news.component.css',
})
export class MyNewsComponent implements OnInit {
  myArticles: NewsResponseDTO[] = [];
  page = 0;
  pageSize = 10;
  loading = false;
  allLoaded = false;
  authorId: string = '';

  constructor(private newsService: NewsService, private router: Router) {}

  ngOnInit(): void {
    this.authorId = this.getAuthorIdFromToken();
    this.loadMyArticles();
  }

  getAuthorIdFromToken(): string {
    const token =
      sessionStorage.getItem('jwt_token') || localStorage.getItem('jwt_token');
    if (!token) return '';
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded['nameidentifier'] || decoded['sub'] || '';
    } catch {
      return '';
    }
  }

  loadMyArticles() {
    if (this.loading || this.allLoaded || !this.authorId) return;
    this.loading = true;
    this.newsService
      .getNewsByAuthor(
        this.authorId,
        this.page * this.pageSize,
        this.pageSize,
        true
      )
      .subscribe((news) => {
        this.myArticles = [...this.myArticles, ...news];
        this.loading = false;
        if (news.length < this.pageSize) this.allLoaded = true;
        else this.page++;
      });
  }

  navigateToDetail(newsId: number | string) {
    this.router.navigate(['/news', newsId]);
  }
}
