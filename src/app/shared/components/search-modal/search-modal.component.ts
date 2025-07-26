import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatListModule } from '@angular/material/list';
import { Subject } from 'rxjs';
import { debounceTime, switchMap, takeUntil } from 'rxjs/operators';
import { TagService, Tag } from '../../../services/tag.service';
import { NewsService } from '../../../services/news.service';
import { StockService, Stock } from '../../../services/stock.service';
import { NewsResponseDTO } from '../../../models/news-response.model';

interface SearchRoute {
  path: string;
  label: string;
}

@Component({
  selector: 'app-search-modal',
  standalone: true,
  templateUrl: './search-modal.component.html',
  styleUrl: './search-modal.component.css',
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatButtonModule,
    MatDividerModule,
    MatListModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class SearchModalComponent implements OnInit, OnDestroy {
  keyword = '';
  searchType = 'news'; // Default to news
  searchControl = new FormControl('');
  suggestions: (NewsResponseDTO | Stock)[] = [];
  showSuggestions = false;
  tags: Tag[] = [];
  loading = false;
  private destroy$ = new Subject<void>();
  private searchDestroy$ = new Subject<void>();
  routes: SearchRoute[] = [
    { path: '/', label: 'Trang chủ' },
    { path: '/company', label: 'Doanh nghiệp' },
    { path: '/real-estate', label: 'Bất động sản' },
    { path: '/finance', label: 'Tài chính' },
    { path: '/stock', label: 'Chứng khoán' },
  ];

  constructor(
    public dialogRef: MatDialogRef<SearchModalComponent>,
    private router: Router,
    private tagService: TagService,
    private newsService: NewsService,
    private stockService: StockService
  ) {}

  ngOnInit() {
    this.loadTags();
    this.setupSearchSubscription();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.searchDestroy$.next();
    this.searchDestroy$.complete();
  }

  setupSearchSubscription() {
    // Unsubscribe previous search subscription
    this.searchDestroy$.next();

    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        switchMap((keyword) => {
          console.log('Search keyword:', keyword); // Debug log
          if (!keyword || keyword.trim().length < 2) {
            console.log('Keyword too short or empty'); // Debug log
            return [];
          }

          console.log('Search type:', this.searchType); // Debug log
          if (this.searchType === 'news') {
            console.log('Searching news...'); // Debug log
            // Only search published news (status = 0)
            return this.newsService.searchNewsByTitle(keyword.trim(), 0);
          } else {
            console.log('Searching stocks...'); // Debug log
            return this.stockService.getAllStocks(keyword.trim());
          }
        }),
        takeUntil(this.searchDestroy$)
      )
      .subscribe({
        next: (results) => {
          console.log('Search results:', results); // Debug log
          if (this.searchType === 'news') {
            this.suggestions = results as NewsResponseDTO[];
          } else {
            this.suggestions = (results as any).data as Stock[];
          }
          console.log('Suggestions:', this.suggestions); // Debug log
          this.showSuggestions = this.suggestions.length > 0;
          console.log('Show suggestions:', this.showSuggestions); // Debug log
        },
        error: (error) => {
          console.error('Search error:', error);
          this.suggestions = [];
          this.showSuggestions = false;
        },
      });
  }

  onSearchFocus() {
    if (this.suggestions.length > 0) {
      this.showSuggestions = true;
    }
  }

  hideSuggestions() {
    setTimeout(() => (this.showSuggestions = false), 150);
  }

  onSearchTypeChange() {
    console.log('Search type changed to:', this.searchType); // Debug log
    this.searchControl.setValue('');
    this.suggestions = [];
    this.showSuggestions = false;
    // Re-setup subscription for new search type
    this.setupSearchSubscription();
  }

  loadTags() {
    this.loading = true;
    this.tagService.getAllTags().subscribe({
      next: (response) => {
        console.log('Tags response:', response); // Debug log
        this.tags = response.data || response || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading tags:', error);
        this.loading = false;
      },
    });
  }

  onTagClick(tag: Tag) {
    this.dialogRef.close();
    this.router.navigate(['/'], { queryParams: { tag: tag.name } });
  }

  onSuggestionClick(item: NewsResponseDTO | Stock) {
    this.dialogRef.close();
    if (this.searchType === 'news') {
      const news = item as NewsResponseDTO;
      this.router.navigate(['/news', news.id]);
    } else {
      const stock = item as Stock;
      this.router.navigate(['/stock', stock.code]);
    }
  }

  getSuggestionTitle(item: NewsResponseDTO | Stock): string {
    if (this.searchType === 'news') {
      return (item as NewsResponseDTO).title;
    } else {
      const stock = item as Stock;
      return `${stock.code} - ${stock.name}`;
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onSearch(): void {
    const keyword = this.searchControl.value?.trim();
    if (!keyword) return;

    this.dialogRef.close();
    if (this.searchType === 'news') {
      this.router.navigate(['/'], { queryParams: { search: keyword } });
    } else {
      this.router.navigate(['/stock'], { queryParams: { search: keyword } });
    }
  }

  goto(path: string) {
    this.dialogRef.close();
    this.router.navigate([path]);
  }
}
