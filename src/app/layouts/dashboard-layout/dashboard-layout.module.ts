import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayoutComponent } from './dashboard-layout.component';
import { DashboardLayoutRoutingModule } from './dashboard-layout-routing.module';

@NgModule({
  declarations: [DashboardLayoutComponent],
  imports: [CommonModule, DashboardLayoutRoutingModule],
})
export class DashboardLayoutModule { }
