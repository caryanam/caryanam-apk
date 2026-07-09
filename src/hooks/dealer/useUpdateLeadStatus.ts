import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import apiClient from "../../lib/apiClient";
import type { LeadStatus } from "../../types";

export class LeadStatusError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "LeadStatusError";
    this.status = status;
  }
}

const statusMapToBackend: Record<LeadStatus, string> = {
  New: "NEW",
  Contacted: "CONTACTED",
  Converted: "CONVERTED",
};

export function useUpdateLeadStatus(dealerId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { leadId: string; status: LeadStatus }>({
    mutationFn: async ({ leadId, status }) => {
      try {
        const backendStatus = statusMapToBackend[status];
        await apiClient.put(`/api/lead/lead-status/${leadId}`, {
          status: backendStatus,
        });
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const body = err.response?.data;
          throw new LeadStatusError(
            body?.message ?? "Failed to update lead status",
            body?.status ?? err.response?.status ?? 500
          );
        }
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads", dealerId] });
    },
  });
}
