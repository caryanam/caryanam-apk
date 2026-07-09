import { useCallback, useState } from "react";
import axios from "axios";
import apiClient from "../../lib/customerApiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";

type LeadPayload = {
  customerName: string;
  customerMobile: string;
  customerCity: string;
};

const getHeaders = async () => {
  const token = await AsyncStorage.getItem("customerToken");
  return token ? { Authorization: `Bearer ${token}` } : undefined;
};

export function useGenerateLead() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generateLead = useCallback(
    async (vehicleId: number, payload: LeadPayload) => {
      setIsSubmitting(true);
      try {
        const headers = await getHeaders();
        await apiClient.post(
          `/api/lead/generate-lead/${vehicleId}`,
          payload,
          { headers }
        );
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const body = err.response?.data;
          throw new Error(body?.message ?? "Failed to submit lead");
        }
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  return { isSubmitting, generateLead };
}

const trackedViews = new Set<number>();

export function useGenerateView() {
  const generateView = useCallback(async (vehicleId: number) => {
    if (trackedViews.has(vehicleId)) return;
    trackedViews.add(vehicleId);
    try {
      const headers = await getHeaders();
      await apiClient.get(
        `/api/lead/generate-view/${vehicleId}`,
        { headers }
      );
    } catch {
      trackedViews.delete(vehicleId);
    }
  }, []);

  return { generateView };
}
