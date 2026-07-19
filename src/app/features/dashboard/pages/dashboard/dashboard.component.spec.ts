import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { ExchangeRateService } from '../../../../core/services/api/exchange-rate.service';
import { SupportedCodesResponse } from '../../../../core/models/exchange-rate.model';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let getSupportedCodesCalls: number;

  const mockedSupportedCodes: SupportedCodesResponse = {
    result: 'success',
    documentation: 'documentation-url',
    terms_of_use: 'terms-url',
    supported_codes: [
      ['USD', 'United States Dollar'],
      ['MYR', 'Malaysian Ringgit'],
      ['EUR', 'Euro'],
    ],
  };

  beforeEach(async () => {
    getSupportedCodesCalls = 0;
    const exchangeRateServiceStub: Pick<ExchangeRateService, 'getSupportedCodes'> = {
      getSupportedCodes: () => {
        getSupportedCodesCalls += 1;
        return of(mockedSupportedCodes);
      },
    };

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [{ provide: ExchangeRateService, useValue: exchangeRateServiceStub }],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch supported codes on initialization', () => {
    expect(getSupportedCodesCalls).toBe(1);
  });

  it('should map supported codes into dropdown options', () => {
    expect(component.exchangeRatesTableDropdownOptions()).toEqual([
      { label: 'USD - United States Dollar', value: 'USD' },
      { label: 'MYR - Malaysian Ringgit', value: 'MYR' },
      { label: 'EUR - Euro', value: 'EUR' },
    ]);
  });

  it('should default selected base code to MYR when available', () => {
    expect(component.selectedBaseCode()).toEqual({
      label: 'MYR - Malaysian Ringgit',
      value: 'MYR',
    });
  });

});
