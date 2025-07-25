import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NewsService } from '../../../services/news.service';
import { NewsResponseDTO } from '../../../models/news-response.model';
import { Router } from '@angular/router';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardComponent } from 'ng-zorro-antd/card';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-my-news',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzTableModule,
    NzCardComponent,
    NzTagModule,
    NzButtonModule,
    NzPaginationModule,
    NzInputModule,
    NzIconModule,
    NzSelectModule,
  ],
  templateUrl: './my-news.component.html',
  styleUrl: './my-news.component.css',
})
export class MyNewsComponent implements OnInit {
  myArticles: NewsResponseDTO[] = [];
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  loading = false;
  authorId: string = '';
  searchText = '';
  selectedStatus: number[] = [0, 1, 2]; // Mặc định hiển thị tất cả trạng thái
  statusOptions = [
    { label: 'Tất cả', value: [0, 1, 2] },
    { label: 'Đã xuất bản', value: [0] },
    { label: 'Chờ duyệt', value: [1] },
    { label: 'Bản nháp', value: [2] },
  ];

  constructor(
    private newsService: NewsService,
    private router: Router,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.authorId = this.getAuthorIdFromToken();
    this.loadMyArticles();
  }

  getAuthorIdFromToken(): string {
    const token =
      sessionStorage.getItem('jwt_token') || localStorage.getItem('jwt_token');
    if (!token) return '';
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded['nameidentifier'] || decoded['sub'] || '';
    } catch {
      return '';
    }
  }

  loadMyArticles() {
    if (!this.authorId) {
      this.message.error('Không tìm thấy thông tin tác giả');
      return;
    }

    this.loading = true;
    const skip = (this.currentPage - 1) * this.pageSize;

    // Đầu tiên, lấy tổng số tin tức để phân trang chính xác
    this.getTotalNewsCount().then((total) => {
      this.totalItems = total;

      // Sau đó lấy dữ liệu cho trang hiện tại
      this.newsService
        .getNewsByAuthor(
          this.authorId,
          skip,
          this.pageSize,
          this.selectedStatus,
          this.searchText
        )
        .subscribe({
          next: (news) => {
            this.myArticles = news;
            this.loading = false;
          },
          error: (err) => {
            console.error('Failed to load news:', err);
            this.message.error('Không thể tải danh sách tin tức');
            this.loading = false;
          },
        });
    });
  }

  // Phương thức để lấy tổng số tin tức cho phân trang
  async getTotalNewsCount(): Promise<number> {
    return new Promise<number>((resolve) => {
      // Lấy tất cả tin tức của tác giả
      this.newsService.getAllNews().subscribe({
        next: (data) => {
          let filteredByAuthor = data.filter(
            (news) => news.authorId === this.authorId
          );

          // Lọc theo trạng thái
          if (this.selectedStatus && this.selectedStatus.length > 0) {
            filteredByAuthor = filteredByAuthor.filter((news) =>
              this.selectedStatus.includes(news.status)
            );
          }

          // Nếu có từ khóa tìm kiếm, lọc thêm theo tiêu đề
          if (this.searchText && this.searchText.trim().length > 0) {
            const searchLower = this.searchText.toLowerCase().trim();
            filteredByAuthor = filteredByAuthor.filter((news) =>
              news.title.toLowerCase().includes(searchLower)
            );
          }

          resolve(filteredByAuthor.length);
        },
        error: () => resolve(0), // Nếu lỗi, giả định không có tin nào
      });
    });
  }

  // Phương thức xử lý tìm kiếm
  onSearch() {
    this.currentPage = 1;
    this.loadMyArticles();
  }

  // Phương thức xử lý khi thay đổi trạng thái
  onStatusChange() {
    this.currentPage = 1;
    this.loadMyArticles();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadMyArticles();
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 1; // Reset về trang đầu khi thay đổi số lượng hiển thị
    this.loadMyArticles();
  }

  navigateToDetail(newsId: number | string) {
    this.router.navigate(['/news', newsId]);
  }
}
