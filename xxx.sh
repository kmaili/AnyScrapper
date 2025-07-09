#!/bin/bash

# --- Configuration ---
FEATURE_NAME="task-creation"
BASE_PATH="src/app/features/$FEATURE_NAME"

echo "==================================================="
echo "Création de la structure et des fichiers Angular pour la fonctionnalité : '$FEATURE_NAME'"
echo "Base Path : $BASE_PATH"
echo "==================================================="

# --- Vérification de l'environnement ---
if [ ! -d "src/app" ]; then
    echo "Erreur: Le script doit être exécuté à la racine d'un projet Angular (là où se trouve 'src/app/')."
    exit 1
fi

# --- Création des dossiers de base de la feature ---
echo "1. Création des dossiers principaux..."
mkdir -p "$BASE_PATH/pages"
mkdir -p "$BASE_PATH/ui"         # Renamed 'components' to 'ui' as requested
mkdir -p "$BASE_PATH/data-access"
mkdir -p "$BASE_PATH/models"
mkdir -p "$BASE_PATH/utils"

echo "Dossiers créés."

# --- Génération des fichiers Angular ---

echo "2. Génération des composants 'pages' (Standalone et Routés)..."
# pages/new-task-page
ng generate component "features/$FEATURE_NAME/pages/new-task-page" --standalone --skip-tests --flat=false
# pages/edit-task-page
ng generate component "features/$FEATURE_NAME/pages/edit-task-page" --standalone --skip-tests --flat=false

echo "3. Génération des composants 'ui' (Standalone - pour tous les blocs visuels non routés de la feature, complexes ou simples)..."
# ui/url-input-form
ng generate component "features/$FEATURE_NAME/ui/url-input-form" --standalone --skip-tests --flat=false
# ui/visual-selector-tool
ng generate component "features/$FEATURE_NAME/ui/visual-selector-tool" --standalone --skip-tests --flat=false
# ui/task-config-form
ng generate component "features/$FEATURE_NAME/ui/task-config-form" --standalone --skip-tests --flat=false
# (Optional: If you later need very simple, dumb UI elements specific to this feature, you'd also put them here, e.g.:
# ng generate component "features/$FEATURE_NAME/ui/task-status-badge" --standalone --skip-tests --flat=false
# )

echo "4. Génération des services 'data-access' (fichiers .service.ts dans leurs sous-dossiers respectifs)..."
# data-access/task/task.service.ts
ng generate service "features/$FEATURE_NAME/data-access/task" --skip-tests --flat=false
# data-access/selector/selector.service.ts
ng generate service "features/$FEATURE_NAME/data-access/selector" --skip-tests --flat=false

echo "Fichiers Angular générés."

# --- Création des fichiers spécifiques (routes et models) ---

echo "5. Création du fichier de routes de la fonctionnalité ($FEATURE_NAME.routes.ts)..."
ROUTES_FILE="$BASE_PATH/$FEATURE_NAME.routes.ts"
cat <<EOL > "$ROUTES_FILE"
import { Routes } from '@angular/router';
import { NewTaskPageComponent } from './pages/new-task-page/new-task-page.component';
import { EditTaskPageComponent } from './pages/edit-task-page/edit-task-page.component';

export const ${FEATURE_NAME^^}_ROUTES: Routes = [
  {
    path: '', // Cette route correspondra à '/$FEATURE_NAME' car elle est chargée paresseusement à cet endroit dans app.routes.ts
    redirectTo: 'new', // Redirige par défaut vers la page de création de tâche
    pathMatch: 'full'
  },
  {
    path: 'new',
    component: NewTaskPageComponent
  },
  {
    path: 'edit/:id', // Exemple de route pour éditer une tâche
    component: EditTaskPageComponent
  }
  // Ajoutez d'autres routes spécifiques à la gestion des tâches ici
];
EOL
echo "$ROUTES_FILE créé."

echo "6. Création du fichier de modèle ($FEATURE_NAME.model.ts) dans le dossier 'models/'..."
MODEL_FILE="$BASE_PATH/models/$FEATURE_NAME.model.ts"
cat <<EOL > "$MODEL_FILE"
export interface Task {
  id: string;
  name: string;
  url: string;
  selectors: { [key: string]: string }; // JSON ou object pour les sélecteurs
  frequency: 'daily' | 'weekly' | 'monthly';
  exportFormat: 'csv' | 'excel' | 'google-sheets';
  status: 'active' | 'paused' | 'completed' | 'failed';
  createdAt: Date;
  lastRunAt?: Date;
  nextRunAt?: Date;
}

// Vous pouvez ajouter d'autres interfaces ou types ici, par exemple pour les résultats de scraping
// export interface ScrapingResult {
//   taskId: string;
//   data: any; // La structure des données dépendra des sélecteurs
//   timestamp: Date;
// }
EOL
echo "$MODEL_FILE créé."

echo "7. Création du fichier .gitkeep dans le dossier utils/ (pour Git, car il sera vide au début)..."
touch "$BASE_PATH/utils/.gitkeep"
echo ".gitkeep créé."

echo "==================================================="
echo "Opération terminée pour la fonctionnalité '$FEATURE_NAME'."
echo "==================================================="
echo ""
echo "Prochaines étapes importantes :"
echo "1.  **Ouvrez vos fichiers de composants** (.ts, .html, .scss) et commencez à ajouter votre logique et votre UI."
echo "2.  **Mettez à jour 'src/app/app.routes.ts'** pour charger paresseusement la nouvelle fonctionnalité :"
echo "    Ajoutez ceci à votre tableau `routes` :"
echo ""
echo "    {"
echo "      path: '$FEATURE_NAME',"
echo "      loadChildren: () => import('./features/$FEATURE_NAME/$FEATURE_NAME.routes').then(m => m.${FEATURE_NAME^^}_ROUTES)"
echo "    },"
echo ""
echo "3.  Pensez à injecter et utiliser les services générés dans vos composants."
echo "4.  Installez les dépendances si nécessaire et lancez 'ng serve'."
