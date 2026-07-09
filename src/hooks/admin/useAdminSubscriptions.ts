import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../../lib/apiClient";

export interface AdminSubscription {
  dealerId: number;
  dealerName: string;
  paymentId: number | null;
  subscriptionActive: boolean;
  subscriptionPlan: string | null;
  subscriptionStartDate: string | null;
  subscriptionEndDate: string | null;
}

export function useAdminSubscriptions() {
  return useQuery<AdminSubscription[]>({
    queryKey: ["admin-subscriptions"],
    queryFn: async () => {
      const { data: body } = await apiClient.get("/api/admin/subscriptions");
      return body.data;
    },
  });
}

export function useApprovePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (paymentId: number) => {
      const token = await AsyncStorage.getItem("adminToken");
      const { data: body } = await apiClient.put(
        `/api/payment/success/${paymentId}`,
        {},
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }
      );
      return body;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-payments"] });
    },
  });
}
