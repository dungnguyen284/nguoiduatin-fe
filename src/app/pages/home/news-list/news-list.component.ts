import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NewsService } from '../../../services/news.service';
import { NewsResponseDTO } from '../../../models/news-response.model';
import { FeatureNewsListComponent } from '../../../shared/components/feature-news-list/feature-news-list.component';
import { RowNewsListComponent } from '../../../shared/components/row-news-list/row-news-list.component';

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
    NzButtonModule,
    FeatureNewsListComponent,
    RowNewsListComponent,
  ],
  templateUrl: './news-list.component.html',
  styleUrl: './news-list.component.css',
  providers: [NewsService],
})
export class NewsListComponent implements OnInit, OnDestroy {
  newsList: NewsResponseDTO[] = [];
  page = 0;
  pageSize = 10;
  loading = false;
  allLoaded = false;
  selectedTag: string | null = null;
  private routeSubscription: Subscription = new Subscription();

  constructor(
    private newsService: NewsService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Subscribe to query params to detect tag changes
    this.routeSubscription = this.route.queryParams.subscribe((params) => {
      const newTag = params['tag'] || null;
      if (newTag !== this.selectedTag) {
        this.selectedTag = newTag;
        this.resetAndLoad();
      }
    });

    if (!this.selectedTag) {
      this.loadMore();
    }
  }

  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe();
  }

  resetAndLoad() {
    this.newsList = [];
    this.page = 0;
    this.allLoaded = false;
    this.loadMore();
  }

  loadMore() {
    if (this.loading || this.allLoaded) return;
    this.loading = true;

    if (this.selectedTag) {
      // Load news with tag filter
      this.newsService
        .searchNewsByTag(
          this.selectedTag,
          this.page * this.pageSize,
          this.pageSize,
          0
        )
        .subscribe((response) => {
          const news = response.data || [];
          this.newsList = [...this.newsList, ...news];
          this.loading = false;
          if (news.length < this.pageSize) this.allLoaded = true;
          else this.page++;
        });
    } else {
      // Load normal news
      this.newsService
        .getNewsPaged(this.page * this.pageSize, this.pageSize, 0)
        .subscribe((news) => {
          this.newsList = [...this.newsList, ...news];
          this.loading = false;
          if (news.length < this.pageSize) this.allLoaded = true;
          else this.page++;
        });
    }
  }

  navigateToDetail(newsId: number | string) {
    this.router.navigate(['/news', newsId]);
  }

  clearTagFilter() {
    this.router.navigate(['/'], { queryParams: {} });
  }
}
