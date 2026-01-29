import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { axiosInstance } from '../../../api/client/axiosInstance';
import { useAuthStore } from '../../auth/store/authStore';
import { Patient, LabResult } from '../../../api/types';

const PATIENTS_KEY = 'patients';

// V3 API results response
interface ResultsResponseV3 {
  Results: LabResult[];
}

interface PatientsFilter {
  search?: string;
}

// Patients are derived from results - labgate-pwa doesn't have a dedicated patients list endpoint
export function usePatients(filter?: PatientsFilter) {
  const { selectedSender } = useAuthStore();

  const resultsQuery = useQuery({
    queryKey: [PATIENTS_KEY, 'from-results', selectedSender?.Id],
    queryFn: async () => {
      // Fetch results and extract unique patients
      const response = await axiosInstance.get<ResultsResponseV3>(
        `/api/v3/results?senderId=${selectedSender?.Id}`
      );
      return response.data.Results || [];
    },
    enabled: !!selectedSender?.Id,
  });

  // Extract unique patients from results
  const patients = useMemo(() => {
    if (!resultsQuery.data) return [];

    const patientMap = new Map<number, Patient>();
    for (const result of resultsQuery.data) {
      if (result.Patient && !patientMap.has(result.Patient.Id)) {
        patientMap.set(result.Patient.Id, {
          Id: result.Patient.Id,
          Firstname: result.Patient.Firstname,
          Lastname: result.Patient.Lastname,
          DateOfBirth: result.Patient.DateOfBirth,
        });
      }
    }

    let patientList = Array.from(patientMap.values());

    // Apply search filter
    if (filter?.search) {
      const searchLower = filter.search.toLowerCase();
      patientList = patientList.filter(
        (p) =>
          p.Firstname?.toLowerCase().includes(searchLower) ||
          p.Lastname?.toLowerCase().includes(searchLower)
      );
    }

    return patientList;
  }, [resultsQuery.data, filter?.search]);

  return {
    ...resultsQuery,
    data: {
      Results: patients,
    },
  };
}

export function usePatient(id: string | undefined) {
  const { selectedSender } = useAuthStore();

  return useQuery({
    queryKey: [PATIENTS_KEY, id, selectedSender?.Id],
    queryFn: async () => {
      // Get patient info from results for this patient
      const response = await axiosInstance.get<ResultsResponseV3>(
        `/api/v3/results?senderId=${selectedSender?.Id}`
      );

      const patientId = parseInt(id || '0', 10);
      const resultWithPatient = response.data.Results?.find(
        (r) => r.Patient?.Id === patientId
      );

      if (resultWithPatient?.Patient) {
        return {
          Id: resultWithPatient.Patient.Id,
          Firstname: resultWithPatient.Patient.Firstname,
          Lastname: resultWithPatient.Patient.Lastname,
          DateOfBirth: resultWithPatient.Patient.DateOfBirth,
        } as Patient;
      }

      return null;
    },
    enabled: !!id && !!selectedSender?.Id,
  });
}

// Get results for a specific patient
export function usePatientResults(patientId: number | undefined) {
  const { selectedSender } = useAuthStore();

  return useQuery({
    queryKey: [PATIENTS_KEY, patientId, 'results', selectedSender?.Id],
    queryFn: async () => {
      // labGate API v3 endpoint - matches labgate-pwa exactly
      const response = await axiosInstance.get<ResultsResponseV3>(
        `/api/v3/patients/${patientId}/results?senderId=${selectedSender?.Id}`
      );
      return response.data.Results || [];
    },
    enabled: !!patientId && !!selectedSender?.Id,
  });
}
