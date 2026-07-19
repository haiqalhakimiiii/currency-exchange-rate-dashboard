import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { ExchangeRateService } from './exchange-rate.service';
import { SupportedCodesResponse } from '../../models/exchange-rate.model';

describe('ExchangeRateService', () => {
  let service: ExchangeRateService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ExchangeRateService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ExchangeRateService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch supported currency codes', () => {
    const mockedResponse: SupportedCodesResponse = {
      result: 'success',
      documentation: 'documentation-url',
      terms_of_use: 'terms-url',
      supported_codes: [
        ['MYR', 'Malaysian Ringgit'],
        ['USD', 'United States Dollar'],
      ],
    };

    service.getSupportedCodes().subscribe((response) => {
      expect(response).toEqual(mockedResponse);
    });

    const request = httpMock.expectOne((req) => req.url.endsWith('/codes'));
    expect(request.request.method).toBe('GET');
    request.flush(mockedResponse);
  });
});
