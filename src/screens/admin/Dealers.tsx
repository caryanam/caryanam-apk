import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import ScreenWrapper from "../../components/shared/ScreenWrapper";
import { useAdminDealers, useUpdateDealerStatus } from "../../hooks/admin/useAdminDealers";
import { Search, Check, MapPin, Phone, Calendar, X, RefreshCw } from "lucide-react-native";
import Skeleton from "../../components/ui/Skeleton";

const SearchIcon = Search as any;
const CheckIcon = Check as any;
const MapPinIcon = MapPin as any;
const PhoneIcon = Phone as any;
const CalendarIcon = Calendar as any;
const XIcon = X as any;
const RefreshCwIcon = RefreshCw as any;

import { formatDate } from "../../utils/helpers";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../../navigation/AppNavigator";

export default function AdminDealers() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const { data: dealers = [], isLoading, refetch, isFetching } = useAdminDealers();
  const { mutate: updateStatus } = useUpdateDealerStatus();

  const filtered = dealers.filter(
    (d: any) =>
      d.businessName.toLowerCase().includes(search.toLowerCase()) ||
      d.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      d.city.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedDealers = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleApprove = (dealerId: number) => {
    Alert.alert(
      "Approve Dealer",
      "Are you sure you want to approve this showroom dealership request?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Approve",
          style: "default",
          onPress: () => {
            updateStatus(
              { dealerId, status: "Approved" },
              {
                onSuccess: () => {
                  Alert.alert("Success", "Dealer has been approved successfully!");
                },
                onError: (err: any) => {
                  Alert.alert("Error", err?.response?.data?.message || "Failed to approve dealer");
                },
              }
            );
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "APPROVED":
        return "#10b981"; // Emerald
      case "PENDING":
        return "#f59e0b"; // Warning
      case "SUSPENDED":
        return "#64748b"; // Slate
      case "REJECTED":
        return "#ef4444"; // Red
      default:
        return "#94a3b8";
    }
  };

  const getAvatarColor = (name: string) => {
    if (!name) return "#b49a5b";
    const colors = ["#b49a5b", "#376762", "#4f46e5", "#db2777", "#ea580c"];
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
          <Skeleton style={{ width: "45%", height: 16, borderRadius: 4 }} />
        </View>
      </View>
    </View>
  );

  return (
    <ScreenWrapper layoutType="admin" scrollEnabled={false}>
      {/* Search Header Area */}
      <View style={styles.searchHeader}>
        <View style={styles.searchContainer}>
          <SearchIcon size={18} color="#881337" style={styles.searchIcon} />
          <TextInput
            placeholder="Search business, owner, city..."
            value={search}
            onChangeText={(text) => {
              setSearch(text);
              setCurrentPage(1);
            }}
            style={styles.searchInput}
            placeholderTextColor="#94a3b8"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => {
              setSearch("");
              setCurrentPage(1);
            }} style={{ padding: 4 }}>
              <XIcon size={18} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          onPress={() => refetch()}
          disabled={isFetching}
          style={styles.refreshBtn}
        >
          {isFetching ? (
            <ActivityIndicator size="small" color="#f43f5e" />
          ) : (
            <RefreshCwIcon size={16} color="#475569" />
          )}
        </TouchableOpacity>
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4, backgroundColor: "#f1f5f9" }}>
        <Text style={{ fontSize: 13, color: "#64748b", fontWeight: "700" }}>Total Dealers: {filtered.length}</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={false} // Disable default spinner to show skeleton instead
            onRefresh={() => refetch()} 
            tintColor="transparent" // Hide default spinner for pull-to-refresh
            colors={["transparent"]}
          />
        }
      >
        {isLoading || isFetching ? (
          <>
            {renderSkeletonCard(1)}
            {renderSkeletonCard(2)}
            {renderSkeletonCard(3)}
            {renderSkeletonCard(4)}
          </>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No showroom dealers found.</Text>
          </View>
        ) : (
          <>
            {paginatedDealers.map((dealer: any) => {
            const statusColor = getStatusColor(dealer.dealerAccountStatus);
            const avatarColor = getAvatarColor(dealer.businessName);
            
            return (
              <TouchableOpacity
                key={dealer.id}
                activeOpacity={0.9}
                onPress={() => navigation.navigate("AdminDealerDetails", { id: dealer.id })}
                style={styles.cardWrapper}
              >
                <View style={[styles.card, { borderLeftColor: avatarColor, borderLeftWidth: 6 }]}>
                  {/* Dealer Info Header */}
                  <View style={styles.cardHeader}>
                    <View style={[styles.avatarContainer, { backgroundColor: avatarColor, shadowColor: avatarColor, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 }]}>
                      <Text style={[styles.avatarText, { color: "#ffffff" }]}>
                        {dealer.businessName?.charAt(0)?.toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.headerInfo}>
                      <Text style={styles.businessName} numberOfLines={1}>
                        {dealer.businessName}
                      </Text>
                      <Text style={styles.ownerName} numberOfLines={1}>
                        Owner: {dealer.ownerName}
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
                        {dealer.dealerAccountStatus}
                      </Text>
                    </View>
                  </View>

                  {/* Details Grid */}
                  <View style={styles.detailsGrid}>
                    <View style={styles.detailRow}>
                      <View style={[styles.detailIconBox, { backgroundColor: "#dbeafe" }]}>
                        <MapPinIcon size={14} color="#2563eb" />
                      </View>
                      <Text style={styles.detailText} numberOfLines={1}>
                        {dealer.city}, {dealer.state}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <View style={[styles.detailIconBox, { backgroundColor: "#dcfce7" }]}>
                        <PhoneIcon size={14} color="#16a34a" />
                      </View>
                      <Text style={styles.detailText} numberOfLines={1}>
                        {dealer.dealerMobile}
                      </Text>
                    </View>
                    {dealer.executiveMobile ? (
                      <View style={styles.detailRow}>
                        <View style={[styles.detailIconBox, { backgroundColor: "#f3e8ff" }]}>
                          <PhoneIcon size={14} color="#9333ea" />
                        </View>
                        <Text style={styles.detailText} numberOfLines={1}>
                          Exec: {dealer.executiveMobile}
                        </Text>
                      </View>
                    ) : null}
                    <View style={styles.detailRow}>
                      <View style={[styles.detailIconBox, { backgroundColor: "#ffedd5" }]}>
                        <CalendarIcon size={14} color="#ea580c" />
                      </View>
                      <Text style={styles.detailText} numberOfLines={1}>
                        {formatDate(dealer.createdAt)}
                      </Text>
                    </View>
                  </View>

                  {/* Audit Approval Footer */}
                  {dealer.dealerAccountStatus.toUpperCase() === "PENDING" && (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => handleApprove(dealer.id)}
                      style={styles.approveBtn}
                    >
                      <CheckIcon size={16} color="#fff" />
                      <Text style={styles.approveBtnText}>Approve Dealership</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
          
          {totalPages > 1 && (
            <View style={styles.paginationContainer}>
              <TouchableOpacity
                disabled={currentPage === 1}
                onPress={() => setCurrentPage((prev) => prev - 1)}
                style={[styles.pageBtn, currentPage === 1 && styles.pageBtnDisabled]}
              >
                <Text style={styles.pageBtnText}>Previous</Text>
              </TouchableOpacity>
              <Text style={styles.pageInfo}>
                Page {currentPage} of {totalPages}
              </Text>
              <TouchableOpacity
                disabled={currentPage === totalPages}
                onPress={() => setCurrentPage((prev) => prev + 1)}
                style={[styles.pageBtn, currentPage === totalPages && styles.pageBtnDisabled]}
              >
                <Text style={styles.pageBtnText}>Next</Text>
              </TouchableOpacity>
            </View>
          )}
          </>
        )}
      </ScrollView>
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
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 4,
  },
  pageBtn: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  pageBtnDisabled: {
    opacity: 0.5,
  },
  pageBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
  },
  pageInfo: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "600",
  },
});

