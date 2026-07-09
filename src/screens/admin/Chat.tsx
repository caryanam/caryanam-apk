import React, { useState, useEffect } from "react";
import ScreenWrapper from "../../components/shared/ScreenWrapper";
import ChatScreen from "../shared/ChatScreen";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import { useAdminChatUsers } from "../../hooks/admin/useAdminChatUsers";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AdminChat() {
  const { user } = useAdminAuth();
  const adminId = user?.id || "";

  const [token, setToken] = useState("");

  const { data: users = [] } = useAdminChatUsers();

  useEffect(() => {
    async function loadToken() {
      const stored = await AsyncStorage.getItem("adminToken");
      setToken(stored || "");
    }
    loadToken();
  }, []);

  return (
    <ScreenWrapper layoutType="admin" scrollEnabled={false}>
      <ChatScreen
        currentUserId={adminId ? Number(adminId) : 0}
        currentUserRole="ADMIN"
        token={token}
        users={users}
        label="Admin Inbox"
      />
    </ScreenWrapper>
  );
}
