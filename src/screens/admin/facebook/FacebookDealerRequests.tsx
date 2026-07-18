import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert, ActivityIndicator, Image, Modal, TextInput } from "react-native";
import ScreenWrapper from "../../../components/shared/ScreenWrapper";
import {
  useGetAdminFacebookDealerRequests,
  useAdminRejectFacebookRequests,
  useAdminBulkApproveFacebookPublish,
} from "../../../hooks/admin/useAdminFacebook";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Share2 as Facebook, CheckSquare, Square, Clock, CheckCircle2, XCircle, ChevronLeft, Loader2, AlertCircle, Calendar, RefreshCw } from "lucide-react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../../navigation/AppNavigator";
import { FacebookAdminVehicleRequestDTO } from "../../../types/facebook";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=533&fit=crop";

export default function FacebookDealerRequests() {
  const route = useRoute();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { dealerId } = route.params as { dealerId: number };

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const { data: requests = [], isLoading, isRefetching, refetch, error } = useGetAdminFacebookDealerRequests(dealerId);

  const rejectMutation = useAdminRejectFacebookRequests(dealerId);
  const approveMutation = useAdminBulkApproveFacebookPublish(dealerId);

  const pendingRequests = requests.filter((r) => r.approvalStatus === "PENDING");
  const filteredRequests = requests;

  const isAllSelected = pendingRequests.length > 0 && pendingRequests.every(r => selectedIds.includes(r.requestId));

  const handleSelectOne = (requestId: number) => {
    setSelectedIds((prev) => {
      if (prev.includes(requestId)) {
        return prev.filter((id) => id !== requestId);
      } else {
        if (prev.length >= 10) {
          Alert.alert("Limit Reached", "You can approve/reject a maximum of 10 requests at a time.");
          return prev;
        }
        return [...prev, requestId];
      }
    });
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      const ids = pendingRequests.map(r => r.requestId).slice(0, 10);
      setSelectedIds(ids);
      if (pendingRequests.length > 10) {
        Alert.alert("Info", "Selected first 10 pending requests (bulk limit).");
      }
    }
  };

  const handleApprove = () => {
    if (selectedIds.length === 0) return;
    approveMutation.mutate(
      { dealerId, requestIds: selectedIds },
      {
        onSuccess: (data) => {
          Alert.alert("Success", "Requests approved and queued for publishing!");
          setSelectedIds([]);
          navigation.navigate("AdminFacebookBatchProgress", { batchId: data.batchId });
        },
        onError: (err) => {
          Alert.alert("Error", err.message || "Failed to approve");
        },
      }
    );
  };

  const handleRejectSubmit = () => {
    if (selectedIds.length === 0) return;
    if (!rejectReason.trim()) {
      Alert.alert("Error", "Please enter a rejection reason.");
      return;
    }
    rejectMutation.mutate(
      { requestIds: selectedIds, reason: rejectReason.trim() },
      {
        onSuccess: () => {
          Alert.alert("Success", "Requests rejected successfully.");
          setIsRejectModalOpen(false);
          setRejectReason("");
          setSelectedIds([]);
        },
        onError: (err) => {
          Alert.alert("Error", err.message || "Failed to reject");
        },
      }
    );
  };

  const renderApprovalStatus = (r: FacebookAdminVehicleRequestDTO) => {
    if (r.approvalStatus === "PENDING") {
      return (
        <View style={[styles.badge, { backgroundColor: "#fffbeb", borderColor: "#fde68a" }]}>
          <Clock size={12} color="#b45309" />
          <Text style={[styles.badgeText, { color: "#b45309" }]}>Pending Review</Text>
        </View>
      );
    }
    if (r.approvalStatus === "APPROVED") {
      return (
        <View style={[styles.badge, { backgroundColor: "#ecfdf5", borderColor: "#a7f3d0" }]}>
          <CheckCircle2 size={12} color="#047857" />
          <Text style={[styles.badgeText, { color: "#047857" }]}>Approved</Text>
        </View>
      );
    }
    if (r.approvalStatus === "REJECTED") {
      return (
        <View style={[styles.badge, { backgroundColor: "#fff1f2", borderColor: "#fecdd3" }]}>
          <XCircle size={12} color="#be123c" />
          <Text style={[styles.badgeText, { color: "#be123c" }]}>Rejected</Text>
        </View>
      );
    }
    return null;
  };

  const renderPublishStatus = (r: FacebookAdminVehicleRequestDTO) => {
    if (r.publishStatus === "QUEUED") {
      return (
        <View style={[styles.badge, { backgroundColor: "#ecfeff", borderColor: "#a5f3fc" }]}>
          <Clock size={12} color="#0369a1" />
          <Text style={[styles.badgeText, { color: "#0369a1" }]}>Queued</Text>
        </View>
      );
    }
    if (r.publishStatus === "PROCESSING") {
      return (
        <View style={[styles.badge, { backgroundColor: "#eff6ff", borderColor: "#bfdbfe" }]}>
          <Loader2 size={12} color="#1d4ed8" />
          <Text style={[styles.badgeText, { color: "#1d4ed8" }]}>Processing</Text>
        </View>
      );
    }
    if (r.publishStatus === "RETRY_SCHEDULED") {
      return (
        <View style={[styles.badge, { backgroundColor: "#fff7ed", borderColor: "#fed7aa" }]}>
          <Clock size={12} color="#c2410c" />
          <Text style={[styles.badgeText, { color: "#c2410c" }]}>Retrying</Text>
        </View>
      );
    }
    if (r.publishStatus === "PUBLISHED") {
      return (
        <View style={[styles.badge, { backgroundColor: "#ecfdf5", borderColor: "#a7f3d0" }]}>
          <CheckCircle2 size={12} color="#047857" />
          <Text style={[styles.badgeText, { color: "#047857" }]}>Published</Text>
        </View>
      );
    }
    if (r.publishStatus === "FAILED") {
      return (
        <View style={[styles.badge, { backgroundColor: "#fff1f2", borderColor: "#fecdd3" }]}>
          <AlertCircle size={12} color="#be123c" />
          <Text style={[styles.badgeText, { color: "#be123c" }]}>Failed</Text>
        </View>
      );
    }
    return (
      <View style={[styles.badge, { backgroundColor: "#f8fafc", borderColor: "#f1f5f9" }]}>
        <Text style={[styles.badgeText, { color: "#94a3b8" }]}>Not Started</Text>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.listHeader}>
      <TouchableOpacity 
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
      >
        <ChevronLeft size={16} color="#64748b" />
        <Text style={styles.backBtnText}>Back to Summaries</Text>
      </TouchableOpacity>
      
      <View style={styles.headerTop}>
        <View style={styles.titleContent}>
          <Text style={styles.headerTitle}>Review Dealer Requests</Text>
          <Text style={styles.headerSubtitle}>
            Select pending vehicle requests for this dealer and approve to auto-publish on Facebook.
          </Text>
        </View>
        <TouchableOpacity style={styles.refreshIconBtn} onPress={() => refetch()} disabled={isLoading || isRefetching}>
          {isLoading || isRefetching ? <ActivityIndicator size="small" color="#64748b" /> : <RefreshCw size={20} color="#64748b" />}
        </TouchableOpacity>
      </View>

      {/* Select All Bar */}
      <View style={styles.selectAllBar}>
        <TouchableOpacity 
          style={styles.selectAllBtn} 
          onPress={handleSelectAll} 
          disabled={pendingRequests.length === 0}
        >
          {isAllSelected ? (
            <CheckSquare size={20} color="#1877F2" fill="#e0f2fe" />
          ) : (
            <Square size={20} color={pendingRequests.length === 0 ? "#e2e8f0" : "#94a3b8"} />
          )}
          <Text style={[styles.selectAllText, pendingRequests.length === 0 && { color: "#94a3b8" }]}>Select All Pending (Max 10)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <ScreenWrapper layoutType="admin" scrollEnabled={false}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1877F2" />
          <Text style={styles.loadingText}>Loading requests...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (error) {
    return (
      <ScreenWrapper layoutType="admin" scrollEnabled={false}>
        <View style={styles.errorContainer}>
          <AlertCircle size={40} color="#ef4444" />
          <Text style={styles.errorTitle}>Failed to load requests</Text>
          <Text style={styles.errorText}>{error.message}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
            <RefreshCw size={16} color="#fff" />
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper layoutType="admin" scrollEnabled={false}>
      <FlatList
        data={filteredRequests}
        keyExtractor={(item) => item.requestId.toString()}
        contentContainerStyle={{ paddingBottom: selectedIds.length > 0 ? 120 : 20 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No requests submitted by this dealer.</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          const isSelected = selectedIds.includes(item.requestId);
          const isPending = item.approvalStatus === "PENDING";

          return (
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={() => isPending ? handleSelectOne(item.requestId) : null}
              style={[styles.listCard, isSelected && styles.listCardSelected, !isPending && styles.listCardDisabled]}
            >
              <View style={styles.listCardHeader}>
                <View style={styles.checkBtnLeft}>
                  {isSelected ? (
                    <CheckSquare size={24} color="#1877F2" fill="#e0f2fe" />
                  ) : (
                    <Square size={24} color={isPending ? "#cbd5e1" : "#f1f5f9"} />
                  )}
                </View>
                <View style={styles.vehicleInfo}>
                  <Image 
                    source={{ uri: item.primaryImageUrl || FALLBACK_IMG }} 
                    style={styles.vehicleImg}
                    defaultSource={{ uri: FALLBACK_IMG }}
                  />
                  <View style={styles.vehicleTextContainer}>
                    <Text style={styles.vehicleName} numberOfLines={1}>{item.registrationYear} {item.brand} {item.model}</Text>
                    <Text style={styles.vehicleVariant} numberOfLines={1}>{item.variant} • {item.fuelType}</Text>
                    <Text style={styles.vehiclePrice}>{item.askingPrice ? `₹${item.askingPrice.toLocaleString("en-IN")}` : "Price N/A"}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.listCardFooter}>
                <View style={styles.badgesRow}>
                  {renderApprovalStatus(item)}
                  {renderPublishStatus(item)}
                </View>
                <View style={styles.dateRow}>
                  <Calendar size={12} color="#94a3b8" />
                  <Text style={styles.dateText}>
                    {new Date(item.requestedAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Fixed Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <View style={styles.fixedBulkActionBar}>
          <View style={styles.bulkActionLeft}>
            <Facebook size={20} color="#1877F2" />
            <Text style={styles.bulkActionText}>{selectedIds.length} request{selectedIds.length > 1 ? "s" : ""} selected</Text>
          </View>
          <View style={styles.bulkActionBtns}>
            <TouchableOpacity 
              style={[styles.btn, styles.btnReject]} 
              onPress={() => setIsRejectModalOpen(true)}
            >
              <Text style={styles.btnRejectText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.btn, styles.btnApprove]} 
              onPress={handleApprove}
              disabled={approveMutation.isPending}
            >
              {approveMutation.isPending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Facebook size={16} color="#fff" fill="#fff" />
              )}
              <Text style={styles.btnApproveText}>Approve</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Modal visible={isRejectModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reject Post Requests</Text>
            <Text style={styles.modalSubtitle}>
              Please enter a reason for rejecting the selected {selectedIds.length} requests. This explanation will be visible to the dealer.
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Mandatory vehicle details missing, inappropriate pricing..."
              placeholderTextColor="#94a3b8"
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
              textAlignVertical="top"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => { setIsRejectModalOpen(false); setRejectReason(""); }}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalConfirmBtn} 
                onPress={handleRejectSubmit}
                disabled={rejectMutation.isPending}
              >
                {rejectMutation.isPending ? <ActivityIndicator size="small" color="#fff" /> : null}
                <Text style={styles.modalConfirmText}>Confirm Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingBottom: 24, backgroundColor: "#f8fafc" },
  listHeader: { padding: 16 },
  backBtn: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  backBtnText: { fontSize: 12, fontWeight: "600", color: "#64748b", marginLeft: 4 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  titleContent: { flex: 1, paddingRight: 16 },
  headerTitle: { fontSize: 24, fontWeight: "800", color: "#0f172a" },
  headerSubtitle: { fontSize: 14, color: "#64748b", marginTop: 4 },
  refreshIconBtn: { width: 40, height: 40, backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#e2e8f0", justifyContent: "center", alignItems: "center" },
  selectAllBar: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 12, padding: 12, marginBottom: 4 },
  selectAllBtn: { flexDirection: "row", alignItems: "center", gap: 8 },
  selectAllText: { fontSize: 14, fontWeight: "700", color: "#0f172a" },
  
  fixedBulkActionBar: { position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#e2e8f0", padding: 16, paddingBottom: 24, shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 10 },
  bulkActionLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  bulkActionText: { fontSize: 14, fontWeight: "800", color: "#1e293b" },
  bulkActionBtns: { flexDirection: "row", gap: 8 },
  btn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, flexDirection: "row", alignItems: "center", gap: 6 },
  btnReject: { borderWidth: 1, borderColor: "#fecdd3", backgroundColor: "#fff1f2" },
  btnRejectText: { fontSize: 13, fontWeight: "800", color: "#e11d48" },
  btnApprove: { backgroundColor: "#1877F2" },
  btnApproveText: { fontSize: 13, fontWeight: "800", color: "#fff" },
  
  listCard: { backgroundColor: "#fff", borderRadius: 20, padding: 16, marginHorizontal: 16, marginBottom: 16, borderWidth: 1, borderColor: "#e2e8f0", shadowColor: "#0f172a", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2 },
  listCardSelected: { borderColor: "#60a5fa", backgroundColor: "#f0f9ff", borderWidth: 2 },
  listCardDisabled: { opacity: 0.85 },
  listCardHeader: { flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#f1f5f9", paddingBottom: 16, marginBottom: 16 },
  checkBtnLeft: { paddingRight: 12 },
  vehicleInfo: { flexDirection: "row", alignItems: "center", gap: 14, flex: 1 },
  vehicleImg: { width: 72, height: 72, borderRadius: 12, borderWidth: 1, borderColor: "#e2e8f0", backgroundColor: "#f8fafc" },
  vehicleTextContainer: { flex: 1, justifyContent: "center" },
  vehicleName: { fontSize: 16, fontWeight: "800", color: "#0f172a", marginBottom: 2 },
  vehicleVariant: { fontSize: 12, color: "#64748b", marginBottom: 6 },
  vehiclePrice: { fontSize: 14, fontWeight: "800", color: "#059669" },
  checkBtn: { padding: 4, justifyContent: "center" },
  listCardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#f8fafc", padding: 12, borderRadius: 14 },
  badgesRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, flex: 1 },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 4, paddingLeft: 8 },
  dateText: { fontSize: 11, fontWeight: "600", color: "#94a3b8" },
  badge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  badgeText: { fontSize: 10, fontWeight: "600" },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 32 },
  errorTitle: { fontSize: 18, fontWeight: "600", color: "#0f172a", marginTop: 16 },
  errorText: { fontSize: 14, color: "#64748b", marginTop: 4, textAlign: "center", marginBottom: 16 },
  retryBtn: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#0f172a", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  retryBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  emptyContainer: { padding: 40, alignItems: "center", backgroundColor: "#fff", marginHorizontal: 16, borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
  emptyText: { fontSize: 14, color: "#64748b", fontWeight: "500" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center", padding: 24 },
  modalContent: { backgroundColor: "#fff", width: "100%", borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#0f172a", marginBottom: 8 },
  modalSubtitle: { fontSize: 14, color: "#64748b", marginBottom: 16 },
  modalInput: { backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 12, padding: 12, height: 100, fontSize: 14, color: "#0f172a", marginBottom: 20 },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 12 },
  modalCancelBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: "#e2e8f0" },
  modalCancelText: { fontSize: 14, fontWeight: "700", color: "#0f172a" },
  modalConfirmBtn: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#e11d48", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  modalConfirmText: { fontSize: 14, fontWeight: "700", color: "#fff" },
});
