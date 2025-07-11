import { Component, OnInit } from '@angular/core';
import { NewsService } from '../../services/news.service';
import { NewsListComponent } from '../home/news-list/news-list.component';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { CommonModule } from '@angular/common';
import { NewsResponseDTO } from '../../models/news-response.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-company',
  standalone: true,
  imports: [CommonModule, NewsListComponent, NzCardModule, NzSpinModule],
  templateUrl: './company.component.html',
  styleUrl: './company.component.css',
  providers: [NewsService],
})
export class CompanyComponent implements OnInit {
  newsList: NewsResponseDTO[] = [];
  loading = true;

  constructor(private newsService: NewsService, private router: Router) {}

  ngOnInit(): void {
    this.newsService
      .getNewsByCategory('1')
      .subscribe((news: NewsResponseDTO[]) => {
        this.newsList = news;
        this.loading = false;
      });
  }

  navigateToDetail(newsId: number | string) {
    this.router.navigate(['/news', newsId]);
  }
}
