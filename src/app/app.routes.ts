// src/app/app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '', // Lorsque l'URL est '/tasks', cette fonctionnalité sera chargée paresseusement
    loadChildren: () => import('./features/task-management/task-management.routes').then(m => m.TASK_MANAGEMENT_ROUTES),
  },
  {
    path: 'task-creation',
    loadChildren: () => import('./features/task-creation/task-creation.routes').then(m => m.TASK_CREATION_ROUTES)
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'workflow',
    loadChildren: () => import('./features/task-management/task-management.routes').then(m => m.TASK_MANAGEMENT_ROUTES)
  }
];