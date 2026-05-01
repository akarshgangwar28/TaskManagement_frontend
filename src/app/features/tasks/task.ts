import { Injectable, signal, computed, inject } from '@angular/core';
import { Task, TaskStatus } from '../../core/models/task.model';
import { UserRole } from '../../core/models/user.model';
import { Auth } from '../auth/auth';
import { delay, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private auth = inject(Auth);

  // In-memory mock data
  private mockTasks: Task[] = [];
  
  // State
  private tasksState = signal<Task[]>([]);
  public tasks = computed(() => this.tasksState());

  constructor() {
    this.seedMockData();
  }

  private seedMockData() {
    this.mockTasks = [
      {
        id: '1',
        title: 'Initial Dashboard Setup',
        description: 'Set up the base layout and routing.',
        status: TaskStatus.Completed,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: '1',
        assignedTo: '3'
      },
      {
        id: '2',
        title: 'Implement Task API',
        description: 'Create the Express backend with MongoDB schema.',
        status: TaskStatus.Pending,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: '2',
        assignedTo: '3'
      }
    ];
    this.tasksState.set(this.mockTasks);
  }

  loadTasks(): void {
    const user = this.auth.currentUser();
    if (!user) return;

    let filteredTasks = [...this.mockTasks];

    // Role-based visibility logic
    if (user.role === UserRole.Employee) {
      // Employees see only tasks they created or are assigned to them
      filteredTasks = filteredTasks.filter(t => t.createdBy === user.id || t.assignedTo === user.id);
    } else if (user.role === UserRole.TeamLead) {
      // Team Leads see everything (mock assumes all belong to their team)
    } else if (user.role === UserRole.Manager) {
      // Managers see all
    }

    this.tasksState.set(filteredTasks);
  }

  createTask(taskData: Partial<Task>): Observable<Task> {
    const user = this.auth.currentUser();
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: taskData.title || '',
      description: taskData.description || '',
      status: taskData.status || TaskStatus.Pending,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: user?.id || 'unknown',
      assignedTo: taskData.assignedTo || user?.id // By default assign to self if employee
    };

    this.mockTasks = [...this.mockTasks, newTask];
    this.loadTasks(); // reload visibility
    return of(newTask).pipe(delay(300));
  }

  updateTask(id: string, updates: Partial<Task>): Observable<Task | null> {
    const taskIndex = this.mockTasks.findIndex(t => t.id === id);
    if (taskIndex > -1) {
      this.mockTasks[taskIndex] = { 
        ...this.mockTasks[taskIndex], 
        ...updates,
        updatedAt: new Date()
      };
      this.loadTasks();
      return of(this.mockTasks[taskIndex]).pipe(delay(300));
    }
    return of(null).pipe(delay(300));
  }

  deleteTask(id: string): Observable<boolean> {
    this.mockTasks = this.mockTasks.filter(t => t.id !== id);
    this.loadTasks();
    return of(true).pipe(delay(300));
  }
}
