import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../lib/apiClient";
import type {
  InstagramDealerVehicleStatusDTO,
  InstagramPostRequestBulkRequestDTO,
  InstagramPostRequestBulkResponseDTO,
} from "../../types/instagram";
import axios from "axios";

export function useGetDealerInstagramVehicles(enabled: boolean = true) {
  return useQuery<InstagramDealerVehicleStatusDTO[], Error>({
    queryKey: ["dealerInstagramVehicles"],
    queryFn: async () => {
      try {
        const { data: body } = await apiClient.get(
          "/api/dealer/instagram-post-requests/vehicles"
        );
        const data = body?.data !== undefined ? body.data : body;
        return Array.isArray(data) ? data : [];
      } catch (err) {
        if (axios.isAxiosError(err)) {
          throw new Error(err.response?.data?.message || "Failed to fetch Instagram vehicles");
        }
        throw err;
      }
    },
    enabled,
  });
}

export function useSubmitBulkInstagramPost() {
  const queryClient = useQueryClient();

  return useMutation<
    InstagramPostRequestBulkResponseDTO,
    Error,
    InstagramPostRequestBulkRequestDTO
  >({
    mutationFn: async (payload) => {
      try {
        const { data: body } = await apiClient.post(
          "/api/dealer/instagram-post-requests/bulk",
          payload
        );
        return body?.data !== undefined ? body.data : body;
      } catch (err) {
        if (axios.isAxiosError(err)) {
          throw new Error(err.response?.data?.message || "Failed to submit post request");
        }
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dealerInstagramVehicles"] });
    },
  });
}
