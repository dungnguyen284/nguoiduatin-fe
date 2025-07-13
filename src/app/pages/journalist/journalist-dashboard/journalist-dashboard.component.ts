import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';

@Component({
  selector: 'app-journalist-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzStatisticModule,
    NzGridModule,
    NzTableModule,
    NzTagModule,
    NzButtonModule,
    NzIconModule,
    NzProgressModule,
    NzListModule,
    NzAvatarModule,
  ],
  templateUrl: './journalist-dashboard.component.html',
  styleUrl: './journalist-dashboard.component.css',
})
export class JournalistDashboardComponent implements OnInit {
  // Statistics data
  statistics = {
    totalArticles: 45,
    publishedArticles: 32,
    pendingArticles: 8,
    rejectedArticles: 5,
    totalViews: 12500,
    totalLikes: 890,
    monthlyViews: 3200,
  };

  // Recent articles table
  recentArticles = [
    {
      id: 1,
      title: 'Thị trường chứng khoán tăng mạnh trong tuần qua',
      status: 'published',
      views: 1250,
      likes: 89,
      publishDate: '2024-01-15',
    },
    {
      id: 2,
      title: 'Phân tích xu hướng bất động sản 2024',
      status: 'pending',
      views: 0,
      likes: 0,
      publishDate: '2024-01-14',
    },
    {
      id: 3,
      title: 'Công nghệ AI và tương lai của ngành báo chí',
      status: 'rejected',
      views: 0,
      likes: 0,
      publishDate: '2024-01-13',
    },
  ];

  // Notifications
  notifications = [
    {
      id: 1,
      type: 'success',
      message: 'Bài viết "Thị trường chứng khoán" đã được duyệt và xuất bản',
      time: '2 giờ trước',
    },
    {
      id: 2,
      type: 'warning',
      message: 'Bài viết "Phân tích xu hướng bất động sản" cần chỉnh sửa',
      time: '4 giờ trước',
    },
    {
      id: 3,
      type: 'info',
      message: 'Có 3 bài viết mới cần review',
      time: '1 ngày trước',
    },
  ];

  constructor() {}

  ngOnInit() {}

  getStatusColor(status: string): string {
    switch (status) {
      case 'published':
        return 'green';
      case 'pending':
        return 'orange';
      case 'rejected':
        return 'red';
      default:
        return 'default';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'published':
        return 'Đã xuất bản';
      case 'pending':
        return 'Chờ duyệt';
      case 'rejected':
        return 'Bị từ chối';
      default:
        return 'Không xác định';
    }
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'success':
        return 'check-circle';
      case 'warning':
        return 'exclamation-circle';
      case 'info':
        return 'info-circle';
      default:
        return 'bell';
    }
  }

  getNotificationColor(type: string): string {
    switch (type) {
      case 'success':
        return '#52c41a';
      case 'warning':
        return '#faad14';
      case 'info':
        return '#1890ff';
      default:
        return '#666';
    }
  }
}
