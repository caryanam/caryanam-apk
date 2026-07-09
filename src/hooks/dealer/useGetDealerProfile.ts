import { useQuery } from "@tanstack/react-query";
import apiClient from "../../lib/apiClient";

export function useGetDealerProfile(dealerId: string) {
  return useQuery({
    queryKey: ["dealer-profile", dealerId],
    queryFn: async () => {
      const { data: body } = await apiClient.get(`/api/dealer/dealer-profile/${dealerId}`);
      return body.data;
    },
    enabled: !!dealerId,
  });
}
