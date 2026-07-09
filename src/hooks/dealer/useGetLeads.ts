import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { Lead, LeadStatus } from "../../types";
import apiClient from "../../lib/apiClient";

export class LeadError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "LeadError";
    this.status = status;
  }
}

export interface ApiLead {
  id: number;
  uniqueLeadId: string;
  customerName: string;
  customerMobile: string;
  customerEmail: string;
  customerCity: string;
  enquiryDate: string;
  customerPassword: null | string;
  accountCreateAt: null | string;
  role: null | string;
  leadStatus: "NEW" | "CONTACTED" | "CONVERTED";
  vehicleName: string;
  dealer: number;
}

const statusMapToFrontend: Record<ApiLead["leadStatus"], LeadStatus> = {
  NEW: "New",
  CONTACTED: "Contacted",
  CONVERTED: "Converted",
};

export function useGetLeads(dealerId: string) {
  return useQuery<Lead[], Error>({
    queryKey: ["leads", dealerId],
    queryFn: async () => {
      if (!dealerId) return [];
      try {
        const { data: body } = await apiClient.get(
          `/api/lead/all-leads/${dealerId}`
        );
        const data = body?.data !== undefined ? body.data : body;
        if (!Array.isArray(data)) return [];
        return data.map((l: ApiLead) => ({
          id: String(l.id),
          uniqueLeadId: l.uniqueLeadId,
          customerName: l.customerName,
          mobile: l.customerMobile,
          vehicleId: "",
          vehicleTitle: l.vehicleName || "N/A",
          dealerId: String(l.dealer),
          status: statusMapToFrontend[l.leadStatus] || "New",
          createdAt: l.enquiryDate,
          customerCity: l.customerCity || "",
        }));
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const body = err.response?.data;
          throw new LeadError(
            body?.message ?? "Failed to fetch leads",
            body?.status ?? err.response?.status ?? 500
          );
        }
        throw err;
      }
    },
    enabled: !!dealerId,
  });
}
