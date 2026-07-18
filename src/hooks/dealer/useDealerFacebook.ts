import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../lib/apiClient";
import type {
  FacebookDealerVehicleStatusDTO,
  FacebookPostRequestBulkRequestDTO,
  FacebookPostRequestBulkResponseDTO,
} from "../../types/facebook";

export function useGetDealerFacebookVehicles() {
  return useQuery<FacebookDealerVehicleStatusDTO[], Error>({
    queryKey: ["dealerFacebookVehicles"],
    queryFn: async () => {
      const response = await apiClient.get("/api/dealer/facebook-post-requests/vehicles");
      return Array.isArray(response.data) ? response.data : (response.data?.data ?? []);
    },
  });
}

export function useSubmitBulkFacebookPost() {
  const queryClient = useQueryClient();

  return useMutation<FacebookPostRequestBulkResponseDTO, Error, FacebookPostRequestBulkRequestDTO>({
    mutationFn: async (payload) => {
      const response = await apiClient.post("/api/dealer/facebook-post-requests/bulk", payload);
      return response.data?.data ?? response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dealerFacebookVehicles"] });
    },
  });
}
