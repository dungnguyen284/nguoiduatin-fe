import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { NewsResponseDTO } from '../models/news-response.model';
import { NewsCreateDTO } from '../models/news-create.dto';

@Injectable({
  providedIn: 'root',
})
export class NewsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllNews(includeInactive: boolean): Observable<NewsResponseDTO[]> {
    if (includeInactive) {
      return this.http.get<NewsResponseDTO[]>(`${this.apiUrl}/api/News`);
    }
    return this.http.get<NewsResponseDTO[]>(
      `${this.apiUrl}/api/News?$filter=IsActive eq true`
    );
  }

  getNewsByAuthor(
    authorId: string,
    skip: number,
    top: number,
    includeInactive: boolean = false
  ): Observable<NewsResponseDTO[]> {
    let filter = `authorId eq '${authorId}'`;
    if (!includeInactive) {
      filter += ' and IsActive eq true';
    }
    return this.http.get<NewsResponseDTO[]>(
      `${this.apiUrl}/api/News?$filter=${filter}&$orderby=PublicationDate desc&$skip=${skip}&$top=${top}`
    );
  }

  getNewsByCategory(
    categoryId: string,
    includeInactive: boolean = false
  ): Observable<NewsResponseDTO[]> {
    let filter = `categoryId eq ${categoryId}`;
    if (!includeInactive) {
      filter += ' and IsActive eq true';
    }
    return this.http.get<NewsResponseDTO[]>(
      `${this.apiUrl}/api/News?$filter=${filter}`
    );
  }

  getTopLatestNews(
    count: number,
    includeInactive: boolean = false
  ): Observable<NewsResponseDTO[]> {
    let filter = '';
    if (!includeInactive) {
      filter = '$filter=IsActive eq true&';
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
    includeInactive: boolean = false
  ): Observable<NewsResponseDTO[]> {
    let filter = `contains(title,'${keyword}')`;
    if (!includeInactive) {
      filter += ' and IsActive eq true';
    }
    return this.http.get<NewsResponseDTO[]>(
      `${this.apiUrl}/api/News?$filter=${filter}`
    );
  }

  getNewsPaged(
    skip: number,
    top: number,
    includeInactive: boolean = false
  ): Observable<NewsResponseDTO[]> {
    let filter = '';
    if (!includeInactive) {
      filter = '$filter=IsActive eq true&';
    }
    return this.http.get<NewsResponseDTO[]>(
      `${this.apiUrl}/api/News?${filter}$orderby=SlotNumber desc,PublicationDate desc&$skip=${skip}&$top=${top}`
    );
  }

  getNewsByCategoryPaged(
    categoryId: string,
    skip: number,
    top: number,
    includeInactive: boolean = false
  ): Observable<NewsResponseDTO[]> {
    let filter = `categoryId eq ${categoryId}`;
    if (!includeInactive) {
      filter += ' and IsActive eq true';
    }
    return this.http.get<NewsResponseDTO[]>(
      `${this.apiUrl}/api/News?$filter=${filter}&$orderby=PublicationDate desc&$skip=${skip}&$top=${top}`
    );
  }

  createNews(news: NewsCreateDTO) {
    // Đảm bảo isActive luôn là false và link luôn rỗng khi tạo mới
    const payload = {
      ...news,
      isActive: false,
      link: '',
      source: 'Người Đưa Tin',
    };
    return this.http.post(`${this.apiUrl}/api/news`, payload);
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
}
