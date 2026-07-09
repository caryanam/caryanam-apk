import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import axios from "axios";
import apiClient from "../../lib/apiClient";
import { VehicleError } from "./useAddVehicle";

export function useUpdateVehicle(dealerId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    any,
    Error,
    { vehicleId: number; vehicleData: any }
  >({
    mutationFn: async ({ vehicleId, vehicleData }) => {
      try {
        const { data: body } = await apiClient.put(
          `/api/vehicle/update/${vehicleId}`,
          vehicleData
        );
        return body?.data !== undefined ? body.data : body;
      } catch (err: any) {
        if (axios.isAxiosError(err)) {
          const body = err.response?.data;
          throw new VehicleError(
            body?.message ?? "Failed to update vehicle",
            body?.status ?? err.response?.status ?? 500,
            body?.errors ?? undefined
          );
        }
        throw err;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["vehicles", dealerId] });
      queryClient.invalidateQueries({ queryKey: ["vehicleDetails", variables.vehicleId] });
      Alert.alert("Success", "Vehicle updated successfully");
    },
    onError: (error: any) => {
      if (error instanceof VehicleError && error.fieldErrors && Object.keys(error.fieldErrors).length > 0) {
        const errorMessages = Object.values(error.fieldErrors).join("\n");
        Alert.alert("Validation Error", errorMessages);
      } else {
        Alert.alert("Error", error.message ?? "Failed to update vehicle");
      }
    }
  });
}
