/**
 * Date and period filter mappers for API queries
 */

import { format, startOfDay, subDays } from 'date-fns';
import type { ResultPeriodFilter } from '../../shared/store/useSettingsStore';

/**
 * Date range parameters for API queries (PascalCase for labGate API)
 * Dates should be in yyyy-MM-dd format
 */
export interface DateRangeParams {
  /** Start date in yyyy-MM-dd format */
  StartDate?: string;
  /** End date in yyyy-MM-dd format */
  EndDate?: string;
  Area?: 'NotArchived' | 'Archived' | 'All';
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
 * Map period filter to API date parameters (PascalCase for labGate API)
 * @param period - Period filter from UI
 * @returns Date range parameters for API
 */
export function mapPeriodToDateParams(period: ResultPeriodFilter): DateRangeParams {
  const now = new Date();
  const todayStart = startOfDay(now);

  switch (period) {
    case 'today':
      return {
        StartDate: formatDateForApi(todayStart),
        EndDate: formatDateForApi(now),
        Area: 'NotArchived',
      };
    case '7days':
      return {
        StartDate: formatDateForApi(subDays(todayStart, 7)),
        EndDate: formatDateForApi(now),
        Area: 'NotArchived',
      };
    case '30days':
      return {
        StartDate: formatDateForApi(subDays(todayStart, 30)),
        EndDate: formatDateForApi(now),
        Area: 'NotArchived',
      };
    case 'archive':
      return {
        Area: 'Archived',
      };
    case 'all':
    default:
      return {
        Area: 'NotArchived',
      };
  }
}
