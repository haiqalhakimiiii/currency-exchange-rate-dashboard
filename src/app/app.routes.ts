import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from './layouts/dashboard-layout/dashboard-layout.component';
import { DashboardComponent } from './features/dashboard/pages/dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
    ],
  },
];
