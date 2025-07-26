import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FormsModule } from '@angular/forms';
import { HistoricalRecord } from '../../../models/stock-response.model';

@Component({
  selector: 'app-stock-chart',
  standalone: true,
  imports: [
    CommonModule,
    NzRadioModule,
    NzCardModule,
    NzButtonModule,
    FormsModule,
  ],
  template: `
    <nz-card nzTitle="Biểu đồ giá" [nzExtra]="chartControls">
      <div class="chart-container">
        <canvas #chartCanvas width="800" height="400"></canvas>
      </div>
    </nz-card>

    <ng-template #chartControls>
      <nz-radio-group
        [(ngModel)]="chartType"
        (ngModelChange)="onChartTypeChange()"
      >
        <label nz-radio-button nzValue="line">
          <span>Đường</span>
        </label>
        <label nz-radio-button nzValue="candlestick">
          <span>Nến</span>
        </label>
      </nz-radio-group>
    </ng-template>
  `,
  styles: [
    `
      .chart-container {
        position: relative;
        height: 400px;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      canvas {
        max-width: 100%;
        max-height: 400px;
        border: 1px solid #f0f0f0;
        border-radius: 6px;
      }

      nz-radio-group {
        margin-left: 8px;
      }
    `,
  ],
})
export class StockChartComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() historicalData: HistoricalRecord[] = [];
  @Input() stockSymbol: string = '';
  @ViewChild('chartCanvas', { static: true })
  chartCanvas!: ElementRef<HTMLCanvasElement>;

  chartType: 'line' | 'candlestick' = 'line';

  ngOnInit() {
    console.log('Historical data received:', this.historicalData);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.historicalData && this.historicalData.length > 0) {
        this.createChart();
      }
    }, 100);
  }

  ngOnDestroy() {
    // Clean up if needed
  }

  onChartTypeChange() {
    this.createChart();
  }

  private createChart() {
    if (!this.chartCanvas?.nativeElement || !this.historicalData?.length) {
      console.warn('Chart canvas or data not available');
      return;
    }

    const canvas = this.chartCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Sort data by date
    const sortedData = [...this.historicalData].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (this.chartType === 'line') {
      this.drawLineChart(ctx, canvas, sortedData);
    } else {
      this.drawCandlestickChart(ctx, canvas, sortedData);
    }
  }

  private drawLineChart(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    data: HistoricalRecord[]
  ) {
    const padding = 50;
    const chartWidth = canvas.width - 2 * padding;
    const chartHeight = canvas.height - 2 * padding;

    // Find min and max values
    const prices = data.map((d) => d.close);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;

    // Draw background
    ctx.fillStyle = '#fafafa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines
    ctx.strokeStyle = '#e8e8e8';
    ctx.lineWidth = 1;

    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding + (i * chartHeight) / 5;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(canvas.width - padding, y);
      ctx.stroke();

      // Price labels
      const price = maxPrice - (i * priceRange) / 5;
      ctx.fillStyle = '#666';
      ctx.font = '12px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(price.toLocaleString('vi-VN'), padding - 10, y + 5);
    }

    // Vertical grid lines
    const pointWidth = chartWidth / (data.length - 1);
    for (let i = 0; i < data.length; i += Math.ceil(data.length / 6)) {
      const x = padding + i * pointWidth;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, canvas.height - padding);
      ctx.stroke();

      // Date labels
      const date = new Date(data[i].date).toLocaleDateString('vi-VN', {
        month: 'short',
        day: 'numeric',
      });
      ctx.fillStyle = '#666';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(date, x, canvas.height - padding + 20);
    }

    // Draw price line
    ctx.beginPath();
    ctx.strokeStyle = '#1890ff';
    ctx.lineWidth = 2;

    data.forEach((record, index) => {
      const x = padding + index * pointWidth;
      const y =
        padding +
        chartHeight -
        ((record.close - minPrice) / priceRange) * chartHeight;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw points
    ctx.fillStyle = '#1890ff';
    data.forEach((record, index) => {
      const x = padding + index * pointWidth;
      const y =
        padding +
        chartHeight -
        ((record.close - minPrice) / priceRange) * chartHeight;

      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Draw title
    ctx.fillStyle = '#262626';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      `${this.stockSymbol} - Biểu đồ giá đóng cửa`,
      canvas.width / 2,
      30
    );
  }

  private drawCandlestickChart(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    data: HistoricalRecord[]
  ) {
    const padding = 50;
    const chartWidth = canvas.width - 2 * padding;
    const chartHeight = canvas.height - 2 * padding;

    // Find min and max values
    const allPrices = data.flatMap((d) => [d.open, d.close, d.high, d.low]);
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const priceRange = maxPrice - minPrice;

    // Draw background
    ctx.fillStyle = '#fafafa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines (same as line chart)
    ctx.strokeStyle = '#e8e8e8';
    ctx.lineWidth = 1;

    for (let i = 0; i <= 5; i++) {
      const y = padding + (i * chartHeight) / 5;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(canvas.width - padding, y);
      ctx.stroke();

      const price = maxPrice - (i * priceRange) / 5;
      ctx.fillStyle = '#666';
      ctx.font = '12px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(price.toLocaleString('vi-VN'), padding - 10, y + 5);
    }

    // Draw candlesticks
    const candleWidth = Math.max(chartWidth / data.length - 2, 3);
    const candleSpacing = chartWidth / data.length;

    data.forEach((record, index) => {
      const x = padding + index * candleSpacing + candleSpacing / 2;

      const openY =
        padding +
        chartHeight -
        ((record.open - minPrice) / priceRange) * chartHeight;
      const closeY =
        padding +
        chartHeight -
        ((record.close - minPrice) / priceRange) * chartHeight;
      const highY =
        padding +
        chartHeight -
        ((record.high - minPrice) / priceRange) * chartHeight;
      const lowY =
        padding +
        chartHeight -
        ((record.low - minPrice) / priceRange) * chartHeight;

      const isGreen = record.close >= record.open;

      // Draw wick (high-low line)
      ctx.strokeStyle = isGreen ? '#52c41a' : '#ff4d4f';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      // Draw body (open-close rectangle)
      ctx.fillStyle = isGreen ? '#52c41a' : '#ff4d4f';
      ctx.strokeStyle = isGreen ? '#389e0d' : '#cf1322';
      ctx.lineWidth = 1;

      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.abs(closeY - openY);

      ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
      ctx.strokeRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
    });

    // Draw date labels
    for (let i = 0; i < data.length; i += Math.ceil(data.length / 6)) {
      const x = padding + i * candleSpacing + candleSpacing / 2;
      const date = new Date(data[i].date).toLocaleDateString('vi-VN', {
        month: 'short',
        day: 'numeric',
      });
      ctx.fillStyle = '#666';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(date, x, canvas.height - padding + 20);
    }

    // Draw title
    ctx.fillStyle = '#262626';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${this.stockSymbol} - Biểu đồ nến`, canvas.width / 2, 30);
  }
}
