import { useQuery } from "@tanstack/react-query";
import apiClient from "../../lib/apiClient";

export function useDealerDashboard(dealerId: string) {
  return useQuery({
    queryKey: ["dealer-dashboard", dealerId],
    queryFn: async () => {
      const { data: body } = await apiClient.get(
        `/api/dealer/dashboard/${dealerId}`
      );
      return body.data ?? body;
    },
    enabled: !!dealerId,
  });
}

export function useVehicleViews(dealerId: string) {
  return useQuery({
    queryKey: ["vehicle-views", dealerId],
    queryFn: async () => {
      const { data: body } = await apiClient.get(
        `/api/analytics/vehicle-view/${dealerId}`
      );
      return Array.isArray(body) ? body : (body.data ?? []);
    },
    enabled: !!dealerId,
  });
}

export function useVehicleLeads(dealerId: string) {
  return useQuery({
    queryKey: ["vehicle-leads", dealerId],
    queryFn: async () => {
      const { data: body } = await apiClient.get(
        `/api/analytics/vehicle-lead/${dealerId}`
      );
      return Array.isArray(body) ? body : (body.data ?? []);
    },
    enabled: !!dealerId,
  });
}
