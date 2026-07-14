import { Routes } from '@angular/router';
import { DashboardLayoutModule } from './layouts/dashboard-layout/dashboard-layout.module';

export const routes: Routes = [
  {
    path: '',
    component: DashboardLayoutModule,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./layouts/dashboard-layout/dashboard-layout.module').then((m) => m.DashboardLayoutModule),
      },
    ],
  },
];
