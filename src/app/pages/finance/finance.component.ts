import { Component, OnInit } from '@angular/core';
import { NewsService } from '../../services/news.service';
import { NewsResponseDTO } from '../../models/news-response.model';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-finance',
  standalone: true,
  imports: [CommonModule, NzSpinModule],
  templateUrl: './finance.component.html',
  styleUrl: './finance.component.css',
  providers: [NewsService],
})
export class FinanceComponent implements OnInit {
  newsList: NewsResponseDTO[] = [];
  loading = true;

  constructor(private newsService: NewsService, private router: Router) {}

  ngOnInit(): void {
    this.newsService
      .getNewsByCategory('2')
      .subscribe((news: NewsResponseDTO[]) => {
        this.newsList = news;
        this.loading = false;
      });
  }

  navigateToDetail(newsId: number | string) {
    this.router.navigate(['/news', newsId]);
  }
}
