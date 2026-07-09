import { useQuery } from "@tanstack/react-query";
import apiClient from "../../lib/apiClient";
import type { Vehicle } from "../../types";

export function useGetVehicleDetails(vehicleId?: number) {
  return useQuery<Vehicle, Error>({
    queryKey: ["vehicleDetails", vehicleId],
    queryFn: async () => {
      if (!vehicleId) throw new Error("Vehicle ID is required");
      const { data } = await apiClient.get(`/api/vehicle/${vehicleId}`);
      return data?.data !== undefined ? data.data : data;
    },
    enabled: !!vehicleId,
    retry: 1,
  });
}
