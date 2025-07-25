import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';

// NgZorro imports
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';

// Services
import { StockService, WatchlistItem, WatchlistRequest, StockSearchItem } from '../../../services/stock.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-watchlist',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzModalModule,
    NzButtonModule,
    NzIconModule,
    NzListModule,
    NzInputModule,
    NzEmptyModule,
    NzTagModule,
    NzDividerModule,
    NzToolTipModule,
    NzMessageModule,
    NzSelectModule
  ],
  templateUrl: './watchlist.component.html',
  styleUrl: './watchlist.component.css'
})
export class WatchlistComponent implements OnInit, OnDestroy {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  // Watchlist data
  watchlist: WatchlistItem[] = [];
  loading = false;
  maxWatchlistSize = 5;

  // Add stock functionality
  newStockCode = '';
  addingStock = false;
  removingStockId = '';

  // Search functionality
  searchTerm = '';
  searchResults: StockSearchItem[] = [];
  searchLoading = false;
  private searchSubject = new Subject<string>();
  
  // Component lifecycle
  private destroy$ = new Subject<void>();

  constructor(
    private stockService: StockService,
    private authService: AuthService,
    private message: NzMessageService
  ) {
    this.initializeSearchFunction();
  }

  ngOnInit(): void {
    console.log('WatchlistComponent initialized');
    if (this.visible) {
      this.loadWatchlist();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Modal visibility management
  onVisibleChange(visible: boolean): void {
    console.log('Modal visibility changed to:', visible);
    this.visible = visible;
    this.visibleChange.emit(visible);
    
    if (visible) {
      console.log('Modal opened, loading watchlist...');
      this.loadWatchlist();
    } else {
      this.clearSearch();
    }
  }

  closeModal(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.clearSearch();
  }

  // Search functionality initialization
  private initializeSearchFunction(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        console.log('Search term after debounce:', term);
        
        if (!term || term.length < 2) {
          this.searchResults = [];
          this.searchLoading = false;
          return of([]);
        }

        this.searchLoading = true;
        console.log('Calling search API with term:', term);
        
        return this.stockService.searchStocks(term);
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        console.log('Search API response:', response);
        
        if (Array.isArray(response)) {
          this.searchResults = [];
        } else {
          this.searchResults = response.data || [];
        }
        
        this.searchLoading = false;
        console.log('Search results set to:', this.searchResults);
      },
      error: (error) => {
        console.error('Search error:', error);
        this.searchResults = [];
        this.searchLoading = false;
        this.message.error('Lỗi khi tìm kiếm cổ phiếu');
      }
    });
  }

  // Search methods
  onSearchChange(value: string): void {
    console.log('Search value changed:', value);
    this.searchTerm = value;
    this.newStockCode = value; // Sync with manual input
    this.searchSubject.next(value);
  }

  onSelectStock(stock: StockSearchItem): void {
    if (!this.isStockInWatchlist(stock.code)) {
      this.newStockCode = stock.code;
      this.searchTerm = stock.code;
      this.searchResults = [];
      this.addStock();
    }
  }

  onSelectChange(value: string): void {
    if (value) {
      const selectedStock = this.searchResults.find(s => s.code === value);
      if (selectedStock) {
        this.onSelectStock(selectedStock);
      }
    }
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.newStockCode = '';
    this.searchResults = [];
  }

  isStockInWatchlist(code: string): boolean {
    return this.watchlist.some(item => 
      item.code.toLowerCase() === code.toLowerCase()
    );
  }

  // Watchlist management
  loadWatchlist(): void {
    console.log('loadWatchlist called');
    
    const userId = this.authService.getUserId();
    console.log('User ID:', userId);
    
    if (!userId) {
      console.warn('No user ID found - user not logged in');
      this.message.error('Vui lòng đăng nhập để sử dụng tính năng này');
      return;
    }

    console.log('Starting API call to get watchlist...');
    this.loading = true;
    
    this.stockService.getWatchlist(userId).subscribe({
      next: (response) => {
        console.log('Watchlist API response:', response);
        
        if (response && response.isSuccess) {
          this.watchlist = response.data || [];
          console.log('Watchlist loaded:', this.watchlist);
        } else {
          console.error('Watchlist API returned error:', response);
          this.message.error(response?.message || 'Không thể tải danh sách theo dõi');
        }
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading watchlist:', error);
        this.message.error('Không thể tải danh sách theo dõi');
        this.loading = false;
      }
    });
  }

  addStock(): void {
    if (!this.newStockCode.trim()) {
      this.message.warning('Vui lòng nhập mã cổ phiếu');
      return;
    }

    if (this.watchlist.length >= this.maxWatchlistSize) {
      this.message.warning(`Chỉ được theo dõi tối đa ${this.maxWatchlistSize} cổ phiếu`);
      return;
    }

    const userId = this.authService.getUserId();
    if (!userId) {
      this.message.error('Vui lòng đăng nhập để sử dụng tính năng này');
      return;
    }

    // Check if stock already exists in watchlist
    const stockExists = this.watchlist.some(item => 
      item.code.toLowerCase() === this.newStockCode.trim().toLowerCase()
    );

    if (stockExists) {
      this.message.warning('Cổ phiếu này đã có trong danh sách theo dõi');
      return;
    }

    const request: WatchlistRequest = {
      code: this.newStockCode.trim().toUpperCase(),
      userId: userId
    };

    console.log('Adding stock to watchlist:', request);
    this.addingStock = true;
    
    this.stockService.addToWatchlist(request).subscribe({
      next: (response) => {
        console.log('Add stock response:', response);
        this.message.success('Đã thêm cổ phiếu vào danh sách theo dõi');
        this.clearSearch();
        this.loadWatchlist(); // Reload to get updated data
        this.addingStock = false;
      },
      error: (error) => {
        console.error('Error adding stock:', error);
        this.message.error('Không thể thêm cổ phiếu. Vui lòng kiểm tra lại mã cổ phiếu');
        this.addingStock = false;
      }
    });
  }

  removeStock(item: WatchlistItem): void {
    const userId = this.authService.getUserId();
    if (!userId) {
      this.message.error('Vui lòng đăng nhập để sử dụng tính năng này');
      return;
    }

    const request: WatchlistRequest = {
      code: item.code,
      userId: userId
    };

    console.log('Removing stock from watchlist:', request);
    this.removingStockId = item.id;
    
    this.stockService.removeFromWatchlist(request).subscribe({
      next: (response) => {
        console.log('Remove stock response:', response);
        this.message.success('Đã xóa cổ phiếu khỏi danh sách theo dõi');
        this.loadWatchlist(); // Reload to get updated data
        this.removingStockId = '';
      },
      error: (error) => {
        console.error('Error removing stock:', error);
        this.message.error('Không thể xóa cổ phiếu');
        this.removingStockId = '';
      }
    });
  }

  onEnterPressed(): void {
    if (this.newStockCode.trim()) {
      this.addStock();
    }
  }

  // Utility methods for display
  getPriceChangeColor(priceChange: number): string {
    if (priceChange > 0) return '#52c41a'; // Green
    if (priceChange < 0) return '#ff4d4f'; // Red
    return '#faad14'; // Yellow for no change
  }

  formatPrice(price: number): string {
    return price?.toLocaleString('vi-VN') || 'N/A';
  }

  formatPriceChange(change: number, percent: number): string {
    const changeStr = change?.toFixed(2) || '0.00';
    const percentStr = percent?.toFixed(2) || '0.00';
    const sign = change >= 0 ? '+' : '';
    return `${sign}${changeStr} (${sign}${percentStr}%)`;
  }
}
