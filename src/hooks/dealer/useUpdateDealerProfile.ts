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
  executiveMobile?: string | null;
  whatsapp: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
}

export function useUpdateDealerProfile(dealerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateProfilePayload) => {
      try {
        const { data: body } = await apiClient.put(
          `/api/dealer/update-profile/${dealerId}`,
          payload
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
