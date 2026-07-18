import { Component, effect, inject, input, signal, viewChild } from '@angular/core';
import { DropdownOptionModel } from '../../../../../../core/models/dropdown.model';
import { DatePipe } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { DashboardService } from '../../../../services/api/dashboard.service';
import { ConversionRate, ExchangeRatesResponse } from '../../../../models/dashboard.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-exchange-rates-table',
  imports: [MatTableModule, MatSortModule, MatProgressBarModule, DatePipe],
  templateUrl: './exchange-rates-table.component.html',
  styleUrl: './exchange-rates-table.component.scss',
})
export class ExchangeRatesTableComponent {
  private apiService = inject(DashboardService);

  sort = viewChild(MatSort);

  selectedBaseCode = input<DropdownOptionModel | null>(null);
  conversionRatesData = signal<ConversionRate[]>([]);
  error = signal<string | null>(null);
  isLoading = signal(true);
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

    effect(() => {
      const selected = this.selectedBaseCode();
      if (selected?.value) {
        this.getExchangeRatesData();
      }
    });
  }

    refreshData(): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.conversionRatesData.set([]);
    this.dataSource.data = [];
    this.getExchangeRatesData();
  }


  private getExchangeRatesData(): void {
    this.apiService.getLatestExchangeRates(this.selectedBaseCode()?.value).pipe(
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
