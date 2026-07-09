import { useQuery } from "@tanstack/react-query";
import apiClient from "../../lib/apiClient";

export interface AdminLead {
  id: number;
  customerName: string;
  uniqueLeadId: string;
  customerMobile: string;
  customerCity: string;
  enquiryDate: string;
  leadStatus: string;
  vehicleName:
  | {
    brand: string;
    model: string;
    variant: string;
  }
  | string
  | null;
}

export function useAdminLeads() {
  return useQuery<AdminLead[]>({
    queryKey: ["admin-leads"],
    queryFn: async () => {
      const { data } = await apiClient.get("/api/admin/all-leads");
      const raw: any[] = Array.isArray(data) ? data : (data?.data ?? []);
      // Flatten vehicleName to only needed fields to avoid deeply nested circular refs
      return raw.map((l) => ({
        ...l,
        vehicleName:
          l.vehicleName && typeof l.vehicleName === "object"
            ? {
              brand: l.vehicleName.brand,
              model: l.vehicleName.model,
              variant: l.vehicleName.variant,
            }
            : l.vehicleName,
      }));
    },
  });
}
