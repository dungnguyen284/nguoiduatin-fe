import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { StockResponse } from '../models/stock-response.model';

export interface Stock {
  id: number;
  name: string;
  code: string;
  companyDescription: string;
  logoUrl: string;
}

export interface StockCreateDto {
  name: string;
  code: string;
  companyDescription: string;
  logoUrl?: string;
}

// Watchlist interfaces
export interface WatchlistRequest {
  code: string;
  userId: string;
}

export interface WatchlistResponse {
  data: string[];
  statusCode: number;
  isSuccess: boolean;
  message: string;
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

// Price Board interfaces
export interface PriceBoardRequest {
  symbols: string[];
}

export interface PriceBoardRecord {
  symbol: string;
  ceiling: number;
  floor: number;
  refPrice: number;
  stockType: string;
  exchange: string;
  tradingStatus: string;
  securityStatus: string;
  lastTradingDate: string;
  listedShare: number;
  sendingTime: string;
  organName: string;
  mappingSymbol: string;
  productGrpId: string;
  partition: number;
  tradingDate: string;
  accumulatedValue: number;
  accumulatedVolume: number;
  avgMatchPrice: number;
  currentRoom: number;
  foreignBuyVolume: number;
  foreignSellVolume: number;
  foreignBuyValue: number;
  foreignSellValue: number;
  highest: number;
  lowest: number;
  matchPrice: number;
  matchType: string;
  matchVol: number;
  totalRoom: number;
  totalBuyOrders: number;
  totalSellOrders: number;
  bidCount: number;
  askCount: number;
  referencePrice: number;
  bid1Price: number;
  bid1Volume: number;
  bid2Price: number;
  bid2Volume: number;
  bid3Price: number;
  bid3Volume: number;
  ask1Price: number;
  ask1Volume: number;
  ask2Price: number;
  ask2Volume: number;
  ask3Price: number;
  ask3Volume: number;
}

export interface PriceBoardData {
  records: PriceBoardRecord[];
}

export interface PriceBoardResponse {
  data: PriceBoardData;
  statusCode: number;
  isSuccess: boolean;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class StockService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllStocks(search?: string): Observable<any> {
    let url = `${this.apiUrl}/api/stock`;
    // Nếu có từ khóa tìm kiếm, sử dụng OData filter
    if (search && search.trim()) {
      const keyword = search.trim().toLowerCase().replace(/'/g, "''");
      url += `?$filter=contains(tolower(code),'${keyword}') or contains(tolower(name),'${keyword}')`;
    }
    return this.http.get<any>(url).pipe(
      map((response) => {
        return {
          data: response || [],
          total: response.length || 0,
        };
      })
    );
  }

  getStocksPaged(skip: number, top: number, search?: string): Observable<any> {
    // Xây dựng URL OData
    let url = `${this.apiUrl}/api/stock?$skip=${skip}&$top=${top}&$orderby=code asc`;

    // Nếu có từ khóa tìm kiếm, thêm filter OData
    if (search && search.trim()) {
      const keyword = search.trim().toLowerCase().replace(/'/g, "''");
      url += `&$filter=contains(tolower(code),'${keyword}') or contains(tolower(name),'${keyword}')`;
    }

    return this.http.get<any>(url).pipe(
      map((response) => {
        return {
          data: response || [],
          total: response.length || 0,
        };
      })
    );
  }

  getStockById(id: number): Observable<Stock> {
    return this.http.get<any>(`${this.apiUrl}/api/stock/${id}`).pipe(
      map((response) => {
        if (response.isSuccess && response.statusCode === 200) {
          return response;
        }
        throw new Error(response.message || 'Không thể lấy thông tin cổ phiếu');
      })
    );
  }

  getStockBySymbol(symbol: string): Observable<StockResponse> {
    return this.http
      .get<StockResponse>(`${this.apiUrl}/api/stock/${symbol}`)
      .pipe(
        map((response) => {
          if (response.isSuccess && response.statusCode === 200) {
            return response;
          }
          throw new Error(
            response.message || 'Không thể lấy thông tin cổ phiếu'
          );
        })
      );
  }

  createStock(stockData: StockCreateDto): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/stock`, stockData).pipe(
      map((response) => {
        if (
          response.isSuccess &&
          response.statusCode >= 200 &&
          response.statusCode < 300
        ) {
          return response.data;
        }
        throw new Error(response.message || 'Không thể tạo cổ phiếu');
      })
    );
  }

  updateStock(id: number, stockData: StockCreateDto): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/api/stock/${id}`, stockData).pipe(
      map((response) => {
        if (response.isSuccess && response.statusCode === 200) {
          return response.data;
        }
        throw new Error(response.message || 'Không thể cập nhật cổ phiếu');
      })
    );
  }

  deleteStock(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/api/stock/${id}`).pipe(
      map((response) => {
        if (response.isSuccess && response.statusCode === 200) {
          return response.data;
        }
        throw new Error(response.message || 'Không thể xóa cổ phiếu');
      })
    );
  }

  // Watchlist methods
  /**
   * Lấy danh sách watchlist của user
   */
  getWatchlist(userId: string): Observable<WatchlistResponse> {
    console.log('Getting watchlist for user:', userId);
    return this.http
      .get<WatchlistResponse>(`${this.apiUrl}/api/Stock/watchlist/${userId}`)
      .pipe(map((response) => response || []));
  }

  /**
   * Thêm cổ phiếu vào watchlist
   */
  addToWatchlist(request: WatchlistRequest): Observable<any> {
    console.log('Adding to watchlist:', request);
    return this.http.post(`${this.apiUrl}/api/Stock/watchlist/add`, request);
  }

  /**
   * Xóa cổ phiếu khỏi watchlist
   */
  removeFromWatchlist(request: WatchlistRequest): Observable<any> {
    console.log('Removing from watchlist:', request);
    return this.http.post(`${this.apiUrl}/api/Stock/watchlist/remove`, request);
  }

  /**
   * Tìm kiếm cổ phiếu theo từ khóa
   */
  searchStocks(query: string): Observable<StockSearchResponse> {
    console.log('Searching stocks with query:', query);
    return this.http.get<StockSearchResponse>(
      `${this.apiUrl}/api/Stock/search?q=${encodeURIComponent(query)}`
    );
  }

  /**
   * Lấy thông tin bảng giá cho danh sách cổ phiếu
   */
  getPriceBoard(symbols: string[]): Observable<PriceBoardResponse> {
    console.log('Getting price board for symbols:', symbols);
    const request: PriceBoardRequest = { symbols };
    return this.http.post<PriceBoardResponse>(
      `${this.apiUrl}/api/Stock/priceboard`,
      request
    );
  }
}
