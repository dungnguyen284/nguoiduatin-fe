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
  page = 0;
  pageSize = 10;
  loading = false;
  allLoaded = false;
  categoryId = '1';

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
