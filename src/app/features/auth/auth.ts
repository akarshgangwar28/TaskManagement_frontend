import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User, UserRole } from '../../core/models/user.model';
import { Observable, catchError, of, map } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private http = inject(HttpClient);
  
  currentUser = signal<User | null>(null);

  private apiUrl = `${environment.apiUrl}/auth`;

  constructor() {
    this.loadUserFromStorage();
  }

  login(email: string, password: string): Observable<{ success: boolean; user?: User; error?: string }> {
    return this.http.post<{success: boolean, token?: string, user?: User, error?: string}>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        map(res => {
          if (res.success && res.token && res.user) {
            this.currentUser.set(res.user);
            localStorage.setItem('auth_token', res.token);
            localStorage.setItem('user', JSON.stringify(res.user));
          }
          return res;
        }),
        catchError(err => {
          return of({ success: false, error: err.error?.error || 'Login failed - API might be down' });
        })
      );
  }

  register(username: string, email: string, password: string, role: UserRole): Observable<{ success: boolean; error?: string }> {
    return this.http.post<{success: boolean, msg?: string, error?: string}>(`${this.apiUrl}/register`, { username, email, password, role })
      .pipe(
        map(res => res),
        catchError(err => {
          return of({ success: false, error: err.error?.error || 'Registration failed' });
        })
      );
  }

  logout() {
    this.currentUser.set(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }

  loadUserFromStorage() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        this.currentUser.set(user);
      } catch (e) {
        this.logout();
      }
    }
  }
}
