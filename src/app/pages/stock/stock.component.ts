import { Component, OnInit } from '@angular/core';
import { NewsService } from '../../services/news.service';
import { NewsResponseDTO } from '../../models/news-response.model';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [CommonModule, NzSpinModule],
  templateUrl: './stock.component.html',
  styleUrl: './stock.component.css',
  providers: [NewsService],
})
export class StockComponent implements OnInit {
  newsList: NewsResponseDTO[] = [];
  loading = true;

  constructor(private newsService: NewsService, private router: Router) {}

  ngOnInit(): void {
    this.newsService
      .getNewsByCategory('4')
      .subscribe((news: NewsResponseDTO[]) => {
        this.newsList = news;
        this.loading = false;
      });
  }

  navigateToDetail(newsId: number | string) {
    this.router.navigate(['/news', newsId]);
  }
}
