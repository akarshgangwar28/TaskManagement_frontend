import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../../core/models/user.model';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  
  private usersState = signal<User[]>([]);
  public users = computed(() => this.usersState());

  private apiUrl = `${environment.apiUrl}/users`;

  loadUsers(): void {
    // Note: Automatically restricted via Express backend (403 for Employees)
    this.http.get<{success: boolean, users: User[]}>(this.apiUrl).subscribe({
      next: (res) => {
        if (res.success) {
          this.usersState.set(res.users);
        }
      },
      error: (err) => {
        if(err.status !== 403) console.error('Failed to load users data', err);
      }
    });
  }

  assignLead(userId: string, teamLeadId: string | null): Observable<User | null> {
    return this.http.put<{success: boolean, user: User}>(`${this.apiUrl}/${userId}/assignLead`, { teamLeadId }).pipe(
      tap(res => {
        if (res.success && res.user) {
          this.usersState.update(users => users.map(u => u.id === userId ? res.user : u));
        }
      }),
      map(res => res.user || null),
      catchError(err => {
        console.error('Failed to assign team lead', err);
        return of(null);
      })
    );
  }
}
