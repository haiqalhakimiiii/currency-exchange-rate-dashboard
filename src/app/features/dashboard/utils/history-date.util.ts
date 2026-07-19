export interface HistoryDateParts {
  year: string;
  month: string;
  day: string;
}

export function splitHistoryDate(date: string): HistoryDateParts {
  const [year = '', month = '', day = ''] = date.split('-');
  return { year, month, day };
}
