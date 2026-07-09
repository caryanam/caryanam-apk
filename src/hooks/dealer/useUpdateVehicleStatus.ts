import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import axios from "axios";
import apiClient from "../../lib/apiClient";
import { VehicleError } from "./useAddVehicle";

export function useUpdateVehicleStatus(dealerId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    any,
    Error,
    { vehicleId: number; status: string }
  >({
    mutationFn: async ({ vehicleId, status }) => {
      try {
        const { data: body } = await apiClient.patch(
          `/api/vehicle/status/${vehicleId}`,
          { status }
        );
        return body;
      } catch (err: any) {
        if (axios.isAxiosError(err)) {
          const body = err.response?.data;
          throw new VehicleError(
            body?.message ?? "Failed to update vehicle status",
            body?.status ?? err.response?.status ?? 500
          );
        }
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles", dealerId] });
      // We don't alert here directly because it might be noisy to alert on status change inside a list
    },
    onError: (error) => {
      Alert.alert("Error", error.message ?? "Failed to update vehicle status");
    }
  });
}
