import { Component, effect, inject, model, OnInit, signal } from '@angular/core';
import { DashboardService } from '../../services/api/dashboard.service';
import { forkJoin } from 'rxjs';
import { SingleSelectDropdownComponent } from '../../../../core/components/single-select-dropdown/single-select-dropdown.component';
import { DropdownOptionModel } from '../../../../core/models/dropdown.model';
import { ExchangeRateService } from '../../../../core/services/api/exchange-rate.service';
import { ExchangeRatesTableComponent } from "./components/exchange-rates-table/exchange-rates-table.component";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SingleSelectDropdownComponent, ExchangeRatesTableComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private exchangeRateService = inject(ExchangeRateService);

  exchangeRatesTableDropdownOptions = signal<DropdownOptionModel[]>([]);
  selectedBaseCode = model<DropdownOptionModel | null>(null);


  constructor() {
    // Reactively load exchange rates when selected currency changes
    effect(() => {
      const selected = this.selectedBaseCode();
      if (selected?.value) {
        this.getHistoricalData();
      }
    });
  }

  ngOnInit(): void {
    this.getDropdownOptions();
  }

  getDropdownOptions(): void {
    this.exchangeRateService.getSupportedCodes().subscribe((response) => {
      const options = response.supported_codes.map(([code, description]) => ({
        label: `${code} - ${description}`,
        value: code,
      }));
      this.exchangeRatesTableDropdownOptions.set(options);

      const myrOption = options.find(option => option.value === 'MYR');
      if (myrOption) {
        this.selectedBaseCode.set(myrOption);
      }
    });
  }

  private getHistoricalData(): void {
    const requests = this.getPastMonthDates().map(date => {
      return this.dashboardService.getHistoricalExchangeRates(date, this.selectedBaseCode()?.value);
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
