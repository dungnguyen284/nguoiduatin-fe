import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface StockIndex {
  name: string;
  value: number;
  change: number;
  percent: string;
  up: boolean;
}

@Injectable({ providedIn: 'root' })
export class StockIndexService {
  private stockIndices: StockIndex[] = [
    {
      name: 'VnIndex',
      value: 1386.97,
      change: 5.01,
      percent: '0.36%',
      up: true,
    },
    {
      name: 'HnxIndex',
      value: 232.51,
      change: 1.58,
      percent: '0.68%',
      up: true,
    },
    { name: 'UPCoM', value: 101.58, change: 0.72, percent: '0.71%', up: true },
    {
      name: 'Dow Jones',
      value: 44828.53,
      change: 344.11,
      percent: '0.77%',
      up: true,
    },
    {
      name: 'Nikkei 225',
      value: 39810.88,
      change: 24.98,
      percent: '0.06%',
      up: true,
    },
  ];

  getStockIndices(): Observable<StockIndex[]> {
    return of(this.stockIndices);
  }
}
