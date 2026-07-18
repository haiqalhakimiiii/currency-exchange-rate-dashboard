import { Component, effect, inject, input } from '@angular/core';
import { DropdownOptionModel } from '../../../../../../core/models/dropdown.model';
import { DashboardService } from '../../../../services/api/dashboard.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-historical-trends-analysis',
  imports: [],
  templateUrl: './historical-trends-analysis.component.html',
  styleUrl: './historical-trends-analysis.component.scss',
})
export class HistoricalTrendsAnalysisComponent {
  private apiService = inject(DashboardService);

  selectedBaseCode = input<DropdownOptionModel | null>(null);

  constructor() {
    effect(() => {
      const selected = this.selectedBaseCode();
      if (selected?.value) {
        this.getHistoricalData();
      }
    });
  }

  private getHistoricalData(): void {
    const requests = this.getPastMonthDates().map(date => {
      return this.apiService.getHistoricalExchangeRates(date, this.selectedBaseCode()?.value);
    });

    forkJoin(requests).subscribe(results => {
      // TODO: generate a 3 distinct data to be used in multi line chart to compare based on 3 selected currencies
      console.log(results);
    });
  }

  private getPastMonthDates(): string[] {
    const dates: string[] = [];

    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      const formattedDate = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0')
      ].join('-');

      dates.push(formattedDate);
    }

    return dates;
  }
}
