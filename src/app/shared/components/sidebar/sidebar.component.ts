import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { AuthService } from '../../../services/auth.service';

export interface SidebarMenuItem {
  key: string;
  label: string;
  icon: string;
  route?: string;
  children?: SidebarMenuItem[];
  disabled?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzLayoutModule,
    NzMenuModule,
    NzIconModule,
    NzButtonModule,
    NzAvatarModule,
    NzDividerModule,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent implements OnInit {
  @Input() userRole: string = '';
  @Input() userName: string = '';
  @Input() userEmail: string = '';
  @Input() isCollapsed = false;
  menuItems: SidebarMenuItem[] = [];

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    this.setupMenuItems();
  }

  private setupMenuItems() {
    switch (this.userRole) {
      case 'Admin':
        this.menuItems = [
          {
            key: 'dashboard',
            label: 'Dashboard',
            icon: 'dashboard',
            route: '/admin/dashboard',
          },
          {
            key: 'users',
            label: 'Quản lý người dùng',
            icon: 'team',
            route: '/admin/users',
          },
          {
            key: 'news',
            label: 'Quản lý tin tức',
            icon: 'file-text',
            children: [
              {
                key: 'all-news',
                label: 'Tất cả tin tức',
                icon: 'file-text',
                route: '/admin/news',
              },
              {
                key: 'pending-news',
                label: 'Tin chờ duyệt',
                icon: 'clock-circle',
                route: '/admin/news/pending',
              },
              {
                key: 'rejected-news',
                label: 'Tin bị từ chối',
                icon: 'close-circle',
                route: '/admin/news/rejected',
              },
            ],
          },
          {
            key: 'categories',
            label: 'Quản lý danh mục',
            icon: 'folder',
            route: '/admin/categories',
          },
          {
            key: 'settings',
            label: 'Cài đặt hệ thống',
            icon: 'setting',
            route: '/admin/settings',
          },
        ];
        break;

      case 'Journalist':
        this.menuItems = [
          {
            key: 'dashboard',
            label: 'Dashboard',
            icon: 'dashboard',
            route: '/journalist/dashboard',
          },
          {
            key: 'my-news',
            label: 'Tin tức của tôi',
            icon: 'file-text',
            route: '/journalist/my-news',
          },
          {
            key: 'create-news',
            label: 'Tạo tin tức mới',
            icon: 'plus',
            route: '/journalist/create-news',
          },
          {
            key: 'drafts',
            label: 'Bản nháp',
            icon: 'edit',
            route: '/journalist/drafts',
          },
          {
            key: 'statistics',
            label: 'Thống kê',
            icon: 'bar-chart',
            route: '/journalist/statistics',
          },
          {
            key: 'profile',
            label: 'Hồ sơ cá nhân',
            icon: 'user',
            route: '/journalist/profile',
          },
        ];
        break;

      default:
        this.menuItems = [
          {
            key: 'dashboard',
            label: 'Dashboard',
            icon: 'dashboard',
            route: '/dashboard',
          },
        ];
        break;
    }
  }

  onMenuClick(item: SidebarMenuItem) {
    if (item.route) {
      this.router.navigate([item.route]);
    }
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  toggleCollapsed() {
    this.isCollapsed = !this.isCollapsed;
  }
}
