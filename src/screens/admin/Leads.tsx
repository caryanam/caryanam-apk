import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import ScreenWrapper from "../../components/shared/ScreenWrapper";
import { useAdminLeads, type AdminLead } from "../../hooks/admin/useAdminLeads";
import { Search, RefreshCw, MapPin, X } from "lucide-react-native";
import { formatDate } from "../../utils/helpers";
import Skeleton from "../../components/ui/Skeleton";

const SearchIcon = Search as any;
const RefreshCwIcon = RefreshCw as any;
const MapPinIcon = MapPin as any;
const XIcon = X as any;

export default function AdminLeads() {
  const [search, setSearch] = useState("");
  const { data: leads = [], isLoading, error, refetch, isFetching } = useAdminLeads();

  const getVehicleLabel = (v: AdminLead["vehicleName"]) => {
    try {
      if (typeof v === "object" && v !== null)
        return `${v.brand} ${v.model} ${v.variant}`;
      return String(v ?? "");
    } catch {
      return "";
    }
  };

  const filtered = leads.filter((l: AdminLead) => {
    try {
      const vehicle = getVehicleLabel(l.vehicleName);
      return (
        l.customerName?.toLowerCase().includes(search.toLowerCase()) ||
        vehicle.toLowerCase().includes(search.toLowerCase()) ||
        l.customerCity?.toLowerCase().includes(search.toLowerCase()) ||
        l.customerMobile?.includes(search)
      );
    } catch {
      return true;
    }
  });

  const getLeadStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "NEW": return { bg: "#dbeafe", text: "#1e40af" };
      case "CONTACTED": return { bg: "#fef3c7", text: "#92400e" };
      case "PENDING": return { bg: "#fef3c7", text: "#92400e" };
      case "SOLD": 
      case "CONVERTED": return { bg: "#d1fae5", text: "#065f46" };
      case "CLOSED": return { bg: "#f1f5f9", text: "#64748b" };
      case "LOST": return { bg: "#fee2e2", text: "#991b1b" };
      default: return { bg: "#f1f5f9", text: "#475569" };
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
    <View key={key} style={styles.richCard}>
      <View style={styles.richCardHeader}>
        <Skeleton style={{ width: 100, height: 16, borderRadius: 4 }} />
        <Skeleton style={{ width: 60, height: 20, borderRadius: 12 }} />
      </View>
      <View style={styles.richCardBody}>
        <Skeleton style={{ width: 48, height: 48, borderRadius: 24, marginRight: 12 }} />
        <View style={styles.carInfo}>
          <Skeleton style={{ width: 140, height: 16, marginBottom: 6, borderRadius: 4 }} />
          <Skeleton style={{ width: 100, height: 12, marginBottom: 8, borderRadius: 4 }} />
          <Skeleton style={{ width: 160, height: 14, borderRadius: 4 }} />
        </View>
      </View>
      <View style={styles.richCardFooter}>
        <Skeleton style={{ width: 100, height: 16, borderRadius: 4 }} />
        <Skeleton style={{ width: 80, height: 16, borderRadius: 4 }} />
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
            placeholder="Search customer, vehicle, city..."
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
            placeholderTextColor="#94a3b8"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")} style={{ padding: 4 }}>
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

      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 }}>
        <Text style={{ fontSize: 13, color: "#64748b", fontWeight: "700" }}>Total Leads: {filtered.length}</Text>
      </View>

      {isLoading ? (
        <ScrollView
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        >
          {renderSkeletonCard(1)}
          {renderSkeletonCard(2)}
          {renderSkeletonCard(3)}
          {renderSkeletonCard(4)}
        </ScrollView>
      ) : filtered.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No customer leads found.</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isFetching} onRefresh={refetch} />
          }
        >
          {filtered.map((l: AdminLead, idx: number) => {
            const statusColor = getLeadStatusColor(l.leadStatus);
            const avatarColor = getAvatarColor(l.customerName);
            const vehicleLabel = getVehicleLabel(l.vehicleName);
            
            return (
              <View key={l.id} style={styles.richCard}>
                <View style={styles.richCardHeader}>
                  <Text style={styles.srNo}>#{idx + 1} • ID: {l.uniqueLeadId || "-"}</Text>
                  <View style={[styles.statusPill, { backgroundColor: statusColor.bg }]}>
                    <Text style={[styles.statusPillText, { color: statusColor.text }]}>{l.leadStatus}</Text>
                  </View>
                </View>
                <View style={styles.richCardBody}>
                  <View style={[styles.leadAvatar, { backgroundColor: avatarColor, shadowColor: avatarColor, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 }]}>
                    <Text style={[styles.leadAvatarText, { color: "#ffffff" }]}>{l.customerName?.charAt(0)?.toUpperCase()}</Text>
                  </View>
                  <View style={styles.carInfo}>
                    <Text style={styles.itemTitle}>{l.customerName}</Text>
                    <Text style={styles.itemSubtitle}>{l.customerMobile}</Text>
                    <Text style={styles.itemLeadDetails}>Enquiry: <Text style={{fontWeight: "800", color: "#0f172a"}}>{vehicleLabel || "—"}</Text></Text>
                  </View>
                </View>
                <View style={styles.richCardFooter}>
                  <View style={styles.footerCol}>
                    <Text style={styles.footerLabel}>Location</Text>
                    <Text style={styles.footerValue}><MapPinIcon size={10} color="#64748b" /> {l.customerCity || "—"}</Text>
                  </View>
                  <View style={styles.footerColRight}>
                    <Text style={styles.footerLabel}>Date</Text>
                    <Text style={styles.footerValue}>{formatDate(l.enquiryDate)}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
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
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    marginTop: 40,
  },
  emptyText: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "600",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 60,
  },
  richCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "rgba(0,0,0,0.1)",
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  richCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingBottom: 10,
    marginBottom: 10,
  },
  srNo: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94a3b8",
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusPillText: {
    fontSize: 9,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  richCardBody: {
    flexDirection: "row",
    alignItems: "center",
  },
  leadAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  leadAvatarText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#64748b",
  },
  carInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#0f172a",
    textTransform: "capitalize",
  },
  itemSubtitle: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
    fontWeight: "600",
  },
  itemLeadDetails: {
    fontSize: 11,
    color: "#475569",
    fontWeight: "600",
    marginTop: 4,
    textTransform: "capitalize",
  },
  richCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 10,
    marginTop: 12,
  },
  footerCol: {
    flex: 1,
  },
  footerColRight: {
    alignItems: "flex-end",
  },
  footerLabel: {
    fontSize: 9,
    color: "#94a3b8",
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  footerValue: {
    fontSize: 11,
    color: "#475569",
    fontWeight: "600",
    textTransform: "capitalize",
  },
});
