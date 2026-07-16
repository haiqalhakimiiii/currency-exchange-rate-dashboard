import { Component, effect, inject, OnInit, signal, viewChild } from '@angular/core';
import { ConversionRate, ExchangeRatesResponse } from '../../models/dashboard.model';
import { DashboardService } from '../../services/api/dashboard.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DatePipe } from '@angular/common';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatTableModule, MatSortModule, MatProgressBarModule, DatePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private apiService = inject(DashboardService);
  sort = viewChild(MatSort);

  conversionRatesData = signal<ConversionRate[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);
  latestExchangeRatesData = signal<ExchangeRatesResponse | null>(null);

  dataSource = new MatTableDataSource<ConversionRate>();
  displayedColumns: string[] = ['currency', 'rate', 'base'];

  constructor() {
    effect(() => {
      const sort = this.sort();
      if (sort) {
        this.dataSource.sort = sort;
      }
    });
  }

  ngOnInit(): void {
    this.getExchangeRatesData();
  }

  getExchangeRatesData(): void {
    this.apiService.getLatestExchangeRates().pipe(
      finalize(() => {
        this.isLoading.set(false);
      })
    ).subscribe({
      next: (result) => {
        this.latestExchangeRatesData.set(result);
        this.mapData(result.conversion_rates, result.base_code);
      },
      error: () => {
        this.error.set('Failed to load exchange rates. Please try again.');
      },
    });
  }

  refreshData(): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.conversionRatesData.set([]);
    this.dataSource.data = [];
    this.getExchangeRatesData();
  }

  private mapData(conversionRates: Record<string, number>, baseCode: string): void {
    const mappedRates = Object.entries(conversionRates).map(([currency, rate]) => ({
      base: baseCode,
      currency,
      rate,
    }));

    this.conversionRatesData.set(mappedRates);
    this.dataSource.data = mappedRates;
  }
}
