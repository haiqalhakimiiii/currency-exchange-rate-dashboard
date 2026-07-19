import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { DashboardService } from './dashboard.service';
import { CurrencyConversionResponse, ExchangeRatesResponse, HistoryConversionRatesResponse } from '../../models/dashboard.model';

describe('DashboardService', () => {
  let service: DashboardService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DashboardService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(DashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch latest exchange rates with MYR by default', () => {
    const mockedResponse: ExchangeRatesResponse = {
      base_code: 'MYR',
      time_last_update_utc: 'Sun, 19 Jul 2026 00:00:01 +0000',
      time_next_update_utc: 'Sun, 19 Jul 2026 01:00:01 +0000',
      conversion_rates: { USD: 0.23, EUR: 0.21 },
    };

    service.getLatestExchangeRates().subscribe((response) => {
      expect(response).toEqual(mockedResponse);
    });

    const request = httpMock.expectOne((req) => req.url.endsWith('/latest/MYR'));
    expect(request.request.method).toBe('GET');
    request.flush(mockedResponse);
  });

  it('should fetch latest exchange rates for a custom base code', () => {
    service.getLatestExchangeRates('USD').subscribe();

    const request = httpMock.expectOne((req) => req.url.endsWith('/latest/USD'));
    expect(request.request.method).toBe('GET');
    request.flush({} as ExchangeRatesResponse);
  });

  it('should fetch historical exchange rates using date parts in the endpoint', () => {
    const mockedResponse: HistoryConversionRatesResponse = {
      base_code: 'USD',
      year: 2026,
      month: 7,
      day: 19,
      conversion_rates: { EUR: 0.91 },
    };

    service.getHistoricalExchangeRates('2026-07-19', 'USD').subscribe((response) => {
      expect(response).toEqual(mockedResponse);
    });

    const request = httpMock.expectOne((req) => req.url.endsWith('/history/USD/2026/07/19'));
    expect(request.request.method).toBe('GET');
    request.flush(mockedResponse);
  });

  it('should convert currency amount between two codes', () => {
    const mockedResponse: CurrencyConversionResponse = {
      conversion_rate: 0.92,
      conversion_result: 9.2,
    };

    service.convertCurrency('USD', 'EUR', 10).subscribe((response) => {
      expect(response).toEqual(mockedResponse);
    });

    const request = httpMock.expectOne((req) => req.url.endsWith('/pair/USD/EUR/10'));
    expect(request.request.method).toBe('GET');
    request.flush(mockedResponse);
  });
});
