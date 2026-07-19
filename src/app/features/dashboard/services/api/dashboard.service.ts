import { inject, Service } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { Observable } from 'rxjs';
import { CurrencyConversionResponse, ExchangeRatesResponse, HistoryConversionRatesResponse } from '../../models/dashboard.model';
import { HttpClient } from '@angular/common/http';

@Service()
export class DashboardService {
  private apiUrl: string = environment.apiUrl;

  private http = inject(HttpClient);

  getLatestExchangeRates(baseCode?: string | number): Observable<ExchangeRatesResponse> {
    return this.http.get<ExchangeRatesResponse>(`${this.apiUrl}/latest/${baseCode ?? "MYR"}`);
  }

  getHistoricalExchangeRates(date: string, baseCode?: string | number): Observable<HistoryConversionRatesResponse> {
    const [year, month, day] = date.split('-');
    return this.http.get<HistoryConversionRatesResponse>(`${this.apiUrl}/history/${baseCode ?? "MYR"}/${year}/${month}/${day}`);
  }

  convertCurrency(from: string | number, to: string | number, amount: number): Observable<CurrencyConversionResponse> {
    return this.http.get<CurrencyConversionResponse>(`${this.apiUrl}/pair/${from}/${to}/${amount}`);
  }
}
