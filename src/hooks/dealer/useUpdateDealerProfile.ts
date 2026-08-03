import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../lib/apiClient";

export class UpdateProfileError extends Error {
  fieldErrors?: Record<string, string>;
  constructor(message: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.fieldErrors = fieldErrors;
  }
}

export interface UpdateProfilePayload {
  businessName: string;
  dateOfBirth?: string;
  executiveMobile?: string | null;
  whatsapp: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  ownerName?: string;
}

export function useUpdateDealerProfile(dealerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ payload, showroomImageUri, dealerLogoUri }: { payload: UpdateProfilePayload, showroomImageUri?: string | null, dealerLogoUri?: string | null }) => {
      try {
        const formData = new FormData();
        
        formData.append("request", JSON.stringify(payload));
        
        if (showroomImageUri) {
          const fileName = showroomImageUri.split('/').pop() || 'showroom.jpg';
          formData.append("showroomImage", {
            uri: showroomImageUri,
            name: fileName,
            type: "image/jpeg"
          } as any);
        }

        if (dealerLogoUri) {
          const fileName = dealerLogoUri.split('/').pop() || 'logo.jpg';
          formData.append("dealerLogo", {
            uri: dealerLogoUri,
            name: fileName,
            type: "image/jpeg"
          } as any);
        }

        const { data: body } = await apiClient.put(
          `/api/dealer/update-profile/${dealerId}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        return body.data;
      } catch (err: any) {
        const body = err?.response?.data;
        throw new UpdateProfileError(body?.message || "Failed to update profile", body?.errors);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dealer-profile", dealerId] });
    },
  });
}
