import { Component, inject, model, OnInit, signal } from '@angular/core';
import { SingleSelectDropdownComponent } from '../../../../core/components/single-select-dropdown/single-select-dropdown.component';
import { DropdownOptionModel } from '../../../../core/models/dropdown.model';
import { ExchangeRateService } from '../../../../core/services/api/exchange-rate.service';
import { ExchangeRatesTableComponent } from "./components/exchange-rates-table/exchange-rates-table.component";
import { HistoricalTrendsAnalysisComponent } from "./components/historical-trends-analysis/historical-trends-analysis.component";
import { CurrencyConversionCalculatorComponent } from "./components/currency-conversion-calculator/currency-conversion-calculator.component";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SingleSelectDropdownComponent, ExchangeRatesTableComponent, HistoricalTrendsAnalysisComponent, CurrencyConversionCalculatorComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private exchangeRateService = inject(ExchangeRateService);

  exchangeRatesTableDropdownOptions = signal<DropdownOptionModel[]>([]);
  selectedBaseCode = model<DropdownOptionModel | null>(null);

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
}
