import { useQuery } from "@tanstack/react-query";
import apiClient from "../../lib/apiClient";
import type { Vehicle } from "../../types";

export interface DealerDashboardData {
  dealerName: string;
  featuredVehicles: number;
  totalLeads: number;
  totalVehicles: number;
  vehicleViews: number;
}

export interface DealerLeadData {
  id: number;
  uniqueLeadId: string;
  customerName: string;
  customerMobile: string;
  customerCity: string;
  enquiryDate: string;
  leadStatus: string;
  vehicleName: string;
  dealer: number;
}

export interface DealerDetailsResponse {
  dashboard?: DealerDashboardData;
  leads: DealerLeadData[];
  vehicles: Vehicle[];
}

export function useAdminDealerDashboard(dealerId: number) {
  return useQuery<DealerDashboardData, Error>({
    queryKey: ["admin-dealer-dashboard", dealerId],
    queryFn: async () => {
      const res = await apiClient.get(`/api/dealer/dashboard/${dealerId}`);
      return res.data;
    },
    enabled: !!dealerId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useAdminDealerLeads(dealerId: number) {
  return useQuery<DealerLeadData[], Error>({
    queryKey: ["admin-dealer-leads", dealerId],
    queryFn: async () => {
      const res = await apiClient.get(`/api/lead/all-leads/${dealerId}`);
      return Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
    },
    enabled: !!dealerId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useAdminDealerVehicles(dealerId: number) {
  return useQuery<Vehicle[], Error>({
    queryKey: ["admin-dealer-vehicles", dealerId],
    queryFn: async () => {
      const res = await apiClient.get(`/api/vehicle/dealer/${dealerId}`);
      return Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
    },
    enabled: !!dealerId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useAdminDealerDetails(dealerId: number) {
  const dashboardQuery = useAdminDealerDashboard(dealerId);
  const leadsQuery = useAdminDealerLeads(dealerId);
  const vehiclesQuery = useAdminDealerVehicles(dealerId);

  const isLoading =
    dashboardQuery.isLoading ||
    leadsQuery.isLoading ||
    vehiclesQuery.isLoading;

  return {
    data: {
      dashboard: dashboardQuery.data,
      leads: leadsQuery.data ?? [],
      vehicles: vehiclesQuery.data ?? [],
    },
    isLoading,
    isError: dashboardQuery.isError || leadsQuery.isError || vehiclesQuery.isError,
    error: dashboardQuery.error || leadsQuery.error || vehiclesQuery.error,
    refetch: async () => {
      await Promise.all([
        dashboardQuery.refetch(),
        leadsQuery.refetch(),
        vehiclesQuery.refetch(),
      ]);
    },
  };
}
