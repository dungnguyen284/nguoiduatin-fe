import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { SidebarComponent } from '../shared/components/sidebar/sidebar.component';
import { AuthService } from '../services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NzLayoutModule,
    NzButtonModule,
    NzIconModule,
    NzBreadCrumbModule,
    NzAvatarModule,
    NzDropDownModule,
    NzMenuModule,
    NzDividerModule,
    NzBadgeModule,
    SidebarComponent,
  ],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.css',
})
export class DashboardLayoutComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  userRole: string | null = null;
  userName: string = '';
  userEmail: string = '';
  sidebarCollapsed = false;
  private destroy$ = new Subject<void>();

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Subscribe to auth state changes
    this.authService
      .isLoggedIn()
      .pipe(takeUntil(this.destroy$))
      .subscribe((loggedIn) => {
        this.isLoggedIn = loggedIn;
        if (loggedIn) {
          const token = this.authService.getToken();
          if (token) {
            const decoded = this.decodeJwt(token);
            this.userRole =
              decoded &&
              decoded[
                'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
              ]
                ? decoded[
                    'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
                  ]
                : null;

            // Extract user info from token
            this.userName =
              decoded[
                'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'
              ] || 'Người dùng';
            this.userEmail = decoded?.email || 'user@example.com';
          }
        } else {
          // Redirect to login if not authenticated
          this.router.navigate(['/login']);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private decodeJwt(token: string): any {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  onProfile() {
    if (this.userRole === 'Admin') {
      this.router.navigate(['/admin/profile']);
    } else if (this.userRole === 'Journalist') {
      this.router.navigate(['/journalist/profile']);
    } else {
      this.router.navigate(['/profile']);
    }
  }

  onSettings() {
    if (this.userRole === 'Admin') {
      this.router.navigate(['/admin/settings']);
    } else {
      this.router.navigate(['/settings']);
    }
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
