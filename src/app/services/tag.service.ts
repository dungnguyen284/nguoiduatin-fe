import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Tag {
  id: string;
  name: string;
  newsCount: number;
  createdAt: string;
}

export interface TagCreateDto {
  name: string;
}

@Injectable({ providedIn: 'root' })
export class TagService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllTags(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/tag`);
  }

  getTagById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/tag/${id}`);
  }

  createTag(tagData: TagCreateDto): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/tag`, tagData);
  }

  updateTag(id: string, tagData: Partial<Tag>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/api/tag/${id}`, tagData);
  }

  deleteTag(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/api/tag/${id}`);
  }
}
