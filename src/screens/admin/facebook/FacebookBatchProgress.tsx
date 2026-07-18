import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert, ActivityIndicator } from "react-native";
import ScreenWrapper from "../../../components/shared/ScreenWrapper";
import { useGetAdminFacebookBatchStatus, useAdminRetryFailedFacebookPublish } from "../../../hooks/admin/useAdminFacebook";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Share2 as Facebook, CheckCircle2, XCircle, Clock, AlertCircle, Loader2, ChevronLeft, RefreshCw } from "lucide-react-native";

export default function FacebookBatchProgress() {
  const route = useRoute();
  const navigation = useNavigation();
  const { batchId } = route.params as { batchId: number };

  const { data: batch, isLoading, isRefetching, refetch, error } = useGetAdminFacebookBatchStatus(batchId);
  const retryMutation = useAdminRetryFailedFacebookPublish(batchId);

  const handleRetryFailed = () => {
    retryMutation.mutate(
      { batchId },
      {
        onSuccess: () => {
          Alert.alert("Success", "Retry batch queued! Polling resumed.");
          refetch();
        },
        onError: (err) => {
          Alert.alert("Error", err.message || "Failed to trigger retry");
        },
      }
    );
  };

  const total = batch?.totalCount || 0;
  const success = batch?.successCount || 0;
  const failed = batch?.failedCount || 0;
  const pending = batch?.pendingCount || 0;
  const progressPercent = total > 0 ? ((success + failed) / total) * 100 : 0;

  const isBatchActive = batch?.status === "QUEUED" || batch?.status === "PROCESSING";
  const hasFailedItems = failed > 0;

  const renderBatchStatusBadge = (status: string) => {
    switch (status) {
      case "QUEUED":
        return <View style={[styles.badge, styles.badgeCyan]}><Clock size={12} color="#0369a1" /><Text style={[styles.badgeText, { color: "#0369a1" }]}>Queued</Text></View>;
      case "PROCESSING":
        return <View style={[styles.badge, styles.badgeBlue]}><Loader2 size={12} color="#1d4ed8" /><Text style={[styles.badgeText, { color: "#1d4ed8" }]}>Processing</Text></View>;
      case "COMPLETED":
        return <View style={[styles.badge, styles.badgeEmerald]}><CheckCircle2 size={12} color="#047857" /><Text style={[styles.badgeText, { color: "#047857" }]}>Completed</Text></View>;
      case "PARTIALLY_COMPLETED":
        return <View style={[styles.badge, styles.badgeAmber]}><CheckCircle2 size={12} color="#b45309" /><Text style={[styles.badgeText, { color: "#b45309" }]}>Partially Completed</Text></View>;
      case "FAILED":
        return <View style={[styles.badge, styles.badgeRose]}><XCircle size={12} color="#be123c" /><Text style={[styles.badgeText, { color: "#be123c" }]}>Failed</Text></View>;
      default: return null;
    }
  };

  const renderItemStatusBadge = (status: string) => {
    switch (status) {
      case "QUEUED":
        return <View style={[styles.badge, styles.badgeCyan]}><Clock size={12} color="#0369a1" /><Text style={[styles.badgeText, { color: "#0369a1" }]}>Queued</Text></View>;
      case "PROCESSING":
        return <View style={[styles.badge, styles.badgeBlue]}><Loader2 size={12} color="#1d4ed8" /><Text style={[styles.badgeText, { color: "#1d4ed8" }]}>Processing</Text></View>;
      case "RETRY_SCHEDULED":
        return <View style={[styles.badge, styles.badgeOrange]}><Clock size={12} color="#c2410c" /><Text style={[styles.badgeText, { color: "#c2410c" }]}>Retry Scheduled</Text></View>;
      case "PUBLISHED":
        return <View style={[styles.badge, styles.badgeEmerald]}><CheckCircle2 size={12} color="#047857" /><Text style={[styles.badgeText, { color: "#047857" }]}>Published</Text></View>;
      case "FAILED":
        return <View style={[styles.badge, styles.badgeRose]}><AlertCircle size={12} color="#be123c" /><Text style={[styles.badgeText, { color: "#be123c" }]}>Failed</Text></View>;
      default:
        return <View style={[styles.badge, styles.badgeGray]}><Text style={[styles.badgeText, { color: "#94a3b8" }]}>Pending</Text></View>;
    }
  };

  const renderHeader = () => (
    <View style={styles.listHeader}>
      <TouchableOpacity 
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
        disabled={isBatchActive}
      >
        <ChevronLeft size={16} color={isBatchActive ? "#cbd5e1" : "#64748b"} />
        <Text style={[styles.backBtnText, isBatchActive && { color: "#cbd5e1" }]}>Back to Facebook Requests</Text>
      </TouchableOpacity>

      <View style={styles.headerTop}>
        <View style={styles.titleContent}>
          <View style={styles.titleRow}>
            <Facebook size={32} color="#1877F2" />
            <Text style={styles.headerTitle}>Batch Publishing</Text>
          </View>
          <Text style={styles.headerSubtitle}>
            Live monitoring of Facebook auto-posts for Batch ID: #{batchId}.
          </Text>
        </View>
        <TouchableOpacity style={styles.refreshIconBtn} onPress={() => refetch()} disabled={isLoading || isRefetching}>
          {isLoading || isRefetching ? <ActivityIndicator size="small" color="#64748b" /> : <RefreshCw size={20} color="#64748b" />}
        </TouchableOpacity>
      </View>

      {/* Overview Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Publishing Status</Text>
          {batch && renderBatchStatusBadge(batch.status)}
        </View>
        <View style={styles.cardContent}>
          <View style={styles.progressContainer}>
            <View style={styles.progressTextRow}>
              <Text style={styles.progressText}>Progress ({success + failed} of {total} processed)</Text>
              <Text style={styles.progressText}>{Math.round(progressPercent)}%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
            </View>
          </View>

          <View style={styles.countsGrid}>
            <View style={[styles.countBox, { backgroundColor: "#f8fafc" }]}>
              <Text style={[styles.countLabel, { color: "#64748b" }]}>TOTAL ITEMS</Text>
              <Text style={[styles.countValue, { color: "#0f172a" }]}>{total}</Text>
            </View>
            <View style={[styles.countBox, { backgroundColor: "#fffbeb" }]}>
              <Text style={[styles.countLabel, { color: "#d97706" }]}>PENDING</Text>
              <Text style={[styles.countValue, { color: "#b45309" }]}>{pending}</Text>
            </View>
            <View style={[styles.countBox, { backgroundColor: "#ecfdf5" }]}>
              <Text style={[styles.countLabel, { color: "#059669" }]}>SUCCESSFUL</Text>
              <Text style={[styles.countValue, { color: "#047857" }]}>{success}</Text>
            </View>
            <View style={[styles.countBox, { backgroundColor: "#fff1f2" }]}>
              <Text style={[styles.countLabel, { color: "#e11d48" }]}>FAILED</Text>
              <Text style={[styles.countValue, { color: "#be123c" }]}>{failed}</Text>
            </View>
          </View>

          {!isBatchActive && hasFailedItems && (
            <View style={styles.retrySection}>
              <Text style={styles.retryDesc}>This batch has finished with failed items. You can retry the failed requests.</Text>
              <TouchableOpacity 
                style={styles.retryActionBtn}
                onPress={handleRetryFailed}
                disabled={retryMutation.isPending}
              >
                {retryMutation.isPending ? <ActivityIndicator size="small" color="#fff" /> : <RefreshCw size={16} color="#fff" />}
                <Text style={styles.retryActionText}>Retry Failed Items</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <Text style={styles.listSectionTitle}>Batch Items Details</Text>
    </View>
  );

  if (error) {
    return (
      <ScreenWrapper layoutType="admin">
        <View style={styles.errorContainer}>
          <AlertCircle size={40} color="#ef4444" />
          <Text style={styles.errorTitle}>Failed to load batch status</Text>
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
    <ScreenWrapper layoutType="admin">
      <FlatList
        data={batch?.items || []}
        keyExtractor={(item) => item.requestId.toString()}
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No items in this batch.</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.listCard}>
            <View style={styles.listCardTop}>
              <View style={styles.listCardTitle}>
                <Text style={styles.itemName} numberOfLines={1}>{item.vehicleName || `Vehicle ID: ${item.vehicleId}`}</Text>
                <Text style={styles.itemSubName}>Request #{item.requestId}</Text>
              </View>
              {renderItemStatusBadge(item.status)}
            </View>
            <View style={styles.listCardBottom}>
              <View style={styles.retriesWrapper}>
                <RefreshCw size={14} color="#64748b" style={{ marginRight: 6 }} />
                <Text style={styles.retriesLabel}>Retries: </Text>
                <Text style={styles.retriesText}>{item.retryCount} / 3</Text>
              </View>
              {item.errorMessage ? (
                <View style={styles.errorWrapper}>
                  <AlertCircle size={14} color="#e11d48" />
                  <Text style={styles.itemError} numberOfLines={2}>{item.errorMessage}</Text>
                </View>
              ) : null}
            </View>
          </View>
        )}
      />
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
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle: { fontSize: 24, fontWeight: "800", color: "#0f172a" },
  headerSubtitle: { fontSize: 14, color: "#64748b", marginTop: 4 },
  refreshIconBtn: { width: 40, height: 40, backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#e2e8f0", justifyContent: "center", alignItems: "center" },
  
  card: { backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: "#f1f5f9", marginBottom: 24, overflow: "hidden" },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#f8fafc", paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#0f172a" },
  cardContent: { padding: 20 },
  progressContainer: { marginBottom: 20 },
  progressTextRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  progressText: { fontSize: 12, fontWeight: "700", color: "#475569" },
  progressBarBg: { height: 8, backgroundColor: "#f1f5f9", borderRadius: 4, overflow: "hidden" },
  progressBarFill: { height: "100%", backgroundColor: "#1877F2", borderRadius: 4 },
  
  countsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 12 },
  countBox: { width: "48%", padding: 12, borderRadius: 12, alignItems: "center" },
  countLabel: { fontSize: 10, fontWeight: "800", marginBottom: 4 },
  countValue: { fontSize: 20, fontWeight: "800" },
  
  retrySection: { marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: "#f1f5f9" },
  retryDesc: { fontSize: 12, color: "#64748b", marginBottom: 12 },
  retryActionBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#1877F2", paddingVertical: 12, borderRadius: 12 },
  retryActionText: { color: "#fff", fontSize: 14, fontWeight: "700" },

  listSectionTitle: { fontSize: 18, fontWeight: "800", color: "#0f172a", marginBottom: 16, paddingHorizontal: 16 },
  
  listCard: { backgroundColor: "#fff", borderRadius: 20, padding: 16, marginHorizontal: 16, marginBottom: 16, borderWidth: 1, borderColor: "#e2e8f0", shadowColor: "#0f172a", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2 },
  listCardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  listCardTitle: { flex: 1, paddingRight: 12 },
  itemName: { fontSize: 16, fontWeight: "800", color: "#0f172a", marginBottom: 4 },
  itemSubName: { fontSize: 12, color: "#64748b", fontWeight: "600" },
  listCardBottom: { backgroundColor: "#f8fafc", borderRadius: 12, padding: 12 },
  retriesWrapper: { flexDirection: "row", alignItems: "center" },
  retriesLabel: { fontSize: 13, color: "#64748b", fontWeight: "600" },
  retriesText: { fontSize: 13, fontWeight: "800", color: "#475569" },
  errorWrapper: { flexDirection: "row", alignItems: "flex-start", gap: 6, marginTop: 12, backgroundColor: "#fff1f2", padding: 10, borderRadius: 8, borderWidth: 1, borderColor: "#fecdd3" },
  itemError: { fontSize: 12, color: "#e11d48", flex: 1, fontWeight: "500", lineHeight: 16 },

  badge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  badgeText: { fontSize: 10, fontWeight: "700" },
  badgeCyan: { backgroundColor: "#ecfeff", borderColor: "#a5f3fc" },
  badgeBlue: { backgroundColor: "#eff6ff", borderColor: "#bfdbfe" },
  badgeEmerald: { backgroundColor: "#ecfdf5", borderColor: "#a7f3d0" },
  badgeAmber: { backgroundColor: "#fffbeb", borderColor: "#fde68a" },
  badgeRose: { backgroundColor: "#fff1f2", borderColor: "#fecdd3" },
  badgeOrange: { backgroundColor: "#fff7ed", borderColor: "#fed7aa" },
  badgeGray: { backgroundColor: "#f8fafc", borderColor: "#f1f5f9" },

  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 32 },
  errorTitle: { fontSize: 18, fontWeight: "600", color: "#0f172a", marginTop: 16 },
  errorText: { fontSize: 14, color: "#64748b", marginTop: 4, textAlign: "center", marginBottom: 16 },
  retryBtn: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#0f172a", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  retryBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  emptyContainer: { padding: 40, alignItems: "center", backgroundColor: "#fff", marginHorizontal: 16, borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
  emptyText: { fontSize: 14, color: "#64748b", fontWeight: "500" },
});
