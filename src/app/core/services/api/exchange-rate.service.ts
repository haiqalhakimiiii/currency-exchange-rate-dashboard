import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { delay, Observable, of } from 'rxjs';
import { SupportedCodesResponse } from '../../models/exchange-rate.model';

@Service()
export class ExchangeRateService {
  private apiUrl: string = environment.apiUrl;

  private http = inject(HttpClient);

  getSupportedCodes(): Observable<SupportedCodesResponse> {
    return this.http.get<SupportedCodesResponse>(`${this.apiUrl}/codes`);
  }
}
