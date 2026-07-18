import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, computed, effect, inject, input, model, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartDataset, registerables } from 'chart.js';
import { DropdownOptionModel } from '../../../../../../core/models/dropdown.model';
import { HistoryConversionRatesResponse } from '../../../../models/dashboard.model';
import { DashboardService } from '../../../../services/api/dashboard.service';
import { forkJoin, Subscription } from 'rxjs';
import { SingleSelectDropdownComponent } from '../../../../../../core/components/single-select-dropdown/single-select-dropdown.component';

Chart.register(...registerables);

type AggregationMode = 'daily' | 'weekly' | 'monthly';

@Component({
  selector: 'app-historical-trends-analysis',
  imports: [SingleSelectDropdownComponent, CommonModule],
  templateUrl: './historical-trends-analysis.component.html',
  styleUrl: './historical-trends-analysis.component.scss',
})
export class HistoricalTrendsAnalysisComponent implements AfterViewInit, OnDestroy {
  @ViewChild('exchangeRateChart') chartCanvasRef!: ElementRef<HTMLCanvasElement>;

  private apiService = inject(DashboardService);
  private chart: Chart<'line', (number | null)[], string> | null = null;
  private historicalData = signal<HistoryConversionRatesResponse[]>([]);
  private dates = signal<string[]>([]);
  private isViewReady = signal(false);
  private historicalDataSub?: Subscription;

  exchangeRatesTableDropdownOptions = input<DropdownOptionModel[]>([]);
  selectedBaseCode = input<DropdownOptionModel | null>(null);
  aggregationMode = signal<AggregationMode>('daily');

  firstSelectedCurrencyToCompare = model<DropdownOptionModel | null>(null);
  secondSelectedCurrencyToCompare = model<DropdownOptionModel | null>(null);
  thirdSelectedCurrencyToCompare = model<DropdownOptionModel | null>(null);

  hasSelectedCurrencies = computed(() => !!(
      this.firstSelectedCurrencyToCompare() ||
      this.secondSelectedCurrencyToCompare() ||
      this.thirdSelectedCurrencyToCompare()
    ));

  constructor() {
    effect(() => {
      const selected = this.selectedBaseCode();
      if (selected?.value) {
        this.getHistoricalData();
        return;
      }

      this.historicalData.set([]);
      this.dates.set([]);
      this.updateChart();
    });

    effect(() => {
      if (!this.isViewReady()) return;

      this.historicalData();
      this.firstSelectedCurrencyToCompare();
      this.secondSelectedCurrencyToCompare();
      this.thirdSelectedCurrencyToCompare();
      this.aggregationMode();
      this.updateChart();
    });
  }

  setAggregationMode(mode: AggregationMode): void {
    this.aggregationMode.set(mode);
  }

  ngAfterViewInit(): void {
    if (this.chartCanvasRef) {
      this.initializeChart();
      this.isViewReady.set(true);
    }
  }

  ngOnDestroy(): void {
    this.historicalDataSub?.unsubscribe();
    this.chart?.destroy();
    this.chart = null;
  }

  private getHistoricalData(): void {
    const pastMonthDates = this.getPastMonthDates();
    this.dates.set(pastMonthDates);

    const requests = pastMonthDates.map(date => {
      return this.apiService.getHistoricalExchangeRates(date, this.selectedBaseCode()?.value);
    });

    this.historicalDataSub?.unsubscribe();
    this.historicalDataSub = forkJoin(requests).subscribe({
      next: results => {
        this.historicalData.set(results);
      },
      error: () => {
        this.historicalData.set([]);
        this.updateChart();
      }
    });
  }

