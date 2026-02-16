/**
 * Results filter mappers for API queries
 * 
 * Maps UI filter models to API v3 query parameters
 */

import type { ResultFilter } from '../types/results';
import type { ResultPeriodFilter } from '../../shared/store/useSettingsStore';
import { mapPeriodToDateParams } from './dates';

/**
 * V3 API query parameters (PascalCase as expected by labGate API)
 */
export interface ApiQueryParams {
  StartDate?: string;
  EndDate?: string;
  Query?: string;
  ResultCategory?: 'None' | 'Favorites' | 'New' | 'Pathological' | 'Urgent' | 'HighPathological';
  ResultTypes?: string;
  PatientIds?: number[];
  SenderIds?: number[];
  Area?: 'NotArchived' | 'Archived' | 'All';
  CurrentPage?: number;
  ItemsPerPage?: number;
  SortColumn?: 'None' | 'ReportDate' | 'LabNo' | 'Patient' | 'KisVisitNumber';
  SortDirection?: 'None' | 'Descending' | 'Ascending';
}

/**
 * Map local filters to V3 API format (PascalCase for labGate API)
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
    ItemsPerPage: itemsPerPage,
    SortColumn: 'ReportDate',
    SortDirection: 'Descending',
    // API uses 0-based pagination
    CurrentPage: page - 1,
  };

  // Apply period filter first (sets StartDate, EndDate, Area)
  if (period) {
    const periodParams = mapPeriodToDateParams(period);
    Object.assign(v3Filters, periodParams);
  }

  if (!filters) return v3Filters;

  // Status/area filter - only override if not already set by period
  if (filters.isArchived) {
    v3Filters.Area = 'Archived';
  } else if (!v3Filters.Area) {
    v3Filters.Area = 'NotArchived';
  }

  // Favorites filter (from filter modal)
  if (filters.isPinned || filters.isFavorite) {
    v3Filters.ResultCategory = 'Favorites';
  }
  // Category filter (maps UI category to API resultCategory)
  else if (filters.area === 'new') {
    v3Filters.ResultCategory = 'New';
  } else if (filters.area === 'pathological') {
    v3Filters.ResultCategory = 'Pathological';
  } else if (filters.area === 'highPathological') {
    v3Filters.ResultCategory = 'HighPathological';
  } else if (filters.area === 'urgent') {
    v3Filters.ResultCategory = 'Urgent';
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
      v3Filters.ResultTypes = mappedTypes.join(',');
    }
  }

  // Date filter - only override if not set by period filter
  if (filters.dateFrom && !v3Filters.StartDate) {
    v3Filters.StartDate = filters.dateFrom;
  }
  if (filters.dateTo && !v3Filters.EndDate) {
    v3Filters.EndDate = filters.dateTo;
  }

  // Search query
  if (filters.search) {
    v3Filters.Query = filters.search;
  }

  // Patient filter
  if (filters.patientIds?.length) {
    v3Filters.PatientIds = filters.patientIds.map(id => Number(id));
  }

  // Sender filter
  if (filters.senderIds?.length) {
    v3Filters.SenderIds = filters.senderIds.map(id => Number(id));
  }

  // Sort
  if (filters.sortColumn) {
    v3Filters.SortColumn = filters.sortColumn as ApiQueryParams['SortColumn'];
  }
  if (filters.sortDirection) {
    v3Filters.SortDirection = filters.sortDirection === 'asc' ? 'Ascending' : 'Descending';
  }

  return v3Filters;
}
