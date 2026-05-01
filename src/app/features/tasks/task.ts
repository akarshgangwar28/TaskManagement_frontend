import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Task, TaskStatus } from '../../core/models/task.model';
import { Auth } from '../auth/auth';
import { Observable, catchError, of, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private http = inject(HttpClient);
  private auth = inject(Auth);

  private tasksState = signal<Task[]>([]);
  public tasks = computed(() => this.tasksState());

  private apiUrl = `${environment.apiUrl}/tasks`;

  loadTasks(): void {
    const user = this.auth.currentUser();
    if (!user) return;

    this.http.get<{success: boolean, tasks: Task[]}>(this.apiUrl).subscribe({
      next: (res) => {
        if (res.success) {
          this.tasksState.set(res.tasks);
        }
      },
      error: (err) => console.error('Failed to load tasks', err)
    });
  }

  createTask(taskData: Partial<Task>): Observable<Task | null> {
    return this.http.post<{success: boolean, task: Task}>(this.apiUrl, taskData).pipe(
      tap(res => {
        if (res.success && res.task) {
          this.tasksState.update(tasks => [res.task, ...tasks]);
        }
      }),
      map(res => res.task || null),
      catchError(err => {
        console.error('Failed to create task', err);
        return of(null);
      })
    );
  }

  updateTask(id: string, updates: Partial<Task>): Observable<Task | null> {
    return this.http.put<{success: boolean, task: Task}>(`${this.apiUrl}/${id}`, updates).pipe(
      tap(res => {
        if (res.success && res.task) {
          this.tasksState.update(tasks => tasks.map(t => t.id === id ? res.task : t));
        }
      }),
      map(res => res.task || null),
      catchError(err => {
        console.error('Failed to update task', err);
        return of(null);
      })
    );
  }

  deleteTask(id: string): Observable<boolean> {
    return this.http.delete<{success: boolean}>(`${this.apiUrl}/${id}`).pipe(
      tap(res => {
        if (res.success) {
          this.tasksState.update(tasks => tasks.filter(t => t.id !== id));
        }
      }),
      map(res => res.success),
      catchError(err => {
        console.error('Failed to delete task', err);
        return of(false);
      })
    );
  }
}
