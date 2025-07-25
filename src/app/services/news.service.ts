import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { NewsResponseDTO } from '../models/news-response.model';
import { NewsCreateDTO } from '../models/news-create.dto';
import { FinancialRatiosResponse, IncomeStatementResponse } from '../models/financial-data.model';

@Injectable({
  providedIn: 'root',
})
export class NewsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Lấy tất cả tin tức, có thể lọc theo status (0: ACTIVE, 1: INACTIVE, 2: DRAFT, 3: DRAFT2...)
   * Nếu statusFilter undefined thì lấy tất cả
   */
  getAllNews(statusFilter?: number | number[]): Observable<NewsResponseDTO[]> {
    let filter = '';
    if (typeof statusFilter !== 'undefined') {
      if (Array.isArray(statusFilter)) {
        filter = `$filter=(${statusFilter
          .map((s) => `status eq ${s}`)
          .join(' or ')})`;
      } else {
        filter = `$filter=status eq ${statusFilter}`;
      }
    }
    const url = filter
      ? `${this.apiUrl}/api/News?${filter}`
      : `${this.apiUrl}/api/News`;
    return this.http.get<NewsResponseDTO[]>(url);
  }

  /**
   * Lấy tin theo author, có thể lọc theo status và tìm kiếm theo tiêu đề
   */
  getNewsByAuthor(
    authorId: string,
    skip: number,
    top: number,
    statusFilter?: number | number[],
    searchText?: string
  ): Observable<NewsResponseDTO[]> {
    let filter = `authorId eq '${authorId}'`;

    // Thêm điều kiện tìm kiếm theo tiêu đề nếu có
    if (searchText && searchText.trim().length > 0) {
      searchText = searchText.replace(/'/g, "''").toLowerCase(); // Escape single quotes
      filter += ` and contains(tolower(title),'${searchText}')`;
    }

    // Thêm điều kiện lọc theo trạng thái
    if (typeof statusFilter !== 'undefined') {
      if (Array.isArray(statusFilter)) {
        filter +=
          ' and (' +
          statusFilter.map((s) => `status eq ${s}`).join(' or ') +
          ')';
      } else {
        filter += ` and status eq ${statusFilter}`;
      }
    }

    return this.http.get<NewsResponseDTO[]>(
      `${this.apiUrl}/api/News?$filter=${filter}&$orderby=PublicationDate desc&$skip=${skip}&$top=${top}`
    );
  }

  getNewsByCategory(
    categoryId: string,
    statusFilter?: number | number[]
  ): Observable<NewsResponseDTO[]> {
    let filter = `categoryId eq ${categoryId}`;
    if (typeof statusFilter !== 'undefined') {
      if (Array.isArray(statusFilter)) {
        filter +=
          ' and (' +
          statusFilter.map((s) => `status eq ${s}`).join(' or ') +
          ')';
      } else {
        filter += ` and status eq ${statusFilter}`;
      }
    }
    return this.http.get<NewsResponseDTO[]>(
      `${this.apiUrl}/api/News?$filter=${filter}`
    );
  }

  getTopLatestNews(
    count: number,
    statusFilter?: number | number[]
  ): Observable<NewsResponseDTO[]> {
    let filter = '';
    if (typeof statusFilter !== 'undefined') {
      if (Array.isArray(statusFilter)) {
        filter =
          '$filter=(' +
          statusFilter.map((s) => `status eq ${s}`).join(' or ') +
          ')&';
      } else {
        filter = `$filter=status eq ${statusFilter}&`;
      }
    }
    return this.http.get<NewsResponseDTO[]>(
      `${this.apiUrl}/api/News?${filter}$orderby=PublicationDate desc&$top=${count}`
    );
  }

  getNewsById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/News/${id}`);
  }

  searchNewsByTitle(
    keyword: string,
    statusFilter?: number | number[]
  ): Observable<NewsResponseDTO[]> {
    const lowerKeyword = keyword.toLowerCase().replace(/'/g, "''");
    let filter = `contains(tolower(title),'${lowerKeyword}')`;
    if (typeof statusFilter !== 'undefined') {
      if (Array.isArray(statusFilter)) {
        filter +=
          ' and (' +
          statusFilter.map((s) => `status eq ${s}`).join(' or ') +
          ')';
      } else {
        filter += ` and status eq ${statusFilter}`;
      }
    }
    return this.http.get<NewsResponseDTO[]>(
      `${this.apiUrl}/api/News?$filter=${filter}`
    );
  }

  getNewsPaged(
    skip: number,
    top: number,
    statusFilter?: number | number[]
  ): Observable<NewsResponseDTO[]> {
    let filter = '';
    if (typeof statusFilter !== 'undefined') {
      if (Array.isArray(statusFilter)) {
        filter =
          '$filter=(' +
          statusFilter.map((s) => `status eq ${s}`).join(' or ') +
          ')&';
      } else {
        filter = `$filter=status eq ${statusFilter}&`;
      }
    }
    return this.http.get<NewsResponseDTO[]>(
      `${this.apiUrl}/api/News?${filter}$orderby=SlotNumber desc,PublicationDate desc&$skip=${skip}&$top=${top}`
    );
  }

  getNewsByCategoryPaged(
    categoryId: string,
    skip: number,
    top: number,
    statusFilter?: number | number[]
  ): Observable<NewsResponseDTO[]> {
    let filter = `categoryId eq ${categoryId}`;
    if (typeof statusFilter !== 'undefined') {
      if (Array.isArray(statusFilter)) {
        filter +=
          ' and (' +
          statusFilter.map((s) => `status eq ${s}`).join(' or ') +
          ')';
      } else {
        filter += ` and status eq ${statusFilter}`;
      }
    }
    return this.http.get<NewsResponseDTO[]>(
      `${this.apiUrl}/api/News?$filter=${filter}&$orderby=PublicationDate desc&$skip=${skip}&$top=${top}`
    );
  }

  searchNewsByTag(
    tagName: string,
    skip: number,
    top: number,
    statusFilter?: number | number[]
  ): Observable<{ data: NewsResponseDTO[] }> {
    const lowerTagName = tagName.toLowerCase().replace(/'/g, "''");
    let filter = `tagNames/any(t: tolower(t) eq '${lowerTagName}')`;
    if (typeof statusFilter !== 'undefined') {
      if (Array.isArray(statusFilter)) {
        filter +=
          ' and (' +
          statusFilter.map((s) => `status eq ${s}`).join(' or ') +
          ')';
      } else {
        filter += ` and status eq ${statusFilter}`;
      }
    }
    return this.http.get<{ data: NewsResponseDTO[] }>(
      `${this.apiUrl}/api/News?$filter=${filter}&$orderby=PublicationDate desc&$skip=${skip}&$top=${top}`
    );
  }

  createNews(news: NewsCreateDTO) {
    // status: 0 ACTIVE, 1 INACTIVE, 2 DRAFT
    const payload = {
      ...news,
      link: '',
      source: 'Người Đưa Tin',
    };
    return this.http.post(`${this.apiUrl}/api/news`, payload);
  }

  editNews(id: string, news: NewsCreateDTO) {
    // status: 1 ACTIVE, 0 INACTIVE, 2 DRAFT
    const payload = {
      ...news,
      link: '',
      source: 'Người Đưa Tin',
    };
    return this.http.put(`${this.apiUrl}/api/news/${id}`, payload);
  }

  getPresignedUrl(fileName: string, fileType: string) {
    return this.http.get<{ presignedUrl: string; fileKey: string }>(
      `${environment.presignApiUrl}/upload-url?fileName=${encodeURIComponent(
        fileName
      )}&fileType=${encodeURIComponent(fileType)}`
    );
  }

  uploadFileToS3(presignedUrl: string, file: File) {
    return this.http.put(presignedUrl, file, {
      headers: {
        'Content-Type': file.type,
      },
      reportProgress: true,
      observe: 'events',
    });
  }

  setFrontpageNews(newsItems: { id: number; slotNumber: number }[]) {
    return this.http.put(`${this.apiUrl}/api/news/frontpages`, newsItems);
  }

  /**
   * Lấy thông tin tỷ số tài chính của cổ phiếu
   * @param symbol Mã cổ phiếu (VD: HPG)
   * @param period 'year' hoặc 'quarter'
   */
  getFinancialRatios(symbol: string, period: 'year' | 'quarter'): Observable<FinancialRatiosResponse> {
    return this.http.get<FinancialRatiosResponse>(
      `${this.apiUrl}/api/Stock/financeratios/${symbol}?period=${period}`
    );
  }

  /**
   * Lấy báo cáo thu nhập của cổ phiếu
   * @param symbol Mã cổ phiếu (VD: HPG)
   * @param period 'year' hoặc 'quarter'
   */
  getIncomeStatement(symbol: string, period: 'year' | 'quarter'): Observable<IncomeStatementResponse> {
    return this.http.get<IncomeStatementResponse>(
      `${this.apiUrl}/api/Stock/incomestatement/${symbol}?period=${period}`
    );
  }
}
