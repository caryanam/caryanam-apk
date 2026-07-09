import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
  ActivityIndicator,
} from "react-native";
import ScreenWrapper from "../../components/shared/ScreenWrapper";
import { useDealerAuth } from "../../contexts/DealerAuthContext";
import { useCustomerWishlist } from "../../hooks/dealer/useCustomerWishlist";
import { formatDate } from "../../utils/helpers";
import {
  Phone as PhoneIcon,
  MapPin as MapPinIcon,
  Calendar as CalendarIcon,
  Heart as HeartIcon,
  Search as SearchIcon,
  RefreshCw as RefreshCwIcon,
  X as XIcon,
  Mail as MailIcon,
  Car as CarIcon,
} from "lucide-react-native";

const Phone = PhoneIcon as any;
const Calendar = CalendarIcon as any;
const Heart = HeartIcon as any;
const Search = SearchIcon as any;
const RefreshCw = RefreshCwIcon as any;
const X = XIcon as any;
const Mail = MailIcon as any;
const Car = CarIcon as any;

export default function DealerWishlist() {
  const { user } = useDealerAuth();
  const dealerId = user?.id?.toString() || "";

  const [searchQuery, setSearchQuery] = useState("");
  const { data: wishlistItems = [], isLoading, refetch, isRefetching } = useCustomerWishlist(dealerId);

  const handleCallCustomer = (mobileNum: string) => {
    Linking.openURL(`tel:${mobileNum}`).catch(() => {
      Alert.alert("Error", "Dialing is not supported on this device.");
    });
  };

  const filteredItems = wishlistItems.filter((item) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      (item.customerName || "").toLowerCase().includes(searchLower) ||
      (item.customerEmail || "").toLowerCase().includes(searchLower) ||
      (item.customerPhone || "").toLowerCase().includes(searchLower) ||
      (item.vehicleName || "").toLowerCase().includes(searchLower)
    );
  });

  const isFetching = isLoading || isRefetching;

  return (
    <ScreenWrapper layoutType="dealer" title="Customer Saves" scrollEnabled={false}>
      {/* Search Header */}
      <View style={styles.headerContainer}>
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Search size={18} color="#94a3b8" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search wishlists..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearIcon}>
                <X size={16} color="#94a3b8" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity 
            style={styles.refreshBtn} 
            onPress={() => refetch()}
            disabled={isFetching}
          >
            {isFetching ? (
              <ActivityIndicator size="small" color="#0f172a" />
            ) : (
              <RefreshCw size={18} color="#0f172a" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsBanner}>
        <Text style={styles.statsText}>
          Total Wishlisted: <Text style={{ fontWeight: "900" }}>{filteredItems.length}</Text>
        </Text>
      </View>

      {/* Main List */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#f43f5e" />
        </View>
      ) : filteredItems.length === 0 ? (
        <View style={styles.centerContainer}>
          <Heart size={48} color="#cbd5e1" style={{ marginBottom: 12 }} />
          <Text style={styles.emptyTitle}>No wishlists found</Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery ? "No matching wishlisted vehicles found." : "Your vehicles have not been wishlisted yet."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item, index) => `${item.customerId}-${item.vehicleId}-${index}`}
          contentContainerStyle={styles.listContainer}
          refreshing={isLoading}
          onRefresh={refetch}
          renderItem={({ item }) => (
            <View style={styles.wishlistCard}>
              <View style={styles.cardHeader}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarInitial}>
                    {(item.customerName || "C")[0].toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.customerName}>{item.customerName || "N/A"}</Text>
                  <Text style={styles.savedDate}>Saved on: {formatDate(item.addedAt)}</Text>
                </View>
                {/* Dial Button */}
                <TouchableOpacity
                  onPress={() => handleCallCustomer(item.customerPhone)}
                  style={styles.callButton}
                >
                  <Phone size={14} color="#fff" />
                  <Text style={styles.callBtnText}>Call</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.vehicleRow}>
                <Car size={16} color="#3b82f6" style={{ marginRight: 8 }} />
                <Text style={styles.vehicleTitle} numberOfLines={2}>{item.vehicleName}</Text>
              </View>

              <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                  <Phone size={12} color="#64748b" style={styles.detailIcon} />
                  <Text style={styles.detailText}>{item.customerPhone || "N/A"}</Text>
                </View>
                <View style={[styles.detailItem, { flex: 1, marginLeft: 12 }]}>
                  <Mail size={12} color="#64748b" style={styles.detailIcon} />
                  <Text style={styles.detailText} numberOfLines={1}>
                    {item.customerEmail || "N/A"}
                  </Text>
                </View>
              </View>
            </View>
          )}
        />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    color: "#0f172a",
  },
  clearIcon: {
    padding: 4,
  },
  refreshBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  statsBanner: {
    backgroundColor: "#f8fafc",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  statsText: {
    fontSize: 13,
    color: "#64748b",
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 6,
    textAlign: "center",
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  wishlistCard: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fce7f3",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: "800",
    color: "#db2777",
  },
  customerName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
    textTransform: "capitalize",
  },
  savedDate: {
    fontSize: 11,
    fontWeight: "600",
    color: "#94a3b8",
    marginTop: 2,
  },
  callButton: {
    backgroundColor: "#16a34a",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    shadowColor: "#16a34a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  callBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 6,
  },
  vehicleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  vehicleTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
  },
  detailsRow: {
    flexDirection: "row",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    alignItems: "center",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailIcon: {
    marginRight: 6,
  },
  detailText: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "600",
  },
});
