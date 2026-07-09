import React, { useState, useEffect } from "react";
import ScreenWrapper from "../../components/shared/ScreenWrapper";
import ChatScreen from "../shared/ChatScreen";
import { useDealerAuth } from "../../contexts/DealerAuthContext";
import { useDealerChatUsers } from "../../hooks/dealer/useDealerChatUsers";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function DealerChat() {
  const { user } = useDealerAuth();
  const dealerId = user?.id || "";

  const [token, setToken] = useState("");

  const { data: users = [] } = useDealerChatUsers();

  useEffect(() => {
    async function loadToken() {
      const stored = await AsyncStorage.getItem("dealerToken");
      setToken(stored || "");
    }
    loadToken();
  }, []);

  return (
    <ScreenWrapper layoutType="dealer" scrollEnabled={false}>
      <ChatScreen
        currentUserId={dealerId ? Number(dealerId) : 0}
        currentUserRole="DEALER"
        token={token}
        users={users}
        label="Customer Chats"
      />
    </ScreenWrapper>
  );
}
