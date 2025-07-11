import { Component, OnInit } from '@angular/core';
import { NewsService } from '../../services/news.service';
import { NewsResponseDTO } from '../../models/news-response.model';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-real-estate',
  standalone: true,
  imports: [CommonModule, NzSpinModule],
  templateUrl: './real-estate.component.html',
  styleUrl: './real-estate.component.css',
  providers: [NewsService],
})
export class RealEstateComponent implements OnInit {
  newsList: NewsResponseDTO[] = [];
  loading = true;

  constructor(private newsService: NewsService, private router: Router) {}

  ngOnInit(): void {
    this.newsService
      .getNewsByCategory('3')
      .subscribe((news: NewsResponseDTO[]) => {
        this.newsList = news;
        this.loading = false;
      });
  }

  navigateToDetail(newsId: number | string) {
    this.router.navigate(['/news', newsId]);
  }
}
