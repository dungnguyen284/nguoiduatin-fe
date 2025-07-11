import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MarketSummaryService,
  MarketSummary,
} from '../../../services/market-summary.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-market-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './market-summary.component.html',
  styleUrl: './market-summary.component.css',
})
export class MarketSummaryComponent {
  summary$: Observable<MarketSummary[]>;

  constructor(private marketSummaryService: MarketSummaryService) {
    this.summary$ = this.marketSummaryService.getMarketSummary();
  }
}
