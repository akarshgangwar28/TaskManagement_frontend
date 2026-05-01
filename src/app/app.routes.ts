import { Routes } from '@angular/router';
import { Layout } from './shared/layout/layout';
import { authGuard } from './core/guards/auth/auth-guard';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      { path: 'login', loadComponent: () => import('./features/auth/login/login').then(m => m.Login) },
      { path: 'register', loadComponent: () => import('./features/auth/register/register').then(m => m.Register) },
      // Tasks routes
      { 
        path: '', 
        canActivate: [authGuard],
        loadComponent: () => import('./features/tasks/task-list/task-list').then(m => m.TaskList) 
      }
    ],
  },
];
