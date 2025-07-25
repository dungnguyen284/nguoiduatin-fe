import { Component, OnInit, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NewsService } from '../../../../services/news.service';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NewsResponseDTO } from '../../../../models/news-response.model';
import {
  DragDropModule,
  CdkDragDrop,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-feature-news-management',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DragDropModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzCardModule,
    NzSelectModule,
    NzSpinModule,
    FormsModule,
    NzInputModule,
    NzPaginationModule,
    NzToolTipModule,
  ],
  templateUrl: './feature-news-management.component.html',
  styleUrl: './feature-news-management.component.css',
})
export class FeatureNewsManagementComponent implements OnInit {
  allNews: NewsResponseDTO[] = [];
  featuredNews: NewsResponseDTO[] = [];
  availableNews: NewsResponseDTO[] = [];
  filteredAvailableNews: NewsResponseDTO[] = [];
  loading = true;
  saving = false;
  readonly MAX_FEATURED_NEWS = 4;

  // Pagination
  pageSize = 4;
  pageIndex = 1;
  total = 0;

  // Search
  searchText = '';
  private searchSubject = new Subject<string>();

  constructor(
    private newsService: NewsService,
    private message: NzMessageService,
    @Optional() public modalRef: NzModalRef
  ) {}

  ngOnInit(): void {
    console.log('FeatureNewsManagementComponent initialized');
    this.loadNews();

    // Set up search with debounce
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((searchTerm) => {
        this.searchText = searchTerm;
        this.filterAvailableNews();
      });
  }

  loadNews(): void {
    this.loading = true;
    // Get published news (status = 0)
    this.newsService.getAllNews([0]).subscribe({
      next: (data) => {
        this.allNews = data;

        // Set featured news (filter by isFrontPage and sort by slotNumber)
        this.featuredNews = data
          .filter((news) => news.isFrontPage)
          .sort((a, b) => a.slotNumber - b.slotNumber);

        // Set available news (filter by not isFrontPage)
        this.availableNews = data
          .filter((news) => !news.isFrontPage)
          .sort(
            (a, b) =>
              new Date(b.publicationDate).getTime() -
              new Date(a.publicationDate).getTime()
          );

        this.filterAvailableNews();
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load news:', err);
        this.message.error('Không thể tải danh sách tin tức');
        this.loading = false;
      },
    });
  }

  onDrop(event: CdkDragDrop<NewsResponseDTO[]>) {
    if (event.previousContainer === event.container) {
      // Reordering within the same list
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      // Update slot numbers
      this.updateSlotNumbers();
    }
  }

  updateSlotNumbers(): void {
    // Update slot numbers based on current order
    this.featuredNews.forEach((news, index) => {
      news.slotNumber = index + 1;
    });
  }

  addToFeatured(news: NewsResponseDTO): void {
    if (this.featuredNews.length >= this.MAX_FEATURED_NEWS) {
      this.message.warning(
        `Chỉ được chọn tối đa ${this.MAX_FEATURED_NEWS} tin hàng đầu!`
      );
      return;
    }

    // Find and remove from available news
    const index = this.availableNews.findIndex((item) => item.id === news.id);
    if (index !== -1) {
      this.availableNews.splice(index, 1);

      // Add to featured news
      news.isFrontPage = true;
      news.slotNumber = this.featuredNews.length + 1;
      this.featuredNews.push(news);

      // Update filtered available news
      this.filterAvailableNews();
    }
  }

  removeFromFeatured(news: NewsResponseDTO): void {
    // Find and remove from featured news
    const index = this.featuredNews.findIndex((item) => item.id === news.id);
    if (index !== -1) {
      this.featuredNews.splice(index, 1);

      // Update slot numbers
      this.updateSlotNumbers();

      // Add to available news
      news.isFrontPage = false;
      news.slotNumber = 0;
      this.availableNews.push(news);

      // Sort available news by publication date
      this.availableNews.sort(
        (a, b) =>
          new Date(b.publicationDate).getTime() -
          new Date(a.publicationDate).getTime()
      );

      // Update filtered available news
      this.filterAvailableNews();
    }
  }

  filterAvailableNews(): void {
    // Filter by search text if provided
    let filtered = this.availableNews;
    if (this.searchText.trim()) {
      const searchTerm = this.searchText.toLowerCase().trim();
      filtered = filtered.filter(
        (news) =>
          news.title.toLowerCase().includes(searchTerm) ||
          news.categoryName?.toLowerCase().includes(searchTerm) ||
          news.description?.toLowerCase().includes(searchTerm)
      );
    }

    // Set total for pagination
    this.total = filtered.length;

    // Apply pagination
    const start = (this.pageIndex - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.filteredAvailableNews = filtered.slice(start, end);
  }

  onSearch(searchTerm: string): void {
    this.searchSubject.next(searchTerm);
  }

  onPageChange(page: number): void {
    this.pageIndex = page;
    this.filterAvailableNews();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1; // Reset to first page when changing page size
    this.filterAvailableNews();
  }

  saveChanges(): void {
    // Validate that exactly 4 featured news are selected
    if (this.featuredNews.length !== this.MAX_FEATURED_NEWS) {
      this.message.error(
        `Phải chọn đủ ${this.MAX_FEATURED_NEWS} tin hàng đầu!`
      );
      return;
    }

    this.saving = true;

    // Prepare the array of news items with their slot numbers
    const frontpageNewsItems = this.featuredNews.map((news) => ({
      id: news.id,
      slotNumber: news.slotNumber,
    }));

    // Use the dedicated API endpoint for setting frontpage news
    this.newsService.setFrontpageNews(frontpageNewsItems).subscribe({
      next: () => {
        this.saving = false;
        this.message.success('Đã lưu thay đổi tin hàng đầu thành công');

        if (this.modalRef) {
          this.close();
        } else {
          // Reload the news to reflect the changes
          this.loadNews();
        }
      },
      error: (err) => {
        this.saving = false;
        console.error('Error saving featured news:', err);
        this.message.error('Có lỗi khi lưu thay đổi tin hàng đầu');
      },
    });
  }

  close(): void {
    if (this.modalRef) {
      this.modalRef.close(true);
    }
    // When used as a standalone page, don't need to close a modal
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
}
