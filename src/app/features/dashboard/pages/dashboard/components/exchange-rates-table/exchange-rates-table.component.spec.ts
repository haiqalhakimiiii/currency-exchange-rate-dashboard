import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardService } from '../../../../services/api/dashboard.service';

import { ExchangeRatesTableComponent } from './exchange-rates-table.component';

describe('ExchangeRatesTableComponent', () => {
  let component: ExchangeRatesTableComponent;
  let fixture: ComponentFixture<ExchangeRatesTableComponent>;
  let dashboardServiceStub: Pick<DashboardService, 'getLatestExchangeRates'>;

  beforeEach(async () => {
    dashboardServiceStub = {
      getLatestExchangeRates: () => {
        throw new Error('Not implemented in this test');
      },
    };

    await TestBed.configureTestingModule({
      imports: [ExchangeRatesTableComponent],
      providers: [{ provide: DashboardService, useValue: dashboardServiceStub }],
    }).compileComponents();

    fixture = TestBed.createComponent(ExchangeRatesTableComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should map conversion rates into table rows', () => {
    (component as unknown as { mapData: (rates: Record<string, number>, baseCode: string) => void }).mapData({ USD: 0.23, EUR: 0.21 }, 'MYR');

    expect(component.conversionRatesData()).toEqual([
      { base: 'MYR', currency: 'USD', rate: 0.23 },
      { base: 'MYR', currency: 'EUR', rate: 0.21 },
    ]);
    expect((component.dataSource.data as unknown[]).length).toBe(2);
  });

  it('should trigger manual refresh only when an active base code exists', () => {
    const refreshStream = (component as unknown as { manualRefresh$: { subscribe: (cb: () => void) => { unsubscribe: () => void } } }).manualRefresh$;
    let refreshCount = 0;
    const subscription = refreshStream.subscribe(() => {
      refreshCount += 1;
    });

    component.refreshData();
    expect(refreshCount).toBe(0);

    (component as unknown as { activeBaseCode: string | null }).activeBaseCode = 'USD';
    component.refreshData();
    expect(refreshCount).toBe(1);

    subscription.unsubscribe();
  });

  it('should fallback to default polling interval for invalid next update date', () => {
    const pollInterval = (component as unknown as { computeNextPollMs: (date: string) => number }).computeNextPollMs('invalid-date');
    expect(pollInterval).toBe((component as unknown as { FALLBACK_POLL_MS: number }).FALLBACK_POLL_MS);
  });

  it('should use exponential backoff capped at max backoff on repeated errors', () => {
    (component as unknown as { errorStreak: number }).errorStreak = 1;
    expect((component as unknown as { computeErrorBackoffMs: () => number }).computeErrorBackoffMs()).toBe(10000);

    (component as unknown as { errorStreak: number }).errorStreak = 10;
    expect((component as unknown as { computeErrorBackoffMs: () => number }).computeErrorBackoffMs()).toBe((component as unknown as { MAX_ERROR_BACKOFF_MS: number }).MAX_ERROR_BACKOFF_MS);
  });
});
