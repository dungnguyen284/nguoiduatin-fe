import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { StockChartComponent } from '../../shared/components/stock-chart/stock-chart.component';
import { StockService } from '../../services/stock.service';
import { NewsService } from '../../services/news.service';
import { StockResponse, StockData } from '../../models/stock-response.model';
import {
  FinancialRatiosResponse,
  IncomeStatementResponse,
} from '../../models/financial-data.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-stock-detail',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzSpinModule,
    NzTagModule,
    NzButtonModule,
    NzIconModule,
    NzDividerModule,
    NzGridModule,
    NzStatisticModule,
    NzTabsModule,
    NzEmptyModule,
    StockChartComponent,
  ],
  templateUrl: './stock-detail.component.html',
  styleUrl: './stock-detail.component.css',
})
export class StockDetailComponent implements OnInit {
  stockSymbol: string = '';
  loading = false;
  stockData: StockData | null = null;
  error: string | null = null;

  // Financial data
  financialRatios: FinancialRatiosResponse | null = null;
  incomeStatement: IncomeStatementResponse | null = null;
  financialLoading = false;
  selectedPeriod: 'year' | 'quarter' = 'year';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private stockService: StockService,
    private newsService: NewsService
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.stockSymbol = params['symbol'];
      console.log('Stock symbol:', this.stockSymbol);
      this.loadStockData();
    });
  }

  loadStockData() {
    if (!this.stockSymbol) return;

    this.loading = true;
    this.error = null;

    this.stockService.getStockBySymbol(this.stockSymbol).subscribe({
      next: (response: StockResponse) => {
        this.stockData = response.data;
        this.loading = false;
        console.log('Stock data loaded:', this.stockData);
        // Load financial data after stock data is loaded
        this.loadFinancialData();
      },
      error: (error) => {
        this.error = 'Không thể tải thông tin cổ phiếu';
        this.loading = false;
        console.error('Error loading stock data:', error);
      },
    });
  }

  loadFinancialData() {
    if (!this.stockSymbol) return;

    this.financialLoading = true;

    // Load both financial ratios and income statement in parallel
    forkJoin({
      ratios: this.newsService.getFinancialRatios(
        this.stockSymbol,
        this.selectedPeriod
      ),
      incomeStatement: this.newsService.getIncomeStatement(
        this.stockSymbol,
        this.selectedPeriod
      ),
    }).subscribe({
      next: (data) => {
        this.financialRatios = data.ratios;
        this.incomeStatement = data.incomeStatement;
        this.financialLoading = false;
        console.log('Financial data loaded:', data);
        console.log(
          'Financial ratios records:',
          this.financialRatios?.data?.records
        );
        console.log(
          'Income statement records:',
          this.incomeStatement?.data?.records
        );
      },
      error: (error) => {
        console.error('Error loading financial data:', error);
        this.financialLoading = false;
        // Don't show error to user, just log it since financial data is supplementary
      },
    });
  }

  onPeriodChange(period: 'year' | 'quarter') {
    this.selectedPeriod = period;
    this.loadFinancialData();
  }

  getPriceChange(): number {
    if (!this.stockData?.tradingStats?.stats) return 0;
    return this.stockData.tradingStats.stats.priceChange;
  }

  getPriceChangePercent(): number {
    if (!this.stockData?.tradingStats?.stats) return 0;
    const { priceChange, refPrice } = this.stockData.tradingStats.stats;
    return refPrice > 0 ? (priceChange / refPrice) * 100 : 0;
  }

  getPriceChangeColor(): string {
    const change = this.getPriceChange();
    if (change > 0) return '#52c41a';
    if (change < 0) return '#ff4d4f';
    return '#faad14';
  }

  getCurrentTime(): string {
    return new Date().toLocaleString('vi-VN');
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('vi-VN');
  }

  // Format date from historical record
  formatRecordDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('vi-VN');
  }

  // Get officer initials for avatar
  getOfficerInitials(name: string): string {
    if (!name) return '';
    const words = name.split(' ');
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    return (
      words[0].charAt(0).toUpperCase() +
      words[words.length - 1].charAt(0).toUpperCase()
    );
  }

  // Get latest historical record
  getLatestRecord() {
    if (
      !this.stockData?.historical?.records ||
      this.stockData.historical.records.length === 0
    ) {
      return null;
    }

    // Sort by date and get the latest record
    const sortedRecords = [...this.stockData.historical.records].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return sortedRecords[0];
  }

  // Get previous day record for comparison
  getPreviousRecord() {
    if (
      !this.stockData?.historical?.records ||
      this.stockData.historical.records.length < 2
    ) {
      return null;
    }

    const sortedRecords = [...this.stockData.historical.records].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return sortedRecords[1]; // Previous day
  }

  // Calculate price change from historical data
  getHistoricalPriceChange(): number {
    const latest = this.getLatestRecord();
    const previous = this.getPreviousRecord();

    if (!latest || !previous) return 0;

    return latest.close - previous.close;
  }

  // Calculate price change percentage from historical data
  getHistoricalPriceChangePercent(): number {
    const latest = this.getLatestRecord();
    const previous = this.getPreviousRecord();

    if (!latest || !previous || previous.close === 0) return 0;

    return ((latest.close - previous.close) / previous.close) * 100;
  }

  // Get price change color from historical data
  getHistoricalPriceChangeColor(): string {
    const change = this.getHistoricalPriceChange();
    if (change > 0) return '#52c41a';
    if (change < 0) return '#ff4d4f';
    return '#faad14';
  }

  goBack() {
    this.router.navigate(['/']);
  }

  // Helper methods for event data formatting
  parseEventRatio(ratioString: string): number {
    return parseFloat(ratioString) || 0;
  }

  parseEventValue(valueString: string): number {
    return parseFloat(valueString) || 0;
  }

  formatEventRatio(ratioString: string): string {
    const ratio = this.parseEventRatio(ratioString);
    return (ratio * 100).toFixed(2);
  }

  formatEventValue(valueString: string): string {
    const value = this.parseEventValue(valueString);
    return value.toLocaleString('vi-VN');
  }

  // Financial data formatting methods
  formatFinancialValue(value: number | null): string {
    if (value === null || value === undefined) return 'N/A';
    // Convert to billions (tỷ) and format
    const billions = value / 1000000000;
    if (billions >= 1) {
      return billions.toFixed(2).replace('.', ',');
    }
    // Convert to millions (triệu) if less than 1 billion
    const millions = value / 1000000;
    return millions.toFixed(2).replace('.', ',');
  }

  formatRatioValue(value: number | null): string {
    if (value === null || value === undefined) return 'N/A';

    // Đối với EPS và BVPS có thể là số lớn, format khác với các tỷ số thông thường
    if (Math.abs(value) >= 1000000) {
      return this.formatLargeNumber(value);
    }

    // Đối với các tỷ số thông thường (P/E, P/B, etc.)
    if (Math.abs(value) >= 100) {
      return value.toFixed(1).replace('.', ',');
    }

    return value.toFixed(2).replace('.', ',');
  }

  formatPercentValue(value: number | null): string {
    if (value === null || value === undefined) return 'N/A';
    return (value * 100).toFixed(2).replace('.', ',');
  }

  formatPeriod(year: number, quarter: number): string {
    if (quarter === 0) {
      return `Năm ${year}`;
    }
    return `Q${quarter}/${year}`;
  }

  formatLargeNumber(value: number | null): string {
    if (value === null || value === undefined || value === 0) return 'N/A';

    // Xử lý các số âm
    const isNegative = value < 0;
    const absValue = Math.abs(value);

    let result = '';

    // Convert to nghìn tỷ (thousand billions) for extremely large numbers (>= 1000 tỷ)
    if (absValue >= 1000000000000000) {
      const nghintys = absValue / 1000000000000000;
      result = nghintys.toFixed(1).replace('.', ',') + ' nghìn tỷ';
    }
    // Convert to tỷ (billions) for very large numbers (>= 1 tỷ)
    else if (absValue >= 1000000000000) {
      const billionsVN = absValue / 1000000000000;
      result = billionsVN.toFixed(1).replace('.', ',') + ' tỷ';
    }
    // Convert to triệu (millions) for medium numbers (>= 1 triệu)
    else if (absValue >= 1000000000) {
      const millionsVN = absValue / 1000000000;
      result = millionsVN.toFixed(1).replace('.', ',') + ' tr';
    }
    // Convert to nghìn (thousands) for smaller numbers (>= 1000)
    else if (absValue >= 1000000) {
      const thousands = absValue / 1000000;
      result = thousands.toFixed(0).replace('.', ',') + ' ng';
    } else {
      result = absValue.toLocaleString('vi-VN');
    }

    return isNegative ? '-' + result : result;
  }
}
