import { Component, DestroyRef, effect, inject, input, signal, viewChild } from '@angular/core';
import { DropdownOptionModel } from '../../../../../../core/models/dropdown.model';
import { DatePipe } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { DashboardService } from '../../../../services/api/dashboard.service';
import { ConversionRate, ExchangeRatesResponse } from '../../../../models/dashboard.model';
import { catchError, filter, finalize, fromEvent, merge, Observable, of, Subject, switchMap, tap, timer } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-exchange-rates-table',
  imports: [MatTableModule, MatSortModule, MatProgressBarModule, DatePipe],
  templateUrl: './exchange-rates-table.component.html',
  styleUrl: './exchange-rates-table.component.scss',
})
export class ExchangeRatesTableComponent {
  private apiService = inject(DashboardService);
  private destroyRef = inject(DestroyRef);
  private baseCodeChanges$ = new Subject<string>();
  private manualRefresh$ = new Subject<void>();

  sort = viewChild(MatSort);

  selectedBaseCode = input<DropdownOptionModel | null>(null);
  conversionRatesData = signal<ConversionRate[]>([]);
  error = signal<string | null>(null);
  isLoading = signal(true);
  latestExchangeRatesData = signal<ExchangeRatesResponse | null>(null);

  dataSource = new MatTableDataSource<ConversionRate>();
  displayedColumns: string[] = ['currency', 'rate', 'base'];

  private activeBaseCode: string | null = null;
  private errorStreak = 0;

  private readonly MIN_VISIBLE_POLL_MS = 15000;
  private readonly MAX_VISIBLE_POLL_MS = 10 * 60 * 1000;
  private readonly HIDDEN_POLL_MS = 15 * 60 * 1000;
  private readonly FALLBACK_POLL_MS = 60 * 1000;
  private readonly MAX_ERROR_BACKOFF_MS = 5 * 60 * 1000;

  constructor() {
    effect(() => {
      const sort = this.sort();
      if (sort) {
        this.dataSource.sort = sort;
      }
    });

    effect(() => {
      const selectedBaseCode = this.selectedBaseCode()?.value;
      if (!selectedBaseCode) {
        return;
      }

      const selectedBaseCodeValue = String(selectedBaseCode);

      if (selectedBaseCodeValue !== this.activeBaseCode) {
        this.activeBaseCode = selectedBaseCodeValue;
        this.errorStreak = 0;
        this.baseCodeChanges$.next(selectedBaseCodeValue);
      }
    });

    this.setupPollingStream();

    fromEvent(document, 'visibilitychange').pipe(
      filter(() => !document.hidden),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      if (this.activeBaseCode) {
        this.manualRefresh$.next();
      }
    });
  }

  refreshData(): void {
    if (!this.activeBaseCode) {
      return;
    }

    this.errorStreak = 0;
    this.manualRefresh$.next();
  }

  private setupPollingStream(): void {
    this.baseCodeChanges$.pipe(
      switchMap((baseCode) =>
        merge(of(void 0), this.manualRefresh$).pipe(
          switchMap(() => this.fetchWithAdaptivePolling(baseCode, true))
        )
      ),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  private fetchWithAdaptivePolling(baseCode: string, showLoading: boolean): Observable<unknown> {
    if (showLoading || this.conversionRatesData().length === 0) {
      this.isLoading.set(true);
    }

    this.error.set(null);

    return this.apiService.getLatestExchangeRates(baseCode).pipe(
      tap((result) => {
        this.latestExchangeRatesData.set(result);
        this.mapData(result.conversion_rates, result.base_code);
        this.errorStreak = 0;
      }),
      switchMap((result) => timer(this.computeNextPollMs(result.time_next_update_utc))),
      catchError(() => {
        this.error.set('Failed to load exchange rates. Please try again.');
        this.errorStreak += 1;
        return timer(this.computeErrorBackoffMs());
      }),
      finalize(() => {
        this.isLoading.set(false);
      }),
      switchMap(() => this.fetchWithAdaptivePolling(baseCode, false))
    );
  }

  private computeNextPollMs(nextUpdateUtc: string): number {
    if (document.hidden) {
      return this.HIDDEN_POLL_MS;
    }

    const parsedNextUpdate = Date.parse(nextUpdateUtc);
    if (Number.isNaN(parsedNextUpdate)) {
      return this.FALLBACK_POLL_MS;
    }

    const timeUntilNextUpdate = parsedNextUpdate - Date.now();
    const clampedInterval = Math.min(
      this.MAX_VISIBLE_POLL_MS,
      Math.max(this.MIN_VISIBLE_POLL_MS, timeUntilNextUpdate)
    );

    // Add a tiny jitter to avoid synchronized bursts when many clients refresh together.
    const jitterMs = Math.floor(Math.random() * 2000);
    return clampedInterval + jitterMs;
  }

  private computeErrorBackoffMs(): number {
    const backoffMs = 10000 * Math.pow(2, this.errorStreak - 1);
    return Math.min(this.MAX_ERROR_BACKOFF_MS, backoffMs);
  }

  private mapData(conversionRates: Record<string, number>, baseCode: string): void {
    const mappedRates = Object.entries(conversionRates).map(([currency, rate]) => ({
      base: baseCode,
      currency,
      rate,
    }));

    this.conversionRatesData.set(mappedRates);
    this.dataSource.data = mappedRates;
  }
}
