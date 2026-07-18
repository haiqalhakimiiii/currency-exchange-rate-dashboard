import { Component, computed, effect, inject, input, model, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';
import { SingleSelectDropdownComponent } from "../../../../../../core/components/single-select-dropdown/single-select-dropdown.component";
import { DropdownOptionModel } from '../../../../../../core/models/dropdown.model';
import { DashboardService } from '../../../../services/api/dashboard.service';
import { CurrencyConversionResponse } from '../../../../models/dashboard.model';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-currency-conversion-calculator',
  imports: [CommonModule, FormField, SingleSelectDropdownComponent, MatProgressSpinnerModule],
  templateUrl: './currency-conversion-calculator.component.html',
  styleUrl: './currency-conversion-calculator.component.scss',
})
export class CurrencyConversionCalculatorComponent {
  private apiService = inject(DashboardService);

  exchangeRatesTableDropdownOptions = input<DropdownOptionModel[]>([]);

  fromCurrency = model<DropdownOptionModel | null>(null);
  toCurrency = model<DropdownOptionModel | null>(null);

  currencyConversionModel = signal({
    amount: 0,
  });
  currencyConversionResult = signal<CurrencyConversionResponse | null>(null);
  errorMessage = signal<string | null>(null);
  isLoading = signal(false);

  currencyConversionForm = form(this.currencyConversionModel, (fieldPath) => {
    required(fieldPath.amount, { message: 'Amount is required' });
  });

  amountErrorMessage = computed(() => {
    const amount = this.currencyConversionModel().amount;

    if (amount <= 0) {
      return 'Amount must be greater than 0';
    }

    return null;
  });

  isValid = computed(() => this.fromCurrency() !== null
    && this.toCurrency() !== null
    && this.currencyConversionForm().valid()
    && this.amountErrorMessage() === null
    && this.isLoading() === false);

  constructor() {
    effect(() => {
      this.fromCurrency();
      this.toCurrency();
      this.currencyConversionModel().amount;

      this.currencyConversionResult.set(null);
      this.errorMessage.set(null);
    });
  }

  swapCurrencies(): void {
    const fromCurrency = this.fromCurrency();
    const toCurrency = this.toCurrency();

    this.fromCurrency.set(toCurrency);
    this.toCurrency.set(fromCurrency);
  }

  onSubmit(event: Event): void {
    event.preventDefault();

    if (this.isValid() === false) {
      this.currencyConversionResult.set(null);
      return;
    }

    const currencyConversion = this.currencyConversionModel();
    const fromCurrencyValue = this.fromCurrency()?.value ?? '';
    const toCurrencyValue = this.toCurrency()?.value ?? '';

    this.errorMessage.set(null);
    this.isLoading.set(true);
    this.apiService.convertCurrency(fromCurrencyValue, toCurrencyValue, currencyConversion.amount).pipe(
      finalize(() => this.isLoading.set(false))
    )
      .subscribe({
        next: (result) => {
          this.currencyConversionResult.set(result);
        },
        error: () => {
          this.errorMessage.set('Unable to convert currency right now. Please try again.');
        }
      });
  }
}
