import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private tokenKey = environment.tokenKey;
  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/api/auth/login`, { email, password })
      .pipe(
        tap((response) => {
          if (response && response.data) {
            sessionStorage.setItem(this.tokenKey, response.data);
            this.loggedIn.next(true);
          }
        })
      );
  }

  logout(): void {
    this.http.post(`${this.apiUrl}/api/auth/logout`, {}).subscribe({
      next: () => {
        sessionStorage.removeItem(this.tokenKey);
        this.loggedIn.next(false);
      },
      error: () => {
        // Dù lỗi vẫn xóa token local để đảm bảo đăng xuất
        sessionStorage.removeItem(this.tokenKey);
        this.loggedIn.next(false);
      },
    });
  }

  isLoggedIn(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.tokenKey);
  }

  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return (
        decoded[
          'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
        ] || null
      );
    } catch {
      return null;
    }
  }

  private hasToken(): boolean {
    return !!sessionStorage.getItem(this.tokenKey);
  }
}
