/**
 * Results filter mappers for API queries
 * 
 * Maps UI filter models to API v3 query parameters
 */

import type { ResultFilter } from '../types/results';
import type { ResultPeriodFilter } from '../../shared/store/useSettingsStore';
import { mapPeriodToDateParams } from './dates';

/**
 * V3 API query parameters (camelCase as expected by API)
 */
export interface ApiQueryParams {
  startDate?: string;
  endDate?: string;
  query?: string;
  resultCategory?: 'None' | 'Favorites' | 'New' | 'Pathological' | 'Urgent' | 'HighPathological';
  resultTypes?: string;
  patientIds?: number[];
  senderIds?: number[];
  area?: 'NotArchived' | 'Archived' | 'All';
  currentPage?: number;
  itemsPerPage?: number;
  sortColumn?: 'None' | 'ReportDate' | 'LabNo' | 'Patient' | 'KisVisitNumber';
  sortDirection?: 'None' | 'Descending' | 'Ascending';
}

/**
 * Map local filters to V3 API format (camelCase)
 * @param filters - UI filter model
 * @param page - Current page number (1-based)
 * @param itemsPerPage - Items per page
 * @param period - Period filter
 * @returns API query parameters
 */
export function mapFiltersToV3(
  filters?: ResultFilter,
  page = 1,
  itemsPerPage = 25,
  period?: ResultPeriodFilter
): ApiQueryParams {
  const v3Filters: ApiQueryParams = {
    itemsPerPage,
    sortColumn: 'ReportDate',
    sortDirection: 'Descending',
    // API uses 0-based pagination
    currentPage: page - 1,
  };

  // Apply period filter first (sets startDate, endDate, area)
  if (period) {
    const periodParams = mapPeriodToDateParams(period);
    Object.assign(v3Filters, periodParams);
  }

  if (!filters) return v3Filters;

  // Status/area filter - only override if not already set by period
  if (filters.isArchived) {
    v3Filters.area = 'Archived';
  } else if (!v3Filters.area) {
    v3Filters.area = 'NotArchived';
  }

  // Favorites filter (from filter modal)
  if (filters.isPinned || filters.isFavorite) {
    v3Filters.resultCategory = 'Favorites';
  }
  // Category filter (maps UI category to API resultCategory)
  else if (filters.area === 'new') {
    v3Filters.resultCategory = 'New';
  } else if (filters.area === 'pathological') {
    v3Filters.resultCategory = 'Pathological';
  } else if (filters.area === 'highPathological') {
    v3Filters.resultCategory = 'HighPathological';
  } else if (filters.area === 'urgent') {
    v3Filters.resultCategory = 'Urgent';
  }

  // Result type filter (E=Endbefund, T=Teilbefund, V=Vorläufig, N=Nachforderung, A=Archiv)
  if (filters.resultTypes?.length) {
    const typeMap: Record<string, string> = {
      final: 'E',
      partial: 'T',
      preliminary: 'V',
      followUp: 'N',
      archive: 'A',
    };
    const mappedTypes = filters.resultTypes.map(t => typeMap[t]).filter(Boolean);
    if (mappedTypes.length) {
      v3Filters.resultTypes = mappedTypes.join(',');
    }
  }

  // Date filter - only override if not set by period filter
  if (filters.dateFrom && !v3Filters.startDate) {
    v3Filters.startDate = filters.dateFrom;
  }
  if (filters.dateTo && !v3Filters.endDate) {
    v3Filters.endDate = filters.dateTo;
  }

  // Search query
  if (filters.search) {
    v3Filters.query = filters.search;
  }

  // Patient filter
  if (filters.patientIds?.length) {
    v3Filters.patientIds = filters.patientIds.map(id => Number(id));
  }

  // Sender filter
  if (filters.senderIds?.length) {
    v3Filters.senderIds = filters.senderIds.map(id => Number(id));
  }

  // Sort
  if (filters.sortColumn) {
    v3Filters.sortColumn = filters.sortColumn as ApiQueryParams['sortColumn'];
  }
  if (filters.sortDirection) {
    v3Filters.sortDirection = filters.sortDirection === 'asc' ? 'Ascending' : 'Descending';
  }

  return v3Filters;
}
