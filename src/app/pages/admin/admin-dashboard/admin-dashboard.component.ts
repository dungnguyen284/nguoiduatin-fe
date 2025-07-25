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
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
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
    NzBadgeModule,
    RouterModule,
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboardComponent implements OnInit {
  // Statistics data
  statistics = {
    totalUsers: 1250,
    totalArticles: 3450,
    pendingArticles: 45,
    totalViews: 125000,
    totalRevenue: 25000000,
    monthlyGrowth: 12.5,
  };

  // Recent users table
  recentUsers = [
    {
      id: 1,
      name: 'Nguyễn Văn A',
      email: 'nguyenvana@example.com',
      role: 'Journalist',
      status: 'active',
      joinDate: '2024-01-10',
    },
    {
      id: 2,
      name: 'Trần Thị B',
      email: 'tranthib@example.com',
      role: 'Default',
      status: 'active',
      joinDate: '2024-01-09',
    },
    {
      id: 3,
      name: 'Lê Văn C',
      email: 'levanc@example.com',
      role: 'Journalist',
      status: 'inactive',
      joinDate: '2024-01-08',
    },
  ];

  // Pending articles table
  pendingArticles = [
    {
      id: 1,
      title: 'Thị trường chứng khoán tăng mạnh trong tuần qua',
      author: 'Nguyễn Văn A',
      category: 'Tài chính',
      submitDate: '2024-01-15',
      priority: 'high',
    },
    {
      id: 2,
      title: 'Phân tích xu hướng bất động sản 2024',
      author: 'Trần Thị B',
      category: 'Bất động sản',
      submitDate: '2024-01-14',
      priority: 'medium',
    },
    {
      id: 3,
      title: 'Công nghệ AI và tương lai của ngành báo chí',
      author: 'Lê Văn C',
      category: 'Công nghệ',
      submitDate: '2024-01-13',
      priority: 'low',
    },
  ];

  // System alerts
  systemAlerts = [
    {
      id: 1,
      type: 'warning',
      message: 'Hệ thống backup cần được cập nhật',
      time: '1 giờ trước',
    },
    {
      id: 2,
      type: 'error',
      message: 'Có 5 bài viết bị spam report',
      time: '3 giờ trước',
    },
    {
      id: 3,
      type: 'info',
      message: 'Cập nhật hệ thống hoàn tất',
      time: '1 ngày trước',
    },
  ];

  constructor() {}

  ngOnInit() {}

  getStatusColor(status: string): string {
    switch (status) {
      case 'active':
        return 'green';
      case 'inactive':
        return 'red';
      default:
        return 'default';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'active':
        return 'Hoạt động';
      case 'inactive':
        return 'Không hoạt động';
      default:
        return 'Không xác định';
    }
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'high':
        return 'red';
      case 'medium':
        return 'orange';
      case 'low':
        return 'green';
      default:
        return 'default';
    }
  }

  getPriorityText(priority: string): string {
    switch (priority) {
      case 'high':
        return 'Cao';
      case 'medium':
        return 'Trung bình';
      case 'low':
        return 'Thấp';
      default:
        return 'Không xác định';
    }
  }

  getAlertIcon(type: string): string {
    switch (type) {
      case 'warning':
        return 'exclamation-circle';
      case 'error':
        return 'close-circle';
      case 'info':
        return 'info-circle';
      default:
        return 'bell';
    }
  }

  getAlertColor(type: string): string {
    switch (type) {
      case 'warning':
        return '#faad14';
      case 'error':
        return '#ff4d4f';
      case 'info':
        return '#1890ff';
      default:
        return '#666';
    }
  }
}
