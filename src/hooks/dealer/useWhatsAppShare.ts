import { useMutation } from "@tanstack/react-query";
import apiClient from "../../lib/apiClient";

export interface VehicleShareResponseDTO {
  id?: number;
  vehicleId: number;
  dealerId: number;
  sharedAt?: string;
  whatsappLink?: string;
  shareUrl?: string;
}

export function useShareVehicleOnWhatsApp() {
  return useMutation<
    VehicleShareResponseDTO,
    Error,
    { vehicleId: number; dealerId: string }
  >({
    mutationFn: async ({ vehicleId, dealerId }) => {
      const response = await apiClient.post(
        `/api/dealer/vehicles/${vehicleId}/share-on-whatsapp?dealerId=${dealerId}`
      );
      return response.data?.data || response.data;
    },
  });
}
