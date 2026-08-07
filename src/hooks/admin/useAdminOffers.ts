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
  imageUrl: string | null;
  videoUrl: string | null;
  templateType: "IMAGE" | "VIDEO";
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

export interface DealerDeliveryStatus {
  dealerId: number;
  dealerName: string;
  mobileNumber: string;
  deliveryStatus: "ACCEPTED" | "SENT" | "DELIVERED" | "READ" | "FAILED";
  whatsappMessageId: string | null;
  sentAt: string;
}

export interface OfferDeliverySummary {
  offerId: number;
  offerTitle: string;
  totalDealers: number;
  accepted: number;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  deliveryRate: number;
  dealerBreakdown: DealerDeliveryStatus[];
}

export function useOfferDeliverySummary(offerId: number | null) {
  return useQuery<OfferDeliverySummary>({
    queryKey: ["offer-delivery-summary", offerId],
    queryFn: async () => {
      if (!offerId) throw new Error("No offer ID");
      const { data } = await apiClient.get(`/api/admin/whatsapp/offers/${offerId}/delivery-summary`);
      return data?.data || data;
    },
    enabled: !!offerId,
  });
}

export interface WhatsappTemplateStats {
  sent?: number;
  delivered?: number;
  read?: number;
  failed?: number;
  deliveryRate?: number;
  readRate?: number;
  totalSent?: number;
  totalDelivered?: number;
  totalRead?: number;
  totalFailed?: number;
  totalQueued?: number;
  totalAccepted?: number;
  queued?: number;
  accepted?: number;
}

export function useOfferGlobalStats() {
  return useQuery<WhatsappTemplateStats>({
    queryKey: ["offer-global-stats"],
    queryFn: async () => {
      const { data } = await apiClient.get("/api/admin/whatsapp/offers/stats");
      return data?.data || data;
    },
  });
}
