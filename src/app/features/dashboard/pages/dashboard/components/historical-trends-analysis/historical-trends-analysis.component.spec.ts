import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoricalTrendsAnalysisComponent } from './historical-trends-analysis.component';

describe('HistoricalTrendsAnalysisComponent', () => {
  let component: HistoricalTrendsAnalysisComponent;
  let fixture: ComponentFixture<HistoricalTrendsAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoricalTrendsAnalysisComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HistoricalTrendsAnalysisComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
