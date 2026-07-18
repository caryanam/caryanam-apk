import React, { useState } from "react";
import { View, Text, StyleSheet, Alert, TextInput, TouchableOpacity, ActivityIndicator, Modal, ScrollView } from "react-native";
import ScreenWrapper from "../../components/shared/ScreenWrapper";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { ENV } from "../../utils/env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DeviceEventEmitter } from "react-native";

export default function DeleteAccount() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();

  const handlePreSubmit = () => {
    if (!username || !password) {
      Alert.alert("Error", "Please enter both username and password");
      return;
    }
    setModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    setModalVisible(false);
    setLoading(true);
    try {
      const url = `${ENV.API_BASE_URL}/api/customer/delete-account`;
      const response = await axios.delete(url, {
        data: {
          username,
          password
        }
      });
      Alert.alert("Success", response.data || "Customer account deleted successfully.");
      await AsyncStorage.removeItem("customerToken");
      await AsyncStorage.removeItem("customer");
      DeviceEventEmitter.emit("customerAuthChanged");
      navigation.goBack();
    } catch (error: any) {
      const msg = error.response?.data?.message || "Failed to delete account. Please check your credentials.";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper title="Delete Account" showBack layoutType="public">
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header Area */}
        <View style={styles.headerArea}>
          <Text style={styles.mainTitle}>Delete Your Account</Text>
          <Text style={styles.headerSubtext}>
            Enter your registered email or phone number and password to request deletion of your Caryanam account. This flow is for customers and dealers who want to permanently remove account access.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>🗑️</Text>
            </View>
            <Text style={styles.title}>Delete Your Caryanam Account</Text>
          </View>
          
          <Text style={styles.policyText}>
            At Caryanam, we respect your privacy and give you control over your account information. You can request account deletion by verifying your registered email or phone number and password.
          </Text>
          <Text style={styles.policyText}>
            Once deletion is confirmed, your login access, profile details, saved cars, uploaded documents, payment verification records, dealer/customer records, and account-related information may be removed from our platform.
          </Text>
          <Text style={styles.policyText}>
            Some information may be retained where required for legal, payment, security, dispute resolution, audit, or compliance purposes.
          </Text>
          <Text style={styles.policyText}>
            Before deleting your account, make sure you have no active car purchases, pending payments, or unresolved service issues.
          </Text>

          <View style={styles.divider} />

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email Address / Phone Number</Text>
            <TextInput 
              style={styles.input}
              placeholder="Enter your registered email or phone number"
              placeholderTextColor="#94a3b8"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              keyboardType="default"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput 
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#94a3b8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity 
            style={styles.deleteBtn}
            onPress={handlePreSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.deleteBtnText}>Request Account Deletion</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Absolute Certainty?</Text>
            <Text style={styles.modalText}>
              This action cannot be undone. This will permanently delete your account and remove all of your data from our servers immediately.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmDelete}>
                <Text style={styles.confirmBtnText}>Yes, delete account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 32,
    paddingBottom: 40,
    backgroundColor: "#f4f7f9",
    flexGrow: 1
  },
  headerArea: {
    marginBottom: 24,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: 12,
  },
  headerSubtext: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 22,
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 18,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    flex: 1
  },
  policyText: {
    fontSize: 13,
    color: "#475569",
    marginBottom: 14,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 14,
    fontSize: 14,
    color: "#0f172a",
    backgroundColor: "#f4f7f9",
  },
  deleteBtn: {
    backgroundColor: "#d92d20",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    alignSelf: "flex-start",
    marginTop: 8,
    paddingHorizontal: 24
  },
  deleteBtnText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#dc2626",
    marginBottom: 12,
  },
  modalText: {
    fontSize: 15,
    color: "#475569",
    lineHeight: 22,
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  cancelBtnText: {
    color: "#475569",
    fontWeight: "700",
    fontSize: 15,
  },
  confirmBtn: {
    backgroundColor: "#dc2626",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  confirmBtnText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 15,
  }
});
