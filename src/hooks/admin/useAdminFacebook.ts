import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../lib/apiClient";
import type {
  FacebookAdminDealerSummaryDTO,
  FacebookAdminVehicleRequestDTO,
  FacebookRejectRequestDTO,
  FacebookBulkApprovePublishRequestDTO,
  FacebookBulkApprovePublishResponseDTO,
  FacebookBatchStatusDTO,
  FacebookRetryFailedRequestDTO,
} from "../../types/facebook";

export function useGetAdminFacebookDealerSummary() {
  return useQuery<FacebookAdminDealerSummaryDTO[], Error>({
    queryKey: ["adminFacebookDealerSummary"],
    queryFn: async () => {
      const response = await apiClient.get("/api/admin/facebook-post-requests/dealer-summary");
      return Array.isArray(response.data) ? response.data : (response.data?.data ?? []);
    },
  });
}

export function useGetAdminFacebookDealerRequests(dealerId: number | null) {
  return useQuery<FacebookAdminVehicleRequestDTO[], Error>({
    queryKey: ["adminFacebookDealerRequests", dealerId],
    queryFn: async () => {
      if (!dealerId) return [];
      const response = await apiClient.get(`/api/admin/facebook-post-requests/dealer/${dealerId}`);
      return Array.isArray(response.data) ? response.data : (response.data?.data ?? []);
    },
    enabled: !!dealerId,
  });
}

export function useAdminRejectFacebookRequests(dealerId: number) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, FacebookRejectRequestDTO>({
    mutationFn: async (payload) => {
      await apiClient.post("/api/admin/facebook-post-requests/reject", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminFacebookDealerSummary"] });
      queryClient.invalidateQueries({ queryKey: ["adminFacebookDealerRequests", dealerId] });
    },
  });
}

export function useAdminBulkApproveFacebookPublish(dealerId: number) {
  const queryClient = useQueryClient();

  return useMutation<
    FacebookBulkApprovePublishResponseDTO,
    Error,
    FacebookBulkApprovePublishRequestDTO
  >({
    mutationFn: async (payload) => {
      const response = await apiClient.post(
        "/api/admin/facebook-post-requests/bulk-approve-publish",
        payload
      );
      return response.data?.data ?? response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminFacebookDealerSummary"] });
      queryClient.invalidateQueries({ queryKey: ["adminFacebookDealerRequests", dealerId] });
    },
  });
}

export function useGetAdminFacebookBatchStatus(batchId: number | null) {
  return useQuery<FacebookBatchStatusDTO, Error>({
    queryKey: ["adminFacebookBatchStatus", batchId],
    queryFn: async () => {
      if (!batchId) throw new Error("Batch ID is required");
      const response = await apiClient.get(`/api/admin/facebook-post-requests/batch/${batchId}/status`);
      return response.data?.data ?? response.data;
    },
    enabled: !!batchId,
    refetchInterval: (query) => {
      const status = query.state?.data?.status;
      if (status === "QUEUED" || status === "PROCESSING") {
        return 3000;
      }
      return false;
    },
  });
}

export function useAdminRetryFailedFacebookPublish(batchId: number) {
  const queryClient = useQueryClient();

  return useMutation<
    FacebookBulkApprovePublishResponseDTO,
    Error,
    FacebookRetryFailedRequestDTO
  >({
    mutationFn: async (payload) => {
      const response = await apiClient.post(
        "/api/admin/facebook-post-requests/retry-failed",
        payload
      );
      return response.data?.data ?? response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminFacebookBatchStatus", batchId] });
      queryClient.invalidateQueries({ queryKey: ["adminFacebookDealerSummary"] });
    },
  });
}
