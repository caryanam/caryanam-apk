import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import axios from "axios";
import apiClient from "../../lib/apiClient";
import { VehicleError } from "./useAddVehicle";

export function useDeleteVehicle(dealerId: string) {
  const queryClient = useQueryClient();

  return useMutation<any, Error, string>({
    mutationFn: async (vehicleId: string) => {
      try {
        const { data: body } = await apiClient.delete(
          `/api/vehicle/delete/${vehicleId}`
        );
        return body;
      } catch (err: any) {
        if (axios.isAxiosError(err)) {
          const body = err.response?.data;
          throw new VehicleError(
            body?.message ?? "Failed to delete vehicle",
            body?.status ?? err.response?.status ?? 500
          );
        }
        throw err;
      }
    },
    onSuccess: (data) => {
      Alert.alert("Success", data?.message ?? "Vehicle deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["vehicles", dealerId] });
    },
    onError: (error) => {
      Alert.alert("Error", error.message ?? "Failed to remove vehicle");
    }
  });
}
