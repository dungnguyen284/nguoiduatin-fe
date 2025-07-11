import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { NewsResponseDTO } from '../models/news-response.model';

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
}
