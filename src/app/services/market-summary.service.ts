import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface MarketSummary {
  name: string;
  value: string;
  up?: boolean;
  down?: boolean;
}

@Injectable({ providedIn: 'root' })
export class MarketSummaryService {
  private summary: MarketSummary[] = [
    { name: 'SJC HN', value: '120,900', down: true },
    { name: 'USD', value: '26,350', up: true },
    { name: 'DẦU THÔ', value: '66.45', down: true },
    { name: 'BTC', value: '107,626.61', down: true },
    { name: 'LÃI SUẤT 6T', value: '5.40' },
  ];

  getMarketSummary(): Observable<MarketSummary[]> {
    return of(this.summary);
  }
}
