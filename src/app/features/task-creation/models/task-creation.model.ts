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
