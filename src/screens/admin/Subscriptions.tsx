import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import ScreenWrapper from "../../components/shared/ScreenWrapper";
import {
  useAdminSubscriptions,
  useApprovePayment,
} from "../../hooks/admin/useAdminSubscriptions";
import { Search, RefreshCw, CheckCircle, X, Layers, Calendar, CreditCard } from "lucide-react-native";
import Skeleton from "../../components/ui/Skeleton";

export default function AdminSubscriptions() {
  const [subSearch, setSubSearch] = useState("");
  const {
    data: subscriptions = [],
    isLoading: subLoading,
    refetch: refetchSub,
    isFetching: subFetching,
  } = useAdminSubscriptions();

  const approveMutation = useApprovePayment();

  const filteredSubs = subscriptions.filter(
    (s) =>
      s.dealerName?.toLowerCase().includes(subSearch.toLowerCase()) ||
      s.subscriptionPlan?.toLowerCase().includes(subSearch.toLowerCase())
  );

  const handleApprove = (paymentId: number) => {
    Alert.alert(
      "Approve Payment",
      "Are you sure you want to approve this subscription payment?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Approve",
          style: "default",
          onPress: () => {
            approveMutation.mutate(paymentId, {
              onSuccess: () => {
                Alert.alert("Success", "Payment approved successfully!");
              },
              onError: (err: any) => {
                Alert.alert("Error", err?.response?.data?.message ?? "Failed to approve payment");
              }
            });
          }
        }
      ]
    );
  };

  const getAvatarColor = (name: string) => {
    if (!name) return "#881337";
    const colors = ["#b49a5b", "#376762", "#4f46e5", "#db2777", "#ea580c", "#881337"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const renderSkeletonCard = (key: number) => (
    <View key={key} style={styles.cardWrapper}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Skeleton style={[styles.avatarContainer, { borderRadius: 24 }]} />
          <View style={styles.headerInfo}>
            <Skeleton style={{ width: 140, height: 20, marginBottom: 6, borderRadius: 4 }} />
            <Skeleton style={{ width: 100, height: 14, borderRadius: 4 }} />
          </View>
          <Skeleton style={{ width: 70, height: 24, borderRadius: 12 }} />
        </View>
        <View style={styles.detailsGrid}>
          <Skeleton style={{ width: "45%", height: 16, marginBottom: 12, borderRadius: 4 }} />
          <Skeleton style={{ width: "45%", height: 16, marginBottom: 12, borderRadius: 4 }} />
          <Skeleton style={{ width: "45%", height: 16, borderRadius: 4 }} />
        </View>
      </View>
    </View>
  );

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const isActive = item.subscriptionActive;
    const avatarColor = getAvatarColor(item.dealerName);
    const statusColor = isActive ? "#10b981" : "#64748b";

    return (
      <View style={styles.cardWrapper}>
        <View style={[styles.card, { borderLeftColor: avatarColor, borderLeftWidth: 6 }]}>
          
          <View style={styles.cardHeader}>
            <View style={[styles.avatarContainer, { backgroundColor: avatarColor, shadowColor: avatarColor, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 }]}>
              <Text style={[styles.avatarText, { color: "#ffffff" }]}>
                {item.dealerName?.charAt(0)?.toUpperCase() || "D"}
              </Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.businessName} numberOfLines={1}>
                {index + 1}. {item.dealerName}
              </Text>
              <Text style={styles.ownerName} numberOfLines={1}>
                Payment ID: {item.paymentId ?? "—"}
              </Text>
            </View>
            <View style={[styles.statusBadge, { 
              backgroundColor: statusColor + "15", 
              shadowColor: statusColor, 
              shadowOffset: { width: 0, height: 2 }, 
              shadowOpacity: 0.15, 
              shadowRadius: 4, 
              elevation: 2 
            }]}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.statusBadgeText, { color: statusColor }]}>
                {isActive ? "ACTIVE" : "INACTIVE"}
              </Text>
            </View>
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailRow}>
              <View style={[styles.detailIconBox, { backgroundColor: "#eff6ff" }]}>
                <Layers size={14} color="#1d4ed8" />
              </View>
              <Text style={styles.detailText} numberOfLines={1}>
                {item.subscriptionPlan || "No Plan"}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <View style={[styles.detailIconBox, { backgroundColor: "#fdf4ff" }]}>
                <Calendar size={14} color="#c026d3" />
              </View>
              <Text style={styles.detailText} numberOfLines={1}>
                Start: {item.subscriptionStartDate ? new Date(item.subscriptionStartDate).toLocaleDateString() : "—"}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <View style={[styles.detailIconBox, { backgroundColor: "#fef2f2" }]}>
                <Calendar size={14} color="#e11d48" />
              </View>
              <Text style={styles.detailText} numberOfLines={1}>
                End: {item.subscriptionEndDate ? new Date(item.subscriptionEndDate).toLocaleDateString() : "—"}
              </Text>
            </View>
          </View>

          {!isActive && item.paymentId ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleApprove(item.paymentId)}
              disabled={approveMutation.isPending}
              style={styles.approveBtn}
            >
              {approveMutation.isPending ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <CheckCircle size={16} color="#fff" />
                  <Text style={styles.approveBtnText}>Approve Payment</Text>
                </>
              )}
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <ScreenWrapper layoutType="admin" scrollEnabled={false}>
      {/* Search Header Area */}
      <View style={styles.searchHeader}>
        <View style={styles.searchContainer}>
          <Search size={18} color="#881337" style={styles.searchIcon} />
          <TextInput
            placeholder="Search dealer or plan..."
            value={subSearch}
            onChangeText={setSubSearch}
            style={styles.searchInput}
            placeholderTextColor="#94a3b8"
          />
          {subSearch.length > 0 && (
            <TouchableOpacity onPress={() => setSubSearch("")} style={{ padding: 4 }}>
              <X size={18} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          onPress={() => refetchSub()}
          disabled={subFetching}
          style={styles.refreshBtn}
        >
          {subFetching ? (
            <ActivityIndicator size="small" color="#f43f5e" />
          ) : (
            <RefreshCw size={16} color="#475569" />
          )}
        </TouchableOpacity>
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4, backgroundColor: "#f1f5f9" }}>
        <Text style={{ fontSize: 13, color: "#64748b", fontWeight: "700" }}>Total Subscriptions: {filteredSubs.length}</Text>
      </View>

      <FlatList
        data={filteredSubs}
        keyExtractor={(item) => item.dealerId.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={false} // Disable default spinner to show skeleton instead
            onRefresh={() => refetchSub()} 
            tintColor="transparent"
            colors={["transparent"]}
          />
        }
        ListEmptyComponent={
          subLoading || subFetching ? (
            <>
              {renderSkeletonCard(1)}
              {renderSkeletonCard(2)}
              {renderSkeletonCard(3)}
              {renderSkeletonCard(4)}
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {subSearch ? "No matching subscriptions found." : "No subscriptions found."}
              </Text>
            </View>
          )
        }
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  searchHeader: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(136, 19, 55, 0.1)",
    zIndex: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: "rgba(136, 19, 55, 0.1)",
    marginRight: 10,
  },
  refreshBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(136, 19, 55, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#0f172a",
    padding: 0,
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 40,
  },
  emptyText: {
    color: "#64748b",
    fontSize: 15,
    fontWeight: "600",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 80,
    backgroundColor: "#f1f5f9",
  },
  cardWrapper: {
    marginBottom: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: "rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 22,
    fontWeight: "900",
  },
  headerInfo: {
    flex: 1,
    marginLeft: 14,
    marginRight: 10,
  },
  businessName: {
    fontSize: 18,
    fontWeight: "900",
    color: "#000000",
    letterSpacing: -0.3,
  },
  ownerName: {
    fontSize: 13,
    color: "#555555",
    marginTop: 4,
    fontWeight: "600",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 24,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  detailsGrid: {
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
    paddingTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
    marginBottom: 10,
  },
  detailIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  detailText: {
    fontSize: 13,
    color: "#333333",
    marginLeft: 8,
    fontWeight: "600",
  },
  approveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10b981",
    borderRadius: 16,
    height: 48,
    marginTop: 12,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  approveBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
    marginLeft: 8,
  },
});
