import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../lib/apiClient";

export interface DealerLog {
  dealerId: number;
  dealerName: string;
  mobileNumber: string;
  status: "SUCCESS" | "FAILED";
  errorMessage: string | null;
  whatsappMessageId: string | null;
  sentAt: string;
}

export interface AdminOffer {
  offerId: number;
  offerTitle: string;
  dealerGreetingName: string;
  offerDetails: string;
  benefits: string;
  contactInfo: string;
  imageUrl: string;
  message: string | null;
  status: string | null;
  totalDealersTargeted: number;
  totalSentSuccess: number;
  totalSentFailed: number;
  createdAt: string;
  dealerLogs: DealerLog[];
}

export function useAdminOffers() {
  return useQuery<AdminOffer[]>({
    queryKey: ["admin-offers"],
    queryFn: async () => {
      const { data } = await apiClient.get("/api/admin/offers/all");
      return Array.isArray(data) ? data : (data?.data ?? []);
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useSendDealerOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await apiClient.post(
        "/api/admin/offers/send-dealer-offer",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-offers"] });
    },
  });
}
