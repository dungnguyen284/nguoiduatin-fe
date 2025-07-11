import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NewsService } from '../../../services/news.service';
import { NewsResponseDTO } from '../../../models/news-response.model';

@Component({
  selector: 'app-news-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzCardModule,
    NzListModule,
    NzSpinModule,
    NzTagModule,
    NzIconModule,
  ],
  templateUrl: './news-list.component.html',
  styleUrl: './news-list.component.css',
  providers: [NewsService],
})
export class NewsListComponent implements OnInit {
  newsList: NewsResponseDTO[] = [];
  loading = true;

  constructor(private newsService: NewsService, private router: Router) {}

  ngOnInit(): void {
    this.newsService.getAllNews().subscribe((news: NewsResponseDTO[]) => {
      this.newsList = news;
      this.loading = false;
    });
  }

  navigateToDetail(newsId: number | string) {
    this.router.navigate(['/news', newsId]);
  }
}
