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

  getAllNews(): Observable<NewsResponseDTO[]> {
    return this.http.get<NewsResponseDTO[]>(`${this.apiUrl}/api/News`);
  }

  getNewsByCategory(categoryId: string): Observable<NewsResponseDTO[]> {
    return this.http.get<NewsResponseDTO[]>(
      `${this.apiUrl}/api/News?$filter=categoryId eq ${categoryId}`
    );
  }

  getTopLatestNews(count: number): Observable<NewsResponseDTO[]> {
    return this.http.get<NewsResponseDTO[]>(
      `${this.apiUrl}/api/News?$orderby=PublicationDate desc&$top=${count}`
    );
  }

  getNewsById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/News/${id}`);
  }

  searchNewsByTitle(keyword: string): Observable<NewsResponseDTO[]> {
    return this.http.get<NewsResponseDTO[]>(
      `${this.apiUrl}/api/News?$filter=contains(title,'${keyword}')`
    );
  }

  getNewsPaged(skip: number, top: number): Observable<NewsResponseDTO[]> {
    return this.http.get<NewsResponseDTO[]>(
      `${this.apiUrl}/api/News?$orderby=SlotNumber desc,PublicationDate desc&$skip=${skip}&$top=${top}`
    );
  }

  getNewsByCategoryPaged(
    categoryId: string,
    skip: number,
    top: number
  ): Observable<NewsResponseDTO[]> {
    return this.http.get<NewsResponseDTO[]>(
      `${this.apiUrl}/api/News?$filter=categoryId eq ${categoryId}&$orderby=PublicationDate desc&$skip=${skip}&$top=${top}`
    );
  }

  createNews(news: NewsCreateDTO) {
    // Đảm bảo isActive luôn là false và link luôn rỗng khi tạo mới
    const payload = {
      ...news,
      isActive: false,
      link: '',
    };
    return this.http.post(`${this.apiUrl}/api/news`, payload);
  }

  getPresignedUrl(fileName: string, fileType: string) {
    return this.http.get<{ url: string; key: string }>(
      `${environment.presignApiUrl}?fileName=${encodeURIComponent(
        fileName
      )}&fileType=${encodeURIComponent(fileType)}`
    );
  }

  uploadFileToS3(presignedUrl: string, file: File) {
    return this.http.put(presignedUrl, file, {
      headers: { 'Content-Type': file.type },
      reportProgress: true,
      observe: 'events',
    });
  }
}
