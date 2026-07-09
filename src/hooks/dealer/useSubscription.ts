import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../lib/apiClient";

export interface SubscriptionPlan {
  planName: string;
  amount: number;
  vehicleLimit: number;
  validityMonths: number;
}

export interface CurrentPlan {
  dealerId: number;
  subscriptionPlan: string;
  amount: number;
  vehicleLimit: number;
  validityMonths: number;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  remainingDays: number;
}

export function useGetSubscriptionPlans() {
  return useQuery<SubscriptionPlan[]>({
    queryKey: ["subscription-plans"],
    queryFn: async () => {
      const { data: body } = await apiClient.get("/api/dealer/subscription/plans");
      return body.data;
    },
  });
}

export function useGetCurrentPlan(dealerId: string) {
  return useQuery<{ plan: CurrentPlan | null; message: string }>({
    queryKey: ["current-plan", dealerId],
    queryFn: async () => {
      try {
        const { data: body } = await apiClient.get(`/api/dealer/current-plan/${dealerId}`);
        return { plan: body.data, message: body?.message ?? "" };
      } catch (err: any) {
        const msg = err?.response?.data?.message ?? "No active plan";
        return { plan: null, message: msg };
      }
    },
    enabled: !!dealerId,
  });
}

export function usePurchaseSubscription(dealerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (subscriptionPlan: string) => {
      const { data: body } = await apiClient.post("/api/payment/subscription/purchase", {
        dealerId: Number(dealerId),
        subscriptionPlan,
      });
      return body;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-plan", dealerId] });
    },
  });
}
