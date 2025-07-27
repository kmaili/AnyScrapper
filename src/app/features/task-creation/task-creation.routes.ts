import { Routes } from '@angular/router';
import { NewTaskPageComponent } from './pages/new-task-page/new-workflow-page';
import { VisualSelectorToolComponent } from './ui/visual-selector-tool/visual-selector-tool';
import { EditTaskPage } from './pages/edit-task-page/edit-task-page';

export const TASK_CREATION_ROUTES: Routes = [
  {
    path: '', // Cette route correspondra à '/task-creation' car elle est chargée paresseusement à cet endroit dans app.routes.ts
    redirectTo: 'new', // Redirige par défaut vers la page de création de tâche
    pathMatch: 'full'
  },
  {
    path: 'new',
    component: NewTaskPageComponent
  },
  {
    path: 'edit/:id', // Exemple de route pour éditer une tâche
    component: EditTaskPage
  }
  // Ajoutez d'autres routes spécifiques à la gestion des tâches ici
];
