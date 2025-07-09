// src/app/features/task-management/task-management.routes.ts
import { Routes } from '@angular/router';
import { TaskListPageComponent } from './pages/task-list-page/task-list-page';
import { TaskDetailsPageComponent } from './pages/task-details-page/task-details-page';

export const TASK_MANAGEMENT_ROUTES: Routes = [
  {
    path: '', // Cette route correspondra à '/tasks' car elle est chargée paresseusement à cet endroit dans app.routes.ts
    component: TaskListPageComponent // Le composant de la liste des tâches sera affiché par défaut
  },
  {
    path: ':id', // Route pour voir les détails d'une tâche spécifique, ex: /tasks/123
    component: TaskDetailsPageComponent
  },
  // Ajoutez d'autres routes spécifiques à la gestion des tâches ici
];