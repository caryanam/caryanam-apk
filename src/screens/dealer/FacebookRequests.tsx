import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  RefreshControl,
  Alert,
  TextInput,
  ScrollView,
} from "react-native";
import ScreenWrapper from "../../components/shared/ScreenWrapper";
import {
  Share2 as Facebook,
  CheckCircle2,
  Circle,
  AlertCircle,
  Clock,
  XCircle,
  Search,
  HelpCircle,
} from "lucide-react-native";
import {
  useGetDealerFacebookVehicles,
  useSubmitBulkFacebookPost,
} from "../../hooks/dealer/useDealerFacebook";
import { FacebookDealerVehicleStatusDTO } from "../../types/facebook";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=533&fit=crop";

export default function DealerFacebookRequests() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const {
    data: vehicles = [],
    isLoading,
    isRefetching,
    refetch,
    error
  } = useGetDealerFacebookVehicles();

  const submitMutation = useSubmitBulkFacebookPost();

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        `${v.brand} ${v.model} ${v.variant}`.toLowerCase().includes(searchLower) ||
        v.registrationYear.toString().includes(searchLower);

      if (statusFilter === "all") return matchesSearch;
      if (statusFilter === "selectable") return matchesSearch && v.selectable;
      if (statusFilter === "pending")
        return matchesSearch && v.approvalStatus === "PENDING";
      if (statusFilter === "published")
        return matchesSearch && v.publishStatus === "PUBLISHED";
      if (statusFilter === "failed")
        return matchesSearch && (v.publishStatus === "FAILED" || v.approvalStatus === "REJECTED");
      if (statusFilter === "rejected")
        return matchesSearch && v.approvalStatus === "REJECTED";

      return matchesSearch;
    });
  }, [vehicles, search, statusFilter]);

  const totalCount = vehicles.length;
  const pendingCount = vehicles.filter((v) => v.approvalStatus === "PENDING").length;
  const publishedCount = vehicles.filter((v) => v.publishStatus === "PUBLISHED").length;
  const failedCount = vehicles.filter(
    (v) => v.publishStatus === "FAILED" || v.approvalStatus === "REJECTED"
  ).length;

  const handleSelectOne = (vehicleId: number) => {
    setSelectedIds((prev) => {
      if (prev.includes(vehicleId)) {
        return prev.filter((id) => id !== vehicleId);
      } else {
        if (prev.length >= 10) {
          Alert.alert("Limit Reached", "You can request a maximum of 10 vehicles at a time.");
          return prev;
        }
        return [...prev, vehicleId];
      }
    });
  };

  const handleSubmit = () => {
    if (selectedIds.length === 0) return;
    submitMutation.mutate(
      { vehicleIds: selectedIds },
      {
        onSuccess: (data) => {
          Alert.alert(
            "Success",
            `Submitted successfully! Accepted: ${data.acceptedCount}, Skipped: ${data.skippedCount}`
          );
          setSelectedIds([]);
          refetch();
        },
        onError: (err) => {
          Alert.alert("Error", err.message || "Failed to submit request");
        },
      }
    );
  };

  const renderApprovalStatus = (v: FacebookDealerVehicleStatusDTO) => {
    if (v.approvalStatus === "PENDING") {
      return (
        <View style={[styles.badge, { backgroundColor: "#fffbeb", borderColor: "#fde68a" }]}>
          <Clock size={12} color="#b45309" />
          <Text style={[styles.badgeText, { color: "#b45309" }]}>Pending Review</Text>
        </View>
      );
    }
    if (v.approvalStatus === "APPROVED") {
      return (
        <View style={[styles.badge, { backgroundColor: "#ecfdf5", borderColor: "#a7f3d0" }]}>
          <CheckCircle2 size={12} color="#047857" />
          <Text style={[styles.badgeText, { color: "#047857" }]}>Approved</Text>
        </View>
      );
    }
    if (v.approvalStatus === "REJECTED") {
      return (
        <View style={[styles.badge, { backgroundColor: "#fff1f2", borderColor: "#fecdd3" }]}>
          <XCircle size={12} color="#be123c" />
          <Text style={[styles.badgeText, { color: "#be123c" }]}>Rejected</Text>
        </View>
      );
    }
    return (
      <View style={[styles.badge, { backgroundColor: "#f8fafc", borderColor: "#e2e8f0" }]}>
        <Text style={[styles.badgeText, { color: "#64748b" }]}>No Request</Text>
      </View>
    );
  };

  const renderPublishStatus = (v: FacebookDealerVehicleStatusDTO) => {
    if (v.publishStatus === "QUEUED" || v.publishStatus === "PROCESSING" || v.publishStatus === "RETRY_SCHEDULED") {
      return (
        <View style={[styles.badge, { backgroundColor: "#f0f9ff", borderColor: "#bae6fd" }]}>
          <Clock size={12} color="#0369a1" />
          <Text style={[styles.badgeText, { color: "#0369a1" }]}>Processing</Text>
        </View>
      );
    }
    if (v.publishStatus === "PUBLISHED") {
      return (
        <View style={[styles.badge, { backgroundColor: "#ecfdf5", borderColor: "#a7f3d0" }]}>
          <CheckCircle2 size={12} color="#047857" />
          <Text style={[styles.badgeText, { color: "#047857" }]}>Published</Text>
        </View>
      );
    }
    if (v.publishStatus === "FAILED") {
      return (
        <View style={[styles.badge, { backgroundColor: "#fff1f2", borderColor: "#fecdd3" }]}>
          <AlertCircle size={12} color="#be123c" />
          <Text style={[styles.badgeText, { color: "#be123c" }]}>Failed</Text>
        </View>
      );
    }
    return (
      <View style={[styles.badge, { backgroundColor: "#f8fafc", borderColor: "#e2e8f0" }]}>
        <Text style={[styles.badgeText, { color: "#64748b" }]}>Not Started</Text>
      </View>
    );
  };

  const renderFilterButton = (id: string, label: string) => {
    const isActive = statusFilter === id;
    return (
      <TouchableOpacity
        style={[styles.filterBtn, isActive && styles.filterBtnActive]}
        onPress={() => setStatusFilter(id)}
      >
        <Text style={[styles.filterBtnText, isActive && styles.filterBtnTextActive]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  if (isLoading && vehicles.length === 0) {
    return (
      <ScreenWrapper layoutType="dealer" scrollEnabled={false}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#1877F2" />
          <Text style={styles.loadingText}>Loading vehicles...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (error) {
    return (
      <ScreenWrapper layoutType="dealer" scrollEnabled={false}>
        <View style={styles.centerContainer}>
          <AlertCircle size={40} color="#ef4444" />
          <Text style={styles.errorText}>Failed to load vehicles</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper layoutType="dealer" scrollEnabled={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Facebook size={28} color="#1877F2" fill="#1877F2" />
          <Text style={styles.headerTitle}>Facebook Publishing</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          Request, track, and manage your vehicle auto-posts on the official Facebook Page.
        </Text>
      </View>

      {/* Stats Cards */}
      <View style={{ marginBottom: 16 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statCardTop}>
              <Text style={styles.statCardTitle}>Total Vehicles</Text>
              <View style={[styles.iconWrapper, { backgroundColor: '#f1f5f9' }]}>
                <HelpCircle size={14} color="#475569" />
              </View>
            </View>
            <Text style={[styles.statCardValue, { color: '#0f172a' }]}>{totalCount}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statCardTop}>
              <Text style={styles.statCardTitle}>Pending Review</Text>
              <View style={[styles.iconWrapper, { backgroundColor: '#fffbeb' }]}>
                <Clock size={14} color="#b45309" />
              </View>
            </View>
            <Text style={[styles.statCardValue, { color: '#b45309' }]}>{pendingCount}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statCardTop}>
              <Text style={styles.statCardTitle}>Published Posts</Text>
              <View style={[styles.iconWrapper, { backgroundColor: '#ecfdf5' }]}>
                <CheckCircle2 size={14} color="#047857" />
              </View>
            </View>
            <Text style={[styles.statCardValue, { color: '#047857' }]}>{publishedCount}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statCardTop}>
              <Text style={styles.statCardTitle}>Failed / Rejected</Text>
              <View style={[styles.iconWrapper, { backgroundColor: '#fff1f2' }]}>
                <AlertCircle size={14} color="#be123c" />
              </View>
            </View>
            <Text style={[styles.statCardValue, { color: '#be123c' }]}>{failedCount}</Text>
          </View>
        </ScrollView>
      </View>

      {/* Search & Filters */}
      <View style={styles.filterSection}>
        <View style={styles.searchContainer}>
          <Search size={18} color="#94a3b8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by brand, model or year..."
            placeholderTextColor="#94a3b8"
            value={search}
            onChangeText={setSearch}
          />
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterBtnsScroll}>
          {renderFilterButton("all", "All")}
          {renderFilterButton("selectable", "Selectable")}
          {renderFilterButton("pending", "Pending")}
          {renderFilterButton("published", "Published")}
          {renderFilterButton("failed", "Failed/Rejected")}
        </ScrollView>
      </View>

      {/* Main List */}
      <FlatList
        data={filteredVehicles}
        keyExtractor={(item) => item.vehicleId.toString()}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: selectedIds.length > 0 ? 120 : 20 }}
        refreshControl={<RefreshControl refreshing={isLoading || isRefetching} onRefresh={refetch} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {search || statusFilter !== 'all' ? "No matching vehicles found." : "No vehicles found."}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const isSelected = selectedIds.includes(item.vehicleId);
          return (
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={() => item.selectable && handleSelectOne(item.vehicleId)}
              style={[styles.vehicleCard, isSelected && styles.vehicleCardSelected]}
            >
              <View style={styles.vehicleCardLeft}>
                <View style={styles.checkboxContainer}>
                  {isSelected ? (
                    <CheckCircle2 size={24} color="#1877F2" fill="#e0f2fe" />
                  ) : (
                    <Circle size={24} color={item.selectable ? "#cbd5e1" : "#f1f5f9"} />
                  )}
                </View>
                <Image
                  source={{ uri: item.primaryImageUrl || FALLBACK_IMG }}
                  style={styles.vehicleImage}
                />
                <View style={styles.vehicleInfo}>
                  <Text style={styles.vehicleName} numberOfLines={1}>
                    {item.registrationYear} {item.brand} {item.model}
                  </Text>
                  <Text style={styles.vehicleVariant} numberOfLines={1}>
                    {item.variant}
                  </Text>
                  <Text style={styles.priceText}>
                    {item.askingPrice ? `₹${item.askingPrice.toLocaleString('en-IN')}` : '—'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.vehicleCardRight}>
                {renderApprovalStatus(item)}
                <View style={{ height: 6 }} />
                {renderPublishStatus(item)}
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Fixed Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <View style={styles.fixedBulkActionBar}>
          <View style={styles.bulkActionInfo}>
            <Facebook size={20} color="#1877F2" fill="#1877F2" />
            <View>
              <Text style={styles.bulkActionText}>
                {selectedIds.length} vehicle{selectedIds.length > 1 ? "s" : ""} selected
              </Text>
              <Text style={styles.bulkActionSubtext}>(Max 10 at a time)</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.bulkSubmitBtn, submitMutation.isPending && styles.bulkSubmitBtnDisabled]}
            onPress={handleSubmit}
            disabled={submitMutation.isPending}
          >
            {submitMutation.isPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Facebook size={16} color="#fff" fill="#fff" />
                <Text style={styles.bulkSubmitBtnText}>Submit Request</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    color: "#64748b",
    fontSize: 14,
    fontWeight: "500",
  },
  errorText: {
    marginTop: 12,
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "700",
  },
  retryBtn: {
    marginTop: 16,
    backgroundColor: "#1e293b",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0f172a",
    marginLeft: 10,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingRight: 32, // extra padding for smooth scroll end
    gap: 12,
  },
  statCard: {
    width: 160,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statCardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  statCardTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
    flex: 1,
    marginRight: 8,
  },
  iconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  filterSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#0f172a",
    height: "100%",
  },
  filterBtnsScroll: {
    gap: 8,
    paddingRight: 16,
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  filterBtnActive: {
    backgroundColor: "#0f172a",
    borderColor: "#0f172a",
  },
  filterBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
  },
  filterBtnTextActive: {
    color: "#fff",
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  vehicleCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#f1f5f9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  vehicleCardSelected: {
    borderColor: "#bfdbfe",
    backgroundColor: "#f0f9ff",
  },
  vehicleCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  checkboxContainer: {
    marginRight: 12,
  },
  vehicleImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: "#f1f5f9",
  },
  vehicleInfo: {
    flex: 1,
    justifyContent: "center",
  },
  vehicleName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 2,
  },
  vehicleVariant: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 4,
  },
  priceText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
  },
  vehicleCardRight: {
    alignItems: "flex-end",
    marginLeft: 12,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  fixedBulkActionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 24, // extra padding for bottom safe area
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  bulkActionInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  bulkActionText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1877F2",
  },
  bulkActionSubtext: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  bulkSubmitBtn: {
    backgroundColor: "#1877F2",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  bulkSubmitBtnDisabled: {
    opacity: 0.7,
  },
  bulkSubmitBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});
