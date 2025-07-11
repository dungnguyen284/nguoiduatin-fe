import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  StockIndexService,
  StockIndex,
} from '../../../services/stock-index.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-stock-index',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stock-index.component.html',
  styleUrl: './stock-index.component.css',
})
export class StockIndexComponent {
  stockIndices$: Observable<StockIndex[]>;

  constructor(private stockIndexService: StockIndexService) {
    this.stockIndices$ = this.stockIndexService.getStockIndices();
  }
}
