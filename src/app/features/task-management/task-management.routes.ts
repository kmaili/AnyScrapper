// src/app/features/task-management/task-management.routes.ts
import { Routes } from '@angular/router';
import { TaskListPageComponent } from './pages/task-list-page/task-list-page';
import { authGuard } from '../../core/auth/auth-guard';
import { WorkflowExecutionPage } from './pages/workflow-execution-page/workflow-execution-page';
import { VisualSelectorToolComponent } from '../task-creation/ui/visual-selector-tool/visual-selector-tool';

export const TASK_MANAGEMENT_ROUTES: Routes = [
  {
    path: '', // Cette route correspondra à '/tasks' car elle est chargée paresseusement à cet endroit dans app.routes.ts
    component: TaskListPageComponent, // Le composant de la liste des tâches sera affiché par défaut
    canActivate: [authGuard] // Protège cette route avec l'authentification
  },
  {
    path: ':id', // Route pour voir les détails d'une tâche spécifique, ex: /tasks/123
    component: WorkflowExecutionPage,
  },
  // Ajoutez d'autres routes spécifiques à la gestion des tâches ici
];