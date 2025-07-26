import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { StockService } from '../../../services/stock.service';
import { AuthService } from '../../../services/auth.service';

import { NzModalModule } from 'ng-zorro-antd/modal';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-watchlist',
  standalone: true,
  imports: [CommonModule, NzModalModule],
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.css'],
})
export class WatchlistComponent implements OnInit {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  stocks: any[] = [];
  loading = false;

  constructor(
    private stockService: StockService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if (this.visible) {
      this.loadWatchlist();
    }
  }

  ngOnChanges(): void {
    if (this.visible) {
      this.loadWatchlist();
    }
  }

  loadWatchlist() {
    this.loading = true;
    const userId = this.authService.getUserId();
    if (!userId) {
      this.stocks = [];
      this.loading = false;
      return;
    }
    this.stockService.getWatchlist(userId).subscribe(
      (res: any) => {
        const codes = res?.data || [];
        if (!codes.length) {
          this.stocks = [];
          this.loading = false;
          return;
        }
        this.stockService.getPriceBoard(codes).subscribe(
          (priceRes: any) => {
            this.stocks = priceRes?.data?.records || [];
            this.loading = false;
          },
          (_: any) => (this.loading = false)
        );
      },
      (_: any) => (this.loading = false)
    );
  }

  handleCancel() {
    this.visible = false;
    this.visibleChange.emit(false);
  }
}
