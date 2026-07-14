import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { DashboardLayoutComponent } from "./dashboard-layout.component";
import { DASHBOARD_ROUTES } from "../../features/dashboard/dashboard-routing.module";

const routers: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      ...DASHBOARD_ROUTES,
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routers)],
  exports: [RouterModule],
})
export class DashboardLayoutRoutingModule { }
