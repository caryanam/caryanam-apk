import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DeviceEventEmitter } from "react-native";
import { ENV } from "../../utils/env";

export interface ChatUser {
  id: number;
  name: string;
  role: "ADMIN" | "DEALER" | "CUSTOMER";
}

export function useAdminChatUsers() {
  return useQuery<ChatUser[], Error>({
    queryKey: ["admin-chat-users"],
    queryFn: async () => {
      const token = (await AsyncStorage.getItem("adminToken")) ?? "";
      if (!token) return [];

      try {
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
      } catch (err: any) {
        if (err.response && err.response.status === 401) {
          DeviceEventEmitter.emit("auth-session-expired", { role: "admin" });
        }
        throw err;
      }
    },
    staleTime: 30_000,
    retry: 1,
  });
}
