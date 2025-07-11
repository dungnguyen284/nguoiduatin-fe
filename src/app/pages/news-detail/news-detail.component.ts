import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinComponent } from 'ng-zorro-antd/spin';
import { NewsService } from '../../services/news.service';
import { NewsResponseDTO } from '../../models/news-response.model';

@Component({
  selector: 'app-news-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzCardModule,
    NzTagModule,
    NzDividerModule,
    NzIconModule,
    NzSpinComponent,
  ],
  templateUrl: './news-detail.component.html',
  styleUrl: './news-detail.component.css',
})
export class NewsDetailComponent implements OnInit {
  newsId: string | null = null;
  newsDetail: NewsResponseDTO | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private newsService: NewsService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.newsId = params['id'];
      this.loadNewsDetail();
    });
  }

  loadNewsDetail(): void {
    if (!this.newsId) return;
    this.loading = true;
    this.newsService.getNewsById(this.newsId).subscribe((news) => {
      this.newsDetail = news.data;
      this.loading = false;
    });
    console.log(this.newsId);

    console.log(this.newsDetail);
  }
}
