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
  page = 0;
  pageSize = 10;
  loading = false;
  allLoaded = false;
  categoryId = '3';

  constructor(private newsService: NewsService, private router: Router) {}

  ngOnInit(): void {
    this.loadMore();
  }

  loadMore() {
    if (this.loading || this.allLoaded) return;
    this.loading = true;
    this.newsService
      .getNewsByCategoryPaged(
        this.categoryId,
        this.page * this.pageSize,
        this.pageSize,
        0 // chỉ lấy ACTIVE
      )
      .subscribe((news) => {
        this.newsList = [...this.newsList, ...news];
        this.loading = false;
        if (news.length < this.pageSize) this.allLoaded = true;
        else this.page++;
      });
  }

  navigateToDetail(newsId: number | string) {
    this.router.navigate(['/news', newsId]);
  }
}
