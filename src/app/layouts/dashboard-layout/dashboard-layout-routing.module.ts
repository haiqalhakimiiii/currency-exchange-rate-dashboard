import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { routes } from "../../app.routes";

const routers: Routes = [

]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})

export class DashboardLayoutRoutingModule { }