  private initializeChart(): void {
    if (!this.chartCanvasRef) return;

    const ctx = this.chartCanvasRef.nativeElement.getContext('2d');
    if (ctx && !this.chart) {
      this.chart = new Chart<'line', (number | null)[], string>(ctx, {
        type: 'line',
        data: {
          labels: [],
          datasets: []
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false,
          },
          plugins: {
            legend: {
              display: true,
              position: 'top',
            },
            title: {
              display: true,
              text: 'Exchange Rate Trends (Last 30 Days)',
            }
          },
          scales: {
            y: {
              beginAtZero: false,
              grid: {
                drawOnChartArea: false,
              },
              title: {
                display: true,
                text: 'Exchange Rate'
              }
            },
            x: {
              grid: {
                drawOnChartArea: false,
              },
              ticks: {
                maxRotation: 45,
                minRotation: 45,
              },
              title: {
                display: true,
                text: 'Date'
              }
            }
          }
        }
      });
    }
  }

  private updateChart(): void {
    if (!this.chart && this.chartCanvasRef) {
      this.initializeChart();
    }

    const historicalData = this.historicalData();
    if (!this.chart) return;

    if (historicalData.length === 0) {
      this.chart.data.labels = this.dates();
      this.chart.data.datasets = [];
      this.chart.update();
      return;
    }

    const currencies = Array.from(new Set([
      this.firstSelectedCurrencyToCompare()?.value,
      this.secondSelectedCurrencyToCompare()?.value,
      this.thirdSelectedCurrencyToCompare()?.value
    ]
      .map(value => value != null ? String(value).trim().toUpperCase() : '')
      .filter((c): c is string => !!c)));

    if (currencies.length === 0) {
      this.chart.data.labels = this.dates();
      this.chart.data.datasets = [];
      this.chart.update();
      return;
    }

    const aggregationBuckets = this.getAggregationBuckets(this.dates(), this.aggregationMode());
    const labels = aggregationBuckets.map(bucket => bucket.label);

    const colors = ['#FF6384', '#36A2EB', '#FFCE56'];
    const datasets: ChartDataset<'line', (number | null)[]>[] = currencies.map((currency, index) => {
      const rates = aggregationBuckets.map(bucket => this.getAggregatedCurrencyRate(historicalData, currency, bucket.indexes));
      return {
        label: currency,
        data: rates,
        borderColor: colors[index % colors.length],
        backgroundColor: colors[index % colors.length] + '20',
        borderWidth: 2,
        tension: 0.4,
        fill: false,
        pointRadius: 0,
        pointHoverRadius: 0,
        pointBackgroundColor: colors[index % colors.length],
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      };
    });

    this.chart.data.labels = labels;
    this.chart.data.datasets = datasets;
    this.chart.update();
  }

  private getAggregationBuckets(dates: string[], mode: AggregationMode): Array<{ label: string; indexes: number[] }> {
    if (mode === 'daily') {
      return dates.map((date, index) => ({
        label: this.formatShortDate(date),
        indexes: [index]
      }));
    }

    if (mode === 'weekly') {
      const buckets: Array<{ label: string; indexes: number[] }> = [];

      for (let i = 0; i < dates.length; i += 7) {
        const indexes = Array.from({ length: Math.min(7, dates.length - i) }, (_, offset) => i + offset);
        const startDate = dates[indexes[0]];
        const endDate = dates[indexes[indexes.length - 1]];

        buckets.push({
          label: `${this.formatShortDate(startDate)} - ${this.formatShortDate(endDate)}`,
          indexes,
        });
      }

      return buckets;
    }

    const monthlyGroups = new Map<string, number[]>();

    dates.forEach((date, index) => {
      const monthKey = date.slice(0, 7);
      const group = monthlyGroups.get(monthKey) ?? [];
      group.push(index);
      monthlyGroups.set(monthKey, group);
    });

    return Array.from(monthlyGroups.entries()).map(([monthKey, indexes]) => ({
      label: this.formatMonthLabel(monthKey),
      indexes,
    }));
  }

  private getAggregatedCurrencyRate(
    historicalData: HistoryConversionRatesResponse[],
    currency: string,
    indexes: number[]
  ): number | null {
    const rates = indexes
      .map(index => historicalData[index]?.conversion_rates[currency])
      .filter((rate): rate is number => typeof rate === 'number');

    if (rates.length === 0) {
      return null;
    }

    const total = rates.reduce((sum, rate) => sum + rate, 0);
    return Number((total / rates.length).toFixed(6));
  }

  private formatShortDate(dateString: string): string {
    const date = new Date(`${dateString}T00:00:00`);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date);
  }

  private formatMonthLabel(monthKey: string): string {
    const [year, month] = monthKey.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      year: 'numeric'
    }).format(date);
  }

  private getPastMonthDates(): string[] {
    const dates: string[] = [];

    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      const formattedDate = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0')
      ].join('-');

      dates.push(formattedDate);
    }
    return dates;
  }
}
