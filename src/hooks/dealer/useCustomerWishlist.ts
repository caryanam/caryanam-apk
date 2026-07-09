import { useQuery } from "@tanstack/react-query";
import apiClient from "../../lib/apiClient";

export interface CustomerWishlistItem {
  vehicleId: number;
  vehicleName: string;
  customerId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  addedAt: string;
}

export function useCustomerWishlist(dealerId: string) {
  return useQuery<CustomerWishlistItem[], Error>({
    queryKey: ["customer-wishlist", dealerId],
    queryFn: async () => {
      if (!dealerId) return [];
      try {
        const { data: body } = await apiClient.get(
          `/api/wishlist/dealer/${dealerId}`
        );
        const list = Array.isArray(body) ? body : (body?.data ?? []);
        return list as CustomerWishlistItem[];
      } catch (err) {
        console.error("Failed to fetch customer wishlist", err);
        return [];
      }
    },
    enabled: !!dealerId,
  });
}
