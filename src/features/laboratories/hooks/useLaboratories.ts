import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../../api/client/axiosInstance';
import { Laboratory } from '../../../api/types';

const LABORATORIES_KEY = 'laboratories';
const ITEMS_PER_PAGE = 25;

// V3 API response format for laboratories uses Items
interface LaboratoriesResponseV3 {
  Items: Laboratory[];
  TotalItemsCount?: number;
  CurrentPage?: number;
  ItemsPerPage?: number;
}

// Service catalog item from API
export interface ServiceCatalogItem {
  Id: number;
  Name: string;
  Ident: string; // Abbreviation/Code
  LaboratorySection?: string;
  Aliases?: string[];
}

interface ServiceCatalogResponseV3 {
  Items: ServiceCatalogItem[];
  TotalCount: number;
}

// Service detail (single request) from API
export interface ServiceDetailTest {
  Ident?: string;
  Name?: string;
  LaboratorySection?: string;
}

// Material from API
export interface ServiceMaterial {
  Name?: string;
  RequiredQuantity?: number;
  Transport?: string;
  Unit?: string;
  SubjectArea?: 'Unknown' | 'Specialist' | 'Microbiology' | 'Pathology';
}

export interface ServiceDetail {
  Name?: string;
  PrintName?: string;
  InternalIdent?: string;
  ClinicalIndication?: string;
  Preanalytics?: string;
  Assessment?: string;
  InitialDays?: number;
  AdditionalInformationUrl?: string;
  RequestDirectories?: string[];
  Tests?: ServiceDetailTest[];
  Materials?: ServiceMaterial[];
}

// Contact person from API
export interface LaboratoryContactPerson {
  Id: number;
  Title?: string;
  Firstname?: string;
  Name?: string;
  Fullname?: string;
  Position?: string;
  Contact?: {
    Phone?: string;
    Email?: string;
  };
  HasPicture?: boolean;
  PictureUrl?: string;
}

// Extended laboratory response with contacts
export interface LaboratoryDetailResponse extends Laboratory {
  ContactPersons?: LaboratoryContactPerson[];
  Contact?: {
    Phone?: string;
    Fax?: string;
    Email?: string;
    Website?: string;
  };
}

export function useLaboratories() {
  return useInfiniteQuery({
    queryKey: [LABORATORIES_KEY],
    queryFn: async ({ pageParam = 1 }) => {
      // labGate API v3 endpoint (1-based pagination)
      const response = await axiosInstance.get<LaboratoriesResponseV3>(
        `/api/v3/laboratories?itemsPerPage=${ITEMS_PER_PAGE}&currentPage=${pageParam}`
      );
      const items = response.data.Items || [];
      const totalCount = response.data.TotalItemsCount ?? items.length;
      const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
      return {
        Results: items,
        TotalCount: totalCount,
        CurrentPage: pageParam,
        TotalPages: totalPages,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const nextPage = lastPage.CurrentPage + 1;
      return nextPage <= lastPage.TotalPages ? nextPage : undefined;
    },
  });
}

export function useLaboratory(id: string | undefined) {
  return useQuery({
    queryKey: [LABORATORIES_KEY, id],
    queryFn: async () => {
      // labGate API v3 endpoint
      const response = await axiosInstance.get<LaboratoryDetailResponse>(`/api/v3/laboratories/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useServiceCatalog(laboratoryId: string | undefined, searchText?: string) {
  return useQuery({
    queryKey: [LABORATORIES_KEY, laboratoryId, 'services', searchText],
    queryFn: async () => {
      // labGate API v3 endpoint for service catalog (Leistungsverzeichnis)
      let url = `/api/v3/requests?laboratoryId=${laboratoryId}&itemsPerPage=500`;
      if (searchText) {
        url += `&searchString=${encodeURIComponent(searchText)}`;
      }
      const response = await axiosInstance.get<ServiceCatalogResponseV3>(url);
      return response.data.Items || [];
    },
    enabled: !!laboratoryId,
  });
}

export function useServiceDetail(serviceId: number | undefined) {
  return useQuery({
    queryKey: [LABORATORIES_KEY, 'service', serviceId],
    queryFn: async () => {
      const response = await axiosInstance.get<ServiceDetail>(
        `/api/v3/requests/${serviceId}?languageCode=de`
      );
      return response.data;
    },
    enabled: !!serviceId,
  });
}
