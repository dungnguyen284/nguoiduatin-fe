import { Component, OnInit, OnDestroy } from '@angular/core';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, switchMap, takeUntil } from 'rxjs/operators';
import { NewsService } from '../../../services/news.service';
import { NewsResponseDTO } from '../../../models/news-response.model';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../services/auth.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    NzMenuModule,
    NzButtonModule,
    NzIconModule,
    NzDropDownModule,
    ReactiveFormsModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  providers: [NewsService],
})
export class HeaderComponent implements OnInit, OnDestroy {
  searchControl = new FormControl('');
  suggestions: NewsResponseDTO[] = [];
  isLoggedIn = false;
  showSuggestions = false;
  userRole: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private newsService: NewsService,
    public router: Router,
    public authService: AuthService
  ) {}

  private decodeJwt(token: string): any {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  }

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
          }
        } else {
          this.userRole = null;
        }
      });

    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        switchMap((keyword) =>
          keyword ? this.newsService.searchNewsByTitle(keyword) : []
        ),
        takeUntil(this.destroy$)
      )
      .subscribe((results) => {
        this.suggestions = results;
        this.showSuggestions = results.length > 0;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goToDetail(newsId: number | string) {
    this.suggestions = [];
    this.searchControl.setValue('');
    this.showSuggestions = false;
    this.router.navigate(['/news', newsId]);
  }

  hideSuggestions() {
    setTimeout(() => (this.showSuggestions = false), 150);
  }

  onSearchFocus() {
    if (this.suggestions.length > 0) {
      this.showSuggestions = true;
    }
  }

  onLogout() {
    this.authService.logout();
    this.isLoggedIn = false;
    this.userRole = null;
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

  onAdminDashboard() {
    this.router.navigate(['/admin/dashboard']);
  }

  onJournalistDashboard() {
    this.router.navigate(['/journalist/dashboard']);
  }

  onLogin() {
    this.router.navigate(['/login']);
  }

  onRegister() {
    this.router.navigate(['/register']);
  }
}
