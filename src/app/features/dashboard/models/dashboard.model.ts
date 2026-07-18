export interface ExchangeRatesResponse {
  time_last_update_utc: string;
  time_next_update_utc: string;
  base_code: string;
  conversion_rates: Record<string, number>;
}

export interface ConversionRate {
  base: string;
  currency: string;
  rate: number;
}

export interface HistoryConversionRatesResponse {
  base_code: string;
  year: number;
  month: number;
  day: number;
  conversion_rates: Record<string, number>;
}

export interface CurrencyConversionResponse {
  conversion_rate: number;
  conversion_result: number;
}
