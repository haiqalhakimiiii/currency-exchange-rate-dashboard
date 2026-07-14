import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: '',
    loadChildren: () =>
      import('./layouts/dashboard-layout/dashboard-layout.module').then((m) => m.DashboardLayoutModule),
  },
];
