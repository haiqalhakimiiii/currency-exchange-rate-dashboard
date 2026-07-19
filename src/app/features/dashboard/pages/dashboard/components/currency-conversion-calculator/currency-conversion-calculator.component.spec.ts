import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { CurrencyConversionCalculatorComponent } from './currency-conversion-calculator.component';
import { DashboardService } from '../../../../services/api/dashboard.service';
import { DropdownOptionModel } from '../../../../../../core/models/dropdown.model';

describe('CurrencyConversionCalculatorComponent', () => {
  let component: CurrencyConversionCalculatorComponent;
  let fixture: ComponentFixture<CurrencyConversionCalculatorComponent>;
  let dashboardServiceStub: Pick<DashboardService, 'convertCurrency'>;
  let convertCurrencyImpl: DashboardService['convertCurrency'];

  const options: DropdownOptionModel[] = [
    { label: 'USD - United States Dollar', value: 'USD' },
    { label: 'EUR - Euro', value: 'EUR' },
  ];

  beforeEach(async () => {
    convertCurrencyImpl = () => {
      throw new Error('Not implemented in this test');
    };

    dashboardServiceStub = {
      convertCurrency: (...args) => convertCurrencyImpl(...args),
    };

    await TestBed.configureTestingModule({
      imports: [CurrencyConversionCalculatorComponent],
      providers: [{ provide: DashboardService, useValue: dashboardServiceStub }],
    }).compileComponents();

    fixture = TestBed.createComponent(CurrencyConversionCalculatorComponent);
    component = fixture.componentInstance;

    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('exchangeRatesTableDropdownOptions', options);
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should swap selected currencies', () => {
    component.fromCurrency.set(options[0]);
    component.toCurrency.set(options[1]);

    component.swapCurrencies();

    expect(component.fromCurrency()).toEqual(options[1]);
    expect(component.toCurrency()).toEqual(options[0]);
  });

  it('should not submit when form state is invalid', () => {
    let preventDefaultCalls = 0;
    const event = { preventDefault: () => { preventDefaultCalls += 1; } } as unknown as Event;

    component.onSubmit(event);

    expect(preventDefaultCalls).toBe(1);
    expect(component.currencyConversionResult()).toBeNull();
  });

  it('should convert currency and set result when submit succeeds', () => {
    let convertCalls: Array<[string | number, string | number, number]> = [];
    convertCurrencyImpl = (from, to, amount) => {
      convertCalls.push([from, to, amount]);
      return of({
        conversion_rate: 0.92,
        conversion_result: 9.2,
      });
    };

    component.fromCurrency.set(options[0]);
    component.toCurrency.set(options[1]);
    component.currencyConversionModel.set({ amount: 10 });

    const event = { preventDefault: () => { } } as unknown as Event;

    component.onSubmit(event);

    expect(convertCalls).toEqual([['USD', 'EUR', 10]]);
    expect(component.errorMessage()).toBeNull();
    expect(component.currencyConversionResult()).toEqual({
      conversion_rate: 0.92,
      conversion_result: 9.2,
    });
    expect(component.isLoading()).toBe(false);
  });

  it('should set an error message when conversion fails', () => {
    convertCurrencyImpl = () => throwError(() => new Error('request failed'));

    component.fromCurrency.set(options[0]);
    component.toCurrency.set(options[1]);
    component.currencyConversionModel.set({ amount: 10 });

    const event = { preventDefault: () => { } } as unknown as Event;

    component.onSubmit(event);

    expect(component.currencyConversionResult()).toBeNull();
    expect(component.errorMessage()).toBe('Unable to convert currency right now. Please try again.');
    expect(component.isLoading()).toBe(false);
  });
});
