import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, TextInput, ActivityIndicator } from "react-native";
import ScreenWrapper from "../../../components/shared/ScreenWrapper";
import { useGetAdminFacebookDealerSummary } from "../../../hooks/admin/useAdminFacebook";
import { Share2 as Facebook, ChevronRight, RefreshCw, AlertCircle, Clock, Loader2, Inbox, Search, ArrowRight, User } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../../navigation/AppNavigator";

export default function FacebookDealerSummary() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [search, setSearch] = useState("");

  const { data: summaries = [], isLoading, isRefetching, refetch, error } = useGetAdminFacebookDealerSummary();

  const handleRowClick = (dealerId: number) => {
    navigation.navigate("AdminFacebookDealerRequests", { dealerId });
  };

  const filteredSummaries = summaries.filter((s) =>
    s.dealerBusinessName?.toLowerCase().includes(search.toLowerCase())
  );

  const totalDealers = summaries.length;
  const totalPending = summaries.reduce((acc, curr) => acc + curr.pendingCount, 0);
  const totalProcessing = summaries.reduce((acc, curr) => acc + curr.processingCount, 0);
  const totalFailed = summaries.reduce((acc, curr) => acc + curr.failedCount, 0);

  if (error) {
    return (
      <ScreenWrapper layoutType="admin">
        <View style={styles.errorContainer}>
          <AlertCircle size={40} color="#ef4444" />
          <Text style={styles.errorTitle}>Failed to load dealer requests summary</Text>
          <Text style={styles.errorText}>{error.message}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
            <RefreshCw size={16} color="#fff" />
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  const renderHeader = () => (
    <View style={styles.listHeader}>
      <View style={styles.headerTop}>
        <View style={styles.titleRow}>
          <Facebook size={32} color="#1877F2" />
          <Text style={styles.headerTitle}>Facebook Requests</Text>
        </View>
        <TouchableOpacity 
          style={styles.refreshIconBtn} 
          onPress={() => refetch()}
          disabled={isLoading || isRefetching}
        >
          {isLoading || isRefetching ? (
            <ActivityIndicator size="small" color="#64748b" />
          ) : (
            <RefreshCw size={20} color="#64748b" />
          )}
        </TouchableOpacity>
      </View>
      <Text style={styles.headerSubtitle}>
        Overview of dealer-submitted vehicle publishing requests. Click on any dealer to review and publish.
      </Text>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={styles.statContent}>
            <Text style={styles.statLabel}>Dealers</Text>
            <Text style={styles.statValue}>{isLoading ? "-" : totalDealers}</Text>
          </View>
          <View style={[styles.iconBox, { backgroundColor: "#f8fafc" }]}>
            <Inbox size={24} color="#475569" />
          </View>
        </View>
        
        <View style={styles.statCard}>
          <View style={styles.statContent}>
            <Text style={styles.statLabel}>Pending Approval</Text>
            <Text style={[styles.statValue, { color: "#d97706" }]}>{isLoading ? "-" : totalPending}</Text>
          </View>
          <View style={[styles.iconBox, { backgroundColor: "#fffbeb" }]}>
            <Clock size={24} color="#f59e0b" />
          </View>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statContent}>
            <Text style={styles.statLabel}>Processing</Text>
            <Text style={[styles.statValue, { color: "#2563eb" }]}>{isLoading ? "-" : totalProcessing}</Text>
          </View>
          <View style={[styles.iconBox, { backgroundColor: "#eff6ff" }]}>
            <Loader2 size={24} color="#3b82f6" />
          </View>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statContent}>
            <Text style={styles.statLabel}>Failed Items</Text>
            <Text style={[styles.statValue, { color: "#e11d48" }]}>{isLoading ? "-" : totalFailed}</Text>
          </View>
          <View style={[styles.iconBox, { backgroundColor: "#fff1f2" }]}>
            <AlertCircle size={24} color="#f43f5e" />
          </View>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Search size={18} color="#94a3b8" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by dealer business name..."
          placeholderTextColor="#94a3b8"
          value={search}
          onChangeText={setSearch}
        />
      </View>
    </View>
  );

  return (
    <ScreenWrapper layoutType="admin">
      <FlatList
        data={filteredSummaries}
        keyExtractor={(item) => item.dealerId.toString()}
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{search ? "No matching dealers found." : "No dealer Facebook requests found."}</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.listCard} onPress={() => handleRowClick(item.dealerId)} activeOpacity={0.7}>
            <View style={styles.listCardTop}>
              <View style={styles.dealerNameRow}>
                <View style={styles.dealerIconContainer}>
                  <User size={20} color="#3b82f6" />
                </View>
                <View style={styles.dealerNameTextContent}>
                  <Text style={styles.dealerName}>{item.dealerBusinessName || `Dealer ID: ${item.dealerId}`}</Text>
                  <Text style={styles.dealerSubtext}>Tap to review requests</Text>
                </View>
              </View>
              <View style={styles.reviewBtn}>
                <Text style={styles.reviewText}>Review</Text>
                <ArrowRight size={14} color="#1877F2" />
              </View>
            </View>
            <View style={styles.listCardBottom}>
              <View style={styles.listCardStat}>
                <Text style={styles.listCardStatLabel}>PENDING</Text>
                <Text style={[styles.countText, item.pendingCount > 0 ? styles.countPending : styles.countZero]}>{item.pendingCount}</Text>
              </View>
              <View style={styles.listCardStat}>
                <Text style={styles.listCardStatLabel}>PROCESSING</Text>
                <Text style={[styles.countText, item.processingCount > 0 ? { color: "#2563eb" } : styles.countZero]}>{item.processingCount}</Text>
              </View>
              <View style={styles.listCardStat}>
                <Text style={styles.listCardStatLabel}>PUBLISHED</Text>
                <Text style={[styles.countText, item.publishedCount > 0 ? { color: "#059669" } : styles.countZero]}>{item.publishedCount}</Text>
              </View>
              <View style={styles.listCardStat}>
                <Text style={styles.listCardStatLabel}>FAILED</Text>
                <Text style={[styles.countText, item.failedCount > 0 ? styles.countFailed : styles.countZero]}>{item.failedCount}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingBottom: 24, backgroundColor: "#f8fafc" },
  listHeader: { padding: 16 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerTitle: { fontSize: 24, fontWeight: "800", color: "#0f172a" },
  headerSubtitle: { fontSize: 14, color: "#64748b", marginTop: 8, marginBottom: 16 },
  refreshIconBtn: { width: 40, height: 40, backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#e2e8f0", justifyContent: "center", alignItems: "center" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 12, marginBottom: 16 },
  statCard: { width: "48%", backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#f1f5f9", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  statContent: { flex: 1 },
  statLabel: { fontSize: 12, fontWeight: "600", color: "#64748b" },
  statValue: { fontSize: 24, fontWeight: "700", color: "#0f172a", marginTop: 4 },
  iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#e2e8f0", paddingHorizontal: 12, height: 44, marginBottom: 16 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: "#0f172a" },
  listCard: { backgroundColor: "#fff", borderRadius: 20, padding: 16, marginHorizontal: 16, marginBottom: 16, borderWidth: 1, borderColor: "#e2e8f0", shadowColor: "#0f172a", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2 },
  listCardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#f1f5f9", paddingBottom: 16, marginBottom: 16 },
  dealerNameRow: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1, paddingRight: 12 },
  dealerIconContainer: { width: 44, height: 44, borderRadius: 14, backgroundColor: "#eff6ff", justifyContent: "center", alignItems: "center" },
  dealerNameTextContent: { flex: 1 },
  dealerName: { fontSize: 16, fontWeight: "800", color: "#0f172a", marginBottom: 2 },
  dealerSubtext: { fontSize: 12, color: "#64748b" },
  reviewBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#eff6ff", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 24 },
  reviewText: { fontSize: 13, fontWeight: "700", color: "#1877F2" },
  listCardBottom: { flexDirection: "row", justifyContent: "space-between", backgroundColor: "#f8fafc", padding: 12, borderRadius: 14 },
  listCardStat: { alignItems: "center", flex: 1 },
  listCardStatLabel: { fontSize: 10, fontWeight: "800", color: "#94a3b8", marginBottom: 6 },
  countText: { fontSize: 18, fontWeight: "800", textAlign: "center" },
  countZero: { color: "#cbd5e1" },
  countPending: { color: "#d97706" },
  countFailed: { color: "#e11d48" },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 32 },
  errorTitle: { fontSize: 18, fontWeight: "600", color: "#0f172a", marginTop: 16 },
  errorText: { fontSize: 14, color: "#64748b", marginTop: 4, textAlign: "center", marginBottom: 16 },
  retryBtn: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#0f172a", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  retryBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  emptyContainer: { padding: 40, alignItems: "center", backgroundColor: "#fff", marginHorizontal: 16, borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
  emptyText: { fontSize: 14, color: "#64748b", fontWeight: "500" },
});
