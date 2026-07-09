import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../../navigation/AppNavigator";
import ScreenWrapper from "../../components/shared/ScreenWrapper";
import ChatScreen from "../shared/ChatScreen";
import { useCustomer, getCustomerId } from "../../contexts/CustomerAuthContext";
import Button from "../../components/ui/Button";
import { MessageSquare as MessageSquareIcon } from "lucide-react-native";
const MessageSquare = MessageSquareIcon as any;

export default function CustomerChat() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const customer = useCustomer();
  const isLoggedIn = !!customer;

  // Retrieve customer chat users hook
  const { data: users = [], isLoading, error, refetch } = require("../../hooks/public/useCustomerChatUsers").useCustomerChatUsers();

  if (!isLoggedIn) {
    return (
      <ScreenWrapper layoutType="public" scrollEnabled={false}>
        <View style={styles.centerContainer}>
          <MessageSquare size={48} color="#cbd5e1" style={{ marginBottom: 16 }} />
          <Text style={styles.emptyTitle}>Chat is locked</Text>
          <Text style={styles.emptySubtitle}>
            Please log in with a customer account to chat directly with verified dealership showrooms.
          </Text>
          <Button
            title="Log In / Sign Up"
            onPress={() => {
              import("react-native").then(({ DeviceEventEmitter }) => {
                DeviceEventEmitter.emit("show-auth-modal");
              });
            }}
            style={styles.actionBtn}
          />
        </View>
      </ScreenWrapper>
    );
  }

  const currentUserId = getCustomerId(customer);

  return (
    <ScreenWrapper layoutType="public" scrollEnabled={false}>
      <ChatScreen
        currentUserId={currentUserId ? Number(currentUserId) : 0}
        currentUserRole="CUSTOMER"
        token={customer.token}
        users={users}
        label="My Chats"
        onBack={() => navigation.goBack()}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 18,
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  actionBtn: {
    width: 160,
  },
});
