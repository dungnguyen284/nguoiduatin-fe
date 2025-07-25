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
  selector: 'app-draft-news',
  standalone: true,
  imports: [
    CommonModule,
    NzTableModule,
    NzCardComponent,
    NzTagModule,
    NzButtonModule,
  ],
  templateUrl: './draft-news.component.html',
  styleUrl: './draft-news.component.css',
})
export class DraftNewsComponent implements OnInit {
  draftArticles: NewsResponseDTO[] = [];
  page = 0;
  pageSize = 10;
  loading = false;
  allLoaded = false;
  authorId: string = '';

  constructor(private newsService: NewsService, private router: Router) {}

  ngOnInit(): void {
    this.authorId = this.getAuthorIdFromToken();
    this.loadDraftArticles();
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

  loadDraftArticles() {
    if (this.loading || this.allLoaded || !this.authorId) return;
    this.loading = true;
    this.newsService
      .getNewsByAuthor(
        this.authorId,
        this.page * this.pageSize,
        this.pageSize,
        2 // chỉ lấy draft status=2
      )
      .subscribe((news) => {
        this.draftArticles = [...this.draftArticles, ...news];
        this.loading = false;
        if (news.length < this.pageSize) this.allLoaded = true;
        else this.page++;
      });
  }

  editDraft(newsId: number | string) {
    this.router.navigate(['/journalist/edit-news', newsId]);
  }
}
