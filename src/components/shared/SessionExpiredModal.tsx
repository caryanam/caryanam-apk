import React, { useEffect, useState } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, DeviceEventEmitter } from "react-native";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import { useDealerAuth } from "../../contexts/DealerAuthContext";
import { useCustomerAuth } from "../../contexts/CustomerAuthContext";

export function SessionExpiredModal() {
  const [expiredRole, setExpiredRole] = useState<"admin" | "dealer" | "customer" | null>(null);

  const { logout: adminLogout } = useAdminAuth();
  const { logout: dealerLogout } = useDealerAuth();
  const { logout: customerLogout } = useCustomerAuth();

  useEffect(() => {
    const authSubscription = DeviceEventEmitter.addListener(
      "auth-session-expired",
      (event: { role: "admin" | "dealer" | "customer" }) => {
        setExpiredRole(event.role);
      }
    );

    const customerSubscription = DeviceEventEmitter.addListener(
      "customer-session-expired",
      () => {
        setExpiredRole("customer");
      }
    );

    return () => {
      authSubscription.remove();
      customerSubscription.remove();
    };
  }, []);

  const handleLogin = async () => {
    if (expiredRole === "admin") {
      await adminLogout();
    } else if (expiredRole === "dealer") {
      await dealerLogout();
    } else if (expiredRole === "customer") {
      await customerLogout();
    }
    setExpiredRole(null);
  };

  if (!expiredRole) return null;

  return (
    <Modal visible={!!expiredRole} transparent={true} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Session Expired</Text>
          <Text style={styles.message}>
            Your session has expired. Please login again to continue.
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 24,
    borderRadius: 8,
    width: "80%",
    maxWidth: 400,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  message: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
