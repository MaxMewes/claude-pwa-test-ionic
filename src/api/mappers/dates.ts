/**
 * Date and period filter mappers for API queries
 */

import { format, startOfDay, subDays } from 'date-fns';
import type { ResultPeriodFilter } from '../../shared/store/useSettingsStore';

/**
 * Date range parameters for API queries
 */
export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
  area?: 'NotArchived' | 'Archived' | 'All';
}

/**
 * Format a date for API consumption
 * @param date - Date to format
 * @returns Formatted date string (yyyy-MM-dd)
 */
export function formatDateForApi(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Map period filter to API date parameters (camelCase)
 * @param period - Period filter from UI
 * @returns Date range parameters for API
 */
export function mapPeriodToDateParams(period: ResultPeriodFilter): DateRangeParams {
  const now = new Date();
  const todayStart = startOfDay(now);

  switch (period) {
    case 'today':
      return {
        startDate: formatDateForApi(todayStart),
        endDate: formatDateForApi(now),
        area: 'NotArchived',
      };
    case '7days':
      return {
        startDate: formatDateForApi(subDays(todayStart, 7)),
        endDate: formatDateForApi(now),
        area: 'NotArchived',
      };
    case '30days':
      return {
        startDate: formatDateForApi(subDays(todayStart, 30)),
        endDate: formatDateForApi(now),
        area: 'NotArchived',
      };
    case 'archive':
      return {
        area: 'Archived',
      };
    case 'all':
    default:
      return {
        area: 'NotArchived',
      };
  }
}
