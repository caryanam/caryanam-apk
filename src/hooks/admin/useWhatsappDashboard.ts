import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../lib/apiClient";

export interface OverallStats {
  totalMessagesSent: number;
  totalDelivered: number;
  totalRead: number;
  totalFailed: number;
  totalQueued?: number;
  totalAccepted?: number;
  overallDeliveryRate: number;
  overallReadRate: number;
}

export interface TemplateStats {
  totalSent?: number;
  totalDelivered?: number;
  totalRead?: number;
  totalFailed?: number;
  totalQueued?: number;
  totalAccepted?: number;
  deliveryRate?: number;
  readRate?: number;
  sent?: number;
  delivered?: number;
  read?: number;
  failed?: number;
  queued?: number;
  accepted?: number;
}

export interface FailedMessageDTO {
  logId: number;
  logType: "LEAD" | "OFFER" | "VEHICLE";
  dealerName: string;
  mobileNumber: string;
  templateName: string;
  apiStatus: string;
  deliveryStatus: string;
  errorMessage: string;
  retryCount: number;
  canRetry: boolean;
  createdAt: string;
  lastRetryAt: string | null;
}

export interface RetryResultDTO {
  logId: number;
  logType: string;
  success: boolean;
  retryCount: number;
  message: string;
}

export function useWhatsappDashboard() {
  return useQuery<OverallStats>({
    queryKey: ["whatsapp-dashboard-stats"],
    queryFn: async () => {
      const { data } = await apiClient.get("/api/admin/whatsapp/dashboard");
      return data?.data || data;
    },
  });
}

export function useWhatsappLeadStats() {
  return useQuery<TemplateStats>({
    queryKey: ["whatsapp-lead-stats"],
    queryFn: async () => {
      const { data } = await apiClient.get("/api/admin/whatsapp/leads/stats");
      return data?.data || data;
    },
  });
}

export function useWhatsappOfferStats() {
  return useQuery<TemplateStats>({
    queryKey: ["whatsapp-offer-stats"],
    queryFn: async () => {
      const { data } = await apiClient.get("/api/admin/whatsapp/offers/stats");
      return data?.data || data;
    },
  });
}

export function useWhatsappVehicleStats() {
  return useQuery<TemplateStats>({
    queryKey: ["whatsapp-vehicle-stats"],
    queryFn: async () => {
      const { data } = await apiClient.get("/api/admin/whatsapp/vehicles/stats");
      return data?.data || data;
    },
  });
}

export function useWhatsappBirthdayStats() {
  return useQuery<TemplateStats>({
    queryKey: ["whatsapp-birthday-stats"],
    queryFn: async () => {
      const { data } = await apiClient.get("/api/admin/whatsapp/birthdays/stats");
      return data?.data || data;
    },
  });
}

export interface WhatsappLogItem {
  id: number;
  dealerId?: number;
  dealerName?: string;
  mobileNumber?: string;
  recipientMobile?: string;
  templateName?: string;
  apiStatus?: string;
  deliveryStatus?: string;
  errorMessage?: string;
  retryCount?: number;
  createdAt?: string;
  lastRetryAt?: string;
  offerId?: number;
  vehicleId?: number;
  leadId?: number;
  [key: string]: any;
}

export function useWhatsappLeadLogs() {
  return useQuery<WhatsappLogItem[]>({
    queryKey: ["whatsapp-lead-logs"],
    queryFn: async () => {
      const { data } = await apiClient.get("/api/admin/whatsapp/logs/leads");
      return Array.isArray(data) ? data : (data?.data ?? []);
    },
  });
}

export function useWhatsappOfferLogs() {
  return useQuery<WhatsappLogItem[]>({
    queryKey: ["whatsapp-offer-logs"],
    queryFn: async () => {
      const { data } = await apiClient.get("/api/admin/whatsapp/logs/offers");
      return Array.isArray(data) ? data : (data?.data ?? []);
    },
  });
}

export function useWhatsappVehicleLogs() {
  return useQuery<WhatsappLogItem[]>({
    queryKey: ["whatsapp-vehicle-logs"],
    queryFn: async () => {
      const { data } = await apiClient.get("/api/admin/whatsapp/logs/vehicles");
      return Array.isArray(data) ? data : (data?.data ?? []);
    },
  });
}

export function useWhatsappBirthdayLogs() {
  return useQuery<WhatsappLogItem[]>({
    queryKey: ["whatsapp-birthday-logs"],
    queryFn: async () => {
      const { data } = await apiClient.get("/api/admin/whatsapp/logs/birthdays");
      return Array.isArray(data) ? data : (data?.data ?? []);
    },
  });
}

export function useWhatsappFailedMessages() {
  return useQuery<FailedMessageDTO[]>({
    queryKey: ["whatsapp-failed-messages"],
    queryFn: async () => {
      const { data } = await apiClient.get("/api/admin/whatsapp/failed-messages");
      return Array.isArray(data) ? data : (data?.data ?? []);
    },
  });
}

export function useRetryWhatsappMessage() {
  const queryClient = useQueryClient();
  
  return useMutation<RetryResultDTO, Error, { logType: string; logId: number }>({
    mutationFn: async ({ logType, logId }) => {
      const { data } = await apiClient.post(`/api/admin/whatsapp/retry/${logType}/${logId}`);
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp-failed-messages"] });
      queryClient.invalidateQueries({ queryKey: ["whatsapp-dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["whatsapp-lead-logs"] });
      queryClient.invalidateQueries({ queryKey: ["whatsapp-offer-logs"] });
      queryClient.invalidateQueries({ queryKey: ["whatsapp-vehicle-logs"] });
      queryClient.invalidateQueries({ queryKey: ["whatsapp-birthday-logs"] });
    },
  });
}
