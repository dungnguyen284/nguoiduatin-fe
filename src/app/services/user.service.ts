import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id: string;
  userName: string;
  email: string;
  fullName: string;
  role: string;
  status: number;
  createdAt: string;
}

export interface UserCreateDto {
  userName: string;
  email: string;
  fullName: string;
  role: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/api/User`;

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<User[]> {
    return this.http
      .get<User[]>(this.apiUrl + "?$filter=Role ne 'Admin'")
      .pipe(catchError(this.handleError));
  }

  getUserById(id: string): Observable<User> {
    return this.http
      .get<User>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  createUser(user: UserCreateDto): Observable<User> {
    return this.http
      .post<User>(this.apiUrl, user)
      .pipe(catchError(this.handleError));
  }

  updateUser(id: string, user: Partial<User>): Observable<any> {
    return this.http
      .put(`${this.apiUrl}/${id}`, user)
      .pipe(catchError(this.handleError));
  }

  updateUserStatus(id: string, status: number): Observable<any> {
    return this.http
      .put(`${this.apiUrl}/${id}/status`, { status })
      .pipe(catchError(this.handleError));
  }

  updateUserRole(id: string, role: string): Observable<any> {
    return this.http
      .put(`${this.apiUrl}/${id}/role`, { role })
      .pipe(catchError(this.handleError));
  }

  deleteUser(id: string): Observable<any> {
    return this.http
      .delete(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('API error:', error);
    return throwError(() => error);
  }

  // Mock data method for testing without backend
}
