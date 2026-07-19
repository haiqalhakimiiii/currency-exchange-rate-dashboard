import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardService } from '../../../../services/api/dashboard.service';

import { HistoricalTrendsAnalysisComponent } from './historical-trends-analysis.component';

describe('HistoricalTrendsAnalysisComponent', () => {
  let component: HistoricalTrendsAnalysisComponent;
  let fixture: ComponentFixture<HistoricalTrendsAnalysisComponent>;
  let dashboardServiceStub: Pick<DashboardService, 'getHistoricalExchangeRates'>;

  beforeEach(async () => {
    dashboardServiceStub = {
      getHistoricalExchangeRates: () => {
        throw new Error('Not implemented in this test');
      },
    };

    await TestBed.configureTestingModule({
      imports: [HistoricalTrendsAnalysisComponent],
      providers: [{ provide: DashboardService, useValue: dashboardServiceStub }],
    }).compileComponents();

    fixture = TestBed.createComponent(HistoricalTrendsAnalysisComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set aggregation mode', () => {
    component.setAggregationMode('weekly');
    expect(component.aggregationMode()).toBe('weekly');

    component.setAggregationMode('monthly');
    expect(component.aggregationMode()).toBe('monthly');
  });

  it('should report selected currencies state', () => {
    expect(component.hasSelectedCurrencies()).toBe(false);

    component.firstSelectedCurrencyToCompare.set({ label: 'USD - United States Dollar', value: 'USD' });
    expect(component.hasSelectedCurrencies()).toBe(true);
  });

  it('should aggregate currency rates by averaging selected indexes', () => {
    const historicalData = [
      { conversion_rates: { USD: 1.2 } },
      { conversion_rates: { USD: 1.4 } },
      { conversion_rates: { USD: 1.6 } },
    ] as any;

    const aggregated = (component as any).getAggregatedCurrencyRate(historicalData, 'USD', [0, 2]);
    expect(aggregated).toBe(1.4);
  });

  it('should build weekly aggregation buckets in seven-day groups', () => {
    const dates = ['2026-07-01', '2026-07-02', '2026-07-03', '2026-07-04', '2026-07-05', '2026-07-06', '2026-07-07', '2026-07-08'];

    const buckets = (component as any).getAggregationBuckets(dates, 'weekly');
    expect(buckets.length).toBe(2);
    expect(buckets[0].indexes).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(buckets[1].indexes).toEqual([7]);
  });
});
