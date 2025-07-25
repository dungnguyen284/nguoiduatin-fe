import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

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

@Injectable({ providedIn: 'root' })
export class StockService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllStocks(search?: string): Observable<any> {
    let url = `${this.apiUrl}/api/stock`;
    // Nếu có từ khóa tìm kiếm, sử dụng OData filter
    if (search && search.trim()) {
      const keyword = encodeURIComponent(
        search.trim().toLowerCase().replace(/'/g, "''")
      );
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
      const keyword = encodeURIComponent(
        search.trim().toLowerCase().replace(/'/g, "''")
      );
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
}
