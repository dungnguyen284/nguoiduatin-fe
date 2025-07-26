import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface WatchlistRequest {
  code: string;
  userId: string;
}

export interface WatchlistResponse {
  data: WatchlistItem[];
  statusCode: number;
  isSuccess: boolean;
  message: string;
}

export interface WatchlistItem {
  id: string;
  code: string;
  userId: string;
  addedDate: string;
  stock?: {
    name: string;
    currentPrice: number;
    priceChange: number;
    priceChangePercent: number;
  };
}

export interface StockSearchResponse {
  data: StockSearchItem[];
  statusCode: number;
  isSuccess: boolean;
  message: string;
}

export interface StockSearchItem {
  code: string;
  name: string;
  exchange?: string;
  industry?: string;
}

@Injectable({
  providedIn: 'root',
})
export class WatchlistService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Lấy danh sách watchlist của user
   */
  getWatchlist(userId: string): Observable<any> {
    return this.http.get<WatchlistResponse>(
      `${this.apiUrl}/api/Stock/watchlist/${userId}`
    );
  }

  /**
   * Thêm cổ phiếu vào watchlist
   */
  addToWatchlist(request: WatchlistRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/Stock/watchlist/add`, request);
  }

  /**
   * Xóa cổ phiếu khỏi watchlist
   */
  removeFromWatchlist(request: WatchlistRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/Stock/watchlist/remove`, request);
  }

  /**
   * Tìm kiếm cổ phiếu theo từ khóa
   */
  searchStocks(query: string): Observable<StockSearchResponse> {
    return this.http.get<StockSearchResponse>(
      `${this.apiUrl}/api/Stock/search?q=${encodeURIComponent(query)}`
    );
  }
}
