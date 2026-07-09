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
  Image,
} from "react-native";
import ScreenWrapper from "../../components/shared/ScreenWrapper";
import { useAdminAllVehicles } from "../../hooks/admin/useAdminAllVehicles";
import { Search, RefreshCw, MapPin, Gauge, Fuel, Calendar, Star, X } from "lucide-react-native";
import { formatINR, formatKM } from "../../utils/helpers";
import Skeleton from "../../components/ui/Skeleton";

const XIcon = X as any;

const SearchIcon = Search as any;
const RefreshCwIcon = RefreshCw as any;
const MapPinIcon = MapPin as any;
const GaugeIcon = Gauge as any;
const FuelIcon = Fuel as any;
const CalendarIcon = Calendar as any;
const StarIcon = Star as any;

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=533&fit=crop";

export default function AdminVehicles() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { vehicles = [], loading, error, refetch, isRefetching } = useAdminAllVehicles();

  const filtered = vehicles.filter(
    (v: any) =>
      `${v.brand} ${v.model} ${v.variant}`
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      v.city?.toLowerCase().includes(search.toLowerCase()) ||
      v.fuelType?.toLowerCase().includes(search.toLowerCase()) ||
      v.vehicleType?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedVehicles = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return "#10b981"; // Emerald
      case "INACTIVE":
        return "#ef4444"; // Red
      case "FEATURED":
        return "#f59e0b"; // Amber/Gold
      default:
        return "#64748b"; // Slate
    }
  };

  const renderSkeletonCard = (key: number) => (
    <View key={key} style={styles.cardWrapper}>
      <View style={[styles.card, { borderLeftColor: "#e2e8f0" }]}>
        <View style={styles.cardTop}>
          <Skeleton style={styles.thumbnail} />
          <View style={styles.infoCol}>
            <Skeleton style={{ width: 140, height: 16, marginBottom: 6, borderRadius: 4 }} />
            <Skeleton style={{ width: 100, height: 12, marginBottom: 8, borderRadius: 4 }} />
            <Skeleton style={{ width: 80, height: 16, borderRadius: 4 }} />
          </View>
        </View>
        <View style={[styles.specsRow, { justifyContent: "space-between" }]}>
          <Skeleton style={{ width: "22%", height: 14, borderRadius: 4 }} />
          <Skeleton style={{ width: "22%", height: 14, borderRadius: 4 }} />
          <Skeleton style={{ width: "22%", height: 14, borderRadius: 4 }} />
          <Skeleton style={{ width: "22%", height: 14, borderRadius: 4 }} />
        </View>
        <View style={styles.cardFooter}>
          <Skeleton style={{ width: 120, height: 14, borderRadius: 4 }} />
          <Skeleton style={{ width: 70, height: 24, borderRadius: 12 }} />
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
            placeholder="Search brand, model, city, type..."
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
          disabled={isRefetching}
          style={styles.refreshBtn}
        >
          {isRefetching ? (
            <ActivityIndicator size="small" color="#f43f5e" />
          ) : (
            <RefreshCwIcon size={16} color="#475569" />
          )}
        </TouchableOpacity>
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 }}>
        <Text style={{ fontSize: 13, color: "#64748b", fontWeight: "700" }}>Total Vehicles: {filtered.length}</Text>
      </View>

      {loading ? (
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
          <Text style={styles.emptyText}>No listed vehicles found.</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
        >
          {paginatedVehicles.map((v: any, idx: number) => {
            const statusColor = getStatusColor(v.vehicleStatus);
            const image = v.images && v.images.length > 0 ? v.images[0] : FALLBACK_IMG;
            const isPremium = v.vehicleType === "PREMIUM";

            return (
              <View key={v.id || idx} style={styles.cardWrapper}>
                <View style={[styles.card, { borderLeftColor: statusColor }]}>
                  {/* Image and title section */}
                  <View style={styles.cardTop}>
                    <Image source={{ uri: image }} style={styles.thumbnail} />

                    {isPremium && (
                      <View style={styles.premiumTag}>
                        <StarIcon size={9} color="#fff" fill="#fff" />
                        <Text style={styles.premiumTagText}>PREMIUM</Text>
                      </View>
                    )}

                    <View style={styles.infoCol}>
                      <Text style={styles.titleText} numberOfLines={1}>
                        {v.brand} {v.model}
                      </Text>
                      <Text style={styles.variantText} numberOfLines={1}>
                        {v.variant || "Standard"}
                      </Text>
                      <Text style={styles.priceText}>{formatINR(v.askingPrice)}</Text>
                    </View>
                  </View>

                  {/* Spec details row */}
                  <View style={styles.specsRow}>
                    <View style={styles.specItem}>
                      <GaugeIcon size={14} color="#64748b" />
                      <Text style={styles.specText} numberOfLines={1}>
                        {formatKM(v.kilometerDriven)}
                      </Text>
                    </View>
                    <View style={styles.specItem}>
                      <FuelIcon size={14} color="#64748b" />
                      <Text style={styles.specText} numberOfLines={1}>
                        {v.fuelType}
                      </Text>
                    </View>
                    <View style={styles.specItem}>
                      <MapPinIcon size={14} color="#64748b" />
                      <Text style={styles.specText} numberOfLines={1}>
                        {v.city}
                      </Text>
                    </View>
                    <View style={styles.specItem}>
                      <CalendarIcon size={14} color="#64748b" />
                      <Text style={styles.specText} numberOfLines={1}>
                        {v.registrationYear}
                      </Text>
                    </View>
                  </View>

                  {/* Footer status row */}
                  <View style={styles.cardFooter}>
                    <Text style={styles.ownerText}>Dealer: {v.dealerContactName || "Partner"}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor + "15" }]}>
                      <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                      <Text style={[styles.statusBadgeText, { color: statusColor }]}>
                        {v.vehicleStatus}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
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
  loader: {
    marginTop: 40,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyText: {
    color: "#64748b",
    fontSize: 13,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 60,
  },
  cardWrapper: {
    marginBottom: 20,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  card: {
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "rgba(0,0,0,0.1)",
    borderLeftWidth: 4,
    borderRadius: 20,
    padding: 16,
    overflow: "hidden",
  },
  cardTop: {
    flexDirection: "row",
    position: "relative",
  },
  thumbnail: {
    width: 110,
    height: 80,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
  },
  premiumTag: {
    position: "absolute",
    top: 6,
    left: 6,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#d97706",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  premiumTagText: {
    color: "#fff",
    fontSize: 8,
    fontWeight: "900",
    marginLeft: 3,
  },
  infoCol: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  titleText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
  },
  variantText: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
  },
  priceText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#f43f5e",
    marginTop: 4,
  },
  specsRow: {
    flexDirection: "row",
    marginTop: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#f1f5f9",
    paddingVertical: 8,
  },
  specItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  specText: {
    fontSize: 10,
    color: "#475569",
    marginLeft: 4,
    fontWeight: "600",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  ownerText: {
    fontSize: 12,
    color: "#64748b",
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
    fontSize: 9,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
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

