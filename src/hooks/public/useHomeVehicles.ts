import { useQuery } from "@tanstack/react-query";
import type { Vehicle } from "../../types";
import { ENV } from "../../utils/env";

export function useLatestVehicles() {
  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery<
    Vehicle[]
  >({
    queryKey: ["latest-vehicles"],
    queryFn: async () => {
      const res = await fetch(`${ENV.API_BASE_URL}/api/vehicle/latest-vehicles`);
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body?.message ?? "Failed to fetch latest vehicles");
      }
      return Array.isArray(body) ? body : (body.data ?? []);
    },
    staleTime: 1000 * 60 * 2,
  });

  return {
    vehicles: data ?? [],
    loading: isLoading,
    error: isError
      ? (error?.message ?? "Failed to load latest vehicles")
      : null,
    refetch,
    isRefetching,
  };
}

export function useFeaturedVehicles() {
  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery<
    Vehicle[]
  >({
    queryKey: ["featured-vehicles"],
    queryFn: async () => {
      const res = await fetch(`${ENV.API_BASE_URL}/api/vehicle/featured`);
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body?.message ?? "Failed to fetch featured vehicles");
      }
      return Array.isArray(body) ? body : (body.data ?? []);
    },
    staleTime: 1000 * 60 * 2,
  });

  return {
    vehicles: data ?? [],
    loading: isLoading,
    error: isError
      ? (error?.message ?? "Failed to load featured vehicles")
      : null,
    refetch,
    isRefetching,
  };
}
