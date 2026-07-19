import { splitHistoryDate } from './history-date.util';

describe('splitHistoryDate', () => {
  it('should split an ISO date string into year, month, and day parts', () => {
    expect(splitHistoryDate('2026-07-19')).toEqual({
      year: '2026',
      month: '07',
      day: '19',
    });
  });

  it('should return empty values for missing parts', () => {
    expect(splitHistoryDate('2026-07')).toEqual({
      year: '2026',
      month: '07',
      day: '',
    });
  });
});
