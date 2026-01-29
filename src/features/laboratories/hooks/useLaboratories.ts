import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../../api/client/axiosInstance';
import { Laboratory } from '../../../api/types';

const LABORATORIES_KEY = 'laboratories';

// V3 API response format for laboratories uses Items
interface LaboratoriesResponseV3 {
  Items: Laboratory[];
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
  return useQuery({
    queryKey: [LABORATORIES_KEY],
    queryFn: async () => {
      // labGate API v3 endpoint
      const response = await axiosInstance.get<LaboratoriesResponseV3>(
        '/api/v3/laboratories?itemsPerPage=100'
      );
      return {
        Results: response.data.Items || [],
      };
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
      let url = `/api/v3/laboratories/${laboratoryId}/requests?itemsPerPage=500`;
      if (searchText) {
        url += `&searchString=${encodeURIComponent(searchText)}`;
      }
      const response = await axiosInstance.get<ServiceCatalogResponseV3>(url);
      return response.data.Items || [];
    },
    enabled: !!laboratoryId,
  });
}
