import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ENV } from "../../utils/env";

export interface ChatUser {
  id: number;
  name: string;
  role: "ADMIN" | "DEALER" | "CUSTOMER";
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
}

export function useCustomerChatUsers() {
  return useQuery<ChatUser[], Error>({
    queryKey: ["customer-chat-users"],
    queryFn: async () => {
      const token = (await AsyncStorage.getItem("customerToken")) ?? "";
      if (!token) return [];

      const { data } = await axios.get(
        `${ENV.API_BASE_URL}/api/chat/users`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const list: ChatUser[] = Array.isArray(data) ? data : data?.data ?? [];
      return list;
    },
    staleTime: 30_000,
    retry: 1,
  });
}
