import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewsService } from '../../../services/news.service';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { NewsResponseDTO } from '../../../models/news-response.model';
import { FeatureNewsManagementComponent } from './feature-news-management/feature-news-management.component';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

@Component({
  selector: 'app-news-management',
  standalone: true,
  imports: [
    CommonModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzModalModule,
    NzTagModule,
    NzSelectModule,
    FormsModule,
    RouterModule,
    NzToolTipModule,
    FeatureNewsManagementComponent,
  ],
  templateUrl: './news-management.component.html',
  styleUrl: './news-management.component.css',
})
export class NewsManagementComponent implements OnInit {
  newsList: (NewsResponseDTO & { authorRole?: string })[] = [];
  loading = true;
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  authorId: string | null = null;
  authorName: string | null = null;
  statusFilters = [
    { text: 'Đã đăng', value: 0 },
    { text: 'Đã ẩn', value: 1 },
    { text: 'Bản nháp', value: 2 },
  ];
  selectedStatusFilter: number[] = [0]; // Mặc định chỉ hiển thị tin đã đăng (status = 0)

  constructor(
    private newsService: NewsService,
    private userService: UserService,
    private message: NzMessageService,
    private route: ActivatedRoute,
    private modal: NzModalService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['authorId']) {
        this.authorId = params['authorId'];
        // Fetch the author name if we have an ID
        this.userService.getUserById(this.authorId as string).subscribe({
          next: (user) => {
            this.authorName = user.fullName;
            this.loadNews();
          },
          error: (err) => {
            console.error('Failed to load user details:', err);
            this.loadNews();
          },
        });
      } else {
        this.loadNews();
      }
    });
  }

  loadNews() {
    this.loading = true;
    const skip = (this.currentPage - 1) * this.pageSize;

    // If we have an authorId, use getNewsByAuthor instead of getNewsPaged
    if (this.authorId) {
      this.newsService
        .getNewsByAuthor(
          this.authorId,
          skip,
          this.pageSize,
          this.selectedStatusFilter.filter((status) => status !== 2) // Exclude drafts
        )
        .subscribe({
          next: (data) => {
            // Enhance news data with author role information - assume all authors are journalists
            this.newsList = data.map((news) => ({
              ...news,
              authorRole: 'Journalist', // Assume all authors are journalists
            }));

            // Thông thường API sẽ trả về tổng số tin, nhưng nếu không có, lấy theo số tin hiện tại
            this.totalItems = data.length > 0 ? data.length + skip : 0;
            this.loading = false;
          },
          error: (err) => {
            console.error('Failed to load news by author:', err);
            this.message.error('Không thể tải danh sách tin tức của tác giả');
            this.loading = false;
          },
        });
    } else {
      this.newsService
        .getNewsPaged(skip, this.pageSize, this.selectedStatusFilter)
        .subscribe({
          next: (data) => {
            // Enhance news data with author role information - assume all authors are journalists
            this.newsList = data.map((news) => ({
              ...news,
              authorRole: 'Journalist', // Assume all authors are journalists
            }));

            // Thông thường API sẽ trả về tổng số tin, nhưng nếu không có, lấy theo số tin hiện tại
            this.totalItems = data.length > 0 ? data.length + skip : 0;
            this.loading = false;
          },
          error: (err) => {
            console.error('Failed to load news:', err);
            this.message.error('Không thể tải danh sách tin tức');
            this.loading = false;
          },
        });
    }
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadNews();
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 1; // Reset về trang đầu tiên khi thay đổi số lượng hiển thị
    this.loadNews();
  }

  onStatusFilterChange() {
    this.currentPage = 1; // Reset về trang đầu tiên khi lọc
    this.loadNews();
  }

  getStatusText(status: number): string {
    switch (status) {
      case 0:
        return 'Đã đăng';
      case 1:
        return 'Đã ẩn';
      case 2:
        return 'Bản nháp';
      default:
        return 'Không xác định';
    }
  }

  getStatusColor(status: number): string {
    switch (status) {
      case 0:
        return 'green';
      case 1:
        return 'red';
      case 2:
        return 'blue';
      default:
        return 'default';
    }
  }

  deleteNews(id: string) {
    this.newsService.getNewsById(id).subscribe((news) => {
      const modal = document.createElement('div');
      modal.innerHTML = `
        <div class="confirm-modal">
          <p>Bạn có chắc chắn muốn xóa tin tức: "${news.title}"?</p>
        </div>
      `;

      // Hiện modal xác nhận
      const confirm = window.confirm(
        `Bạn có chắc chắn muốn xóa tin tức: "${news.title}"?`
      );

      if (confirm) {
        // Chức năng xóa tin tức (hiện không có API xóa, chỉ cập nhật status thành 1 - đã ẩn)
        this.updateNewsStatus(id, 1);
      }
    });
  }

  updateNewsStatus(id: string, status: number) {
    this.newsService.getNewsById(id).subscribe({
      next: (res) => {
        const news = res.data || res;

        // Convert from NewsResponseDTO to NewsCreateDTO
        const dto = {
          title: news.title,
          description: news.description,
          content: news.content,
          link: news.link || '',
          imageUrl: news.imageUrl || '',
          source: news.source || 'Người Đưa Tin',
          status: status, // Cập nhật trạng thái mới
          authorId: news.authorId,
          categoryId: news.categoryId,
          // Chuyển đổi mảng tags thành mảng tagIds
          tagIds: news.tags
            ? news.tags.map((tag: { id: number }) => tag.id)
            : [],
        };

        this.newsService.editNews(id, dto).subscribe({
          next: () => {
            this.message.success('Cập nhật trạng thái tin tức thành công');
            this.loadNews();
          },
          error: (err) => {
            console.error('Failed to update news status:', err);
            this.message.error('Không thể cập nhật trạng thái tin tức');
          },
        });
      },
      error: (err) => {
        console.error('Failed to get news details:', err);
        this.message.error('Không thể lấy thông tin tin tức');
      },
    });
  }

  publishNews(id: string) {
    this.updateNewsStatus(id, 0); // 0 = Đã đăng
  }

  hideNews(id: string) {
    this.updateNewsStatus(id, 1); // 1 = Đã ẩn
  }

  openFeatureNewsManagement(): void {
    const modalRef = this.modal.create({
      nzTitle: '',
      nzContent: FeatureNewsManagementComponent,
      nzWidth: '900px',
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false,
      nzClassName: 'feature-news-modal',
    });

    modalRef.afterClose.subscribe((result) => {
      if (result) {
        // Reload the news list to reflect changes
        this.loadNews();
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
