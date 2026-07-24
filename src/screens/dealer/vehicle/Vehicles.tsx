import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  TextInput,
  Image,
  Platform,
} from "react-native";
import ReactNativeBlobUtil from "react-native-blob-util";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../../../navigation/AppNavigator";
import ScreenWrapper from "../../../components/shared/ScreenWrapper";
import Skeleton from "../../../components/ui/Skeleton";
import { useDealerAuth } from "../../../contexts/DealerAuthContext";
import { useGetVehicles } from "../../../hooks/dealer/useGetVehicles";
import { Plus, Edit2, Trash2, Search as SearchIcon, RefreshCw as RefreshCwIcon, X as XIcon, Download as DownloadIcon, Gauge as GaugeIcon, Fuel as FuelIcon, MapPin as MapPinIcon, Calendar as CalendarIcon, Star as StarIcon, ArrowRight as ArrowRightIcon, MessageCircle as MessageCircleIcon, CheckSquare as CheckSquareIcon, Square as SquareIcon } from "lucide-react-native";

const Search = SearchIcon as any;
const RefreshCw = RefreshCwIcon as any;
const X = XIcon as any;
const Download = DownloadIcon as any;
const Gauge = GaugeIcon as any;
const Fuel = FuelIcon as any;
const MapPin = MapPinIcon as any;
const Calendar = CalendarIcon as any;
const Star = StarIcon as any;
const ArrowRight = ArrowRightIcon as any;
const MessageCircle = MessageCircleIcon as any;
const CheckSquare = CheckSquareIcon as any;
const Square = SquareIcon as any;

import { useDeleteVehicle } from "../../../hooks/dealer/useDeleteVehicle";
import { useUpdateVehicleStatus } from "../../../hooks/dealer/useUpdateVehicleStatus";
import { useShareVehicleOnWhatsApp } from "../../../hooks/dealer/useWhatsAppShare";
import Select from "../../../components/ui/Select";
import { formatINR, formatKM } from "../../../utils/helpers";
import { Linking } from "react-native";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=533&fit=crop";

export default function DealerVehicles() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { user } = useDealerAuth();
  const dealerId = user?.id || "";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVehicles, setSelectedVehicles] = useState<number[]>([]);
  const { data: stock = [], isLoading, error, refetch, isRefetching } = useGetVehicles(dealerId);
  const deleteMutation = useDeleteVehicle(dealerId);
  const statusMutation = useUpdateVehicleStatus(dealerId);
  const shareMutation = useShareVehicleOnWhatsApp();

  const handleBulkShareWhatsApp = async () => {
    if (selectedVehicles.length === 0) return;

    if (selectedVehicles.length === 1) {
      shareMutation.mutate(
        { vehicleId: selectedVehicles[0], dealerId },
        {
          onSuccess: (data) => {
            Alert.alert("Success", "Vehicle shared successfully!");
            const url = data.whatsappLink || data.shareUrl;
            if (url) {
              Linking.openURL(url).catch(err => console.error("An error occurred", err));
            }
            setSelectedVehicles([]);
          },
          onError: (err) => Alert.alert("Error", err.message || "Failed to share on WhatsApp"),
        }
      );
      return;
    }

    try {
      let sharedLinks: string[] = [];
      for (const vId of selectedVehicles) {
        const res = await shareMutation.mutateAsync({ vehicleId: vId, dealerId });
        if (res.shareUrl || res.whatsappLink) {
          sharedLinks.push((res.shareUrl || res.whatsappLink) as string);
        }
      }
      Alert.alert("Success", `Successfully shared ${selectedVehicles.length} vehicles!`);
      if (sharedLinks.length > 0) {
        const text = encodeURIComponent(`Check out these vehicles:\n\n${sharedLinks.join('\n\n')}`);
        Linking.openURL(`https://wa.me/?text=${text}`).catch(err => console.error("An error occurred", err));
      }
      setSelectedVehicles([]);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to share some vehicles on WhatsApp");
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete Vehicle",
      "Are you sure you want to delete this vehicle?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteMutation.mutate(id) }
      ]
    );
  };

  const handleStatusChange = (vehicleId: number, status: string) => {
    statusMutation.mutate({ vehicleId, status });
  };

  const handleExportCSV = async () => {
    try {
      if (filteredStock.length === 0) {
        Alert.alert("Export CSV", "No data to export.");
        return;
      }

      const headers = [
        "Brand", "Model", "Variant", "Year", "KM Driven", 
        "Price", "Fuel Type", "Ownership", "City", "Type", "Status", "Finance"
      ].join(",");

      const csvContent = [
        headers,
        ...filteredStock.map((row: any) => [
          `"${row.brand?.replace(/"/g, '""') || ''}"`,
          `"${row.model?.replace(/"/g, '""') || ''}"`,
          `"${row.variant?.replace(/"/g, '""') || ''}"`,
          row.registrationYear,
          row.kilometerDriven,
          row.askingPrice,
          `"${row.fuelType?.replace(/"/g, '""') || ''}"`,
          `"${row.ownershipDetails || ''}"`,
          `"${row.city?.replace(/"/g, '""') || ''}"`,
          `"${row.vehicleType?.replace(/"/g, '""') || ''}"`,
          `"${row.vehicleStatus?.replace(/"/g, '""') || ''}"`,
          `"${row.financeAvailability ? 'Available' : 'Not Available'}"`
        ].join(","))
      ].join("\n");

      const { dirs } = ReactNativeBlobUtil.fs;
      const dirToSave = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.DownloadDir;
      const filename = `inventory_export_${new Date().getTime()}.csv`;
      const path = `${dirToSave}/${filename}`;
      
      await ReactNativeBlobUtil.fs.writeFile(path, csvContent, 'utf8');

      if (Platform.OS === 'ios') {
        ReactNativeBlobUtil.ios.presentOptionsMenu(path);
      } else {
        ReactNativeBlobUtil.android.actionViewIntent(path, 'text/csv');
        Alert.alert("Export Successful", `File saved to Downloads as ${filename}`);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Export Failed", "Could not export CSV file.");
    }
  };

  const getVehicleStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE": return { bg: "#ecfdf5", text: "#047857" };
      case "INACTIVE": return { bg: "#fff1f2", text: "#e11d48" };
      case "FEATURED": return { bg: "#fffbeb", text: "#d97706" };
      default: return { bg: "#f1f5f9", text: "#475569" };
    }
  };

  const filteredStock = stock.filter((v: any) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      `${v.brand || ""} ${v.model || ""} ${v.variant || ""}`
        .toLowerCase()
        .includes(searchLower) ||
      v.city?.toLowerCase().includes(searchLower) ||
      v.fuelType?.toLowerCase().includes(searchLower) ||
      v.transmission?.toLowerCase().includes(searchLower) ||
      v.registrationYear?.toString().includes(searchLower) ||
      v.vehicleType?.toLowerCase().includes(searchLower) ||
      v.vehicleStatus?.toLowerCase().includes(searchLower)
    );
  });

  const handleToggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedVehicles(filteredStock.map((v: any) => v.id));
    } else {
      setSelectedVehicles([]);
    }
  };

  const handleToggleVehicle = (vehicleId: number) => {
    setSelectedVehicles((prev) => 
      prev.includes(vehicleId) ? prev.filter((id) => id !== vehicleId) : [...prev, vehicleId]
    );
  };

  const isFetching = isLoading || isRefetching;

  const renderVehicle = ({ item }: { item: any }) => {
    const imageUrl = item.images && item.images.length > 0 ? item.images[0].url || item.images[0] : FALLBACK_IMG;
    const isPremium = item.vehicleType === "PREMIUM";
    const statusColor = getVehicleStatusColor(item.vehicleStatus || "ACTIVE");
    const isSelected = selectedVehicles.includes(item.id);
    
    return (
      <View style={[styles.card, isSelected && { borderColor: "#16a34a", borderWidth: 2 }]}>
        {/* Top Header - Status */}
        <View style={styles.cardHeader}>
          <TouchableOpacity onPress={() => handleToggleVehicle(item.id)} style={{ marginRight: 12 }}>
            {isSelected ? (
              <CheckSquare size={20} color="#16a34a" />
            ) : (
              <Square size={20} color="#94a3b8" />
            )}
          </TouchableOpacity>
          <View style={styles.titleWrap}>
            <Text style={styles.titleText} numberOfLines={1}>{item.brand} {item.model}</Text>
            <Text style={styles.variantText} numberOfLines={1}>{item.variant}</Text>
          </View>
          <View style={{ width: 110 }}>
            <Select
              value={item.vehicleStatus || "ACTIVE"}
              onValueChange={(val) => handleStatusChange(item.id, val)}
              options={[
                { label: "Active", value: "ACTIVE" },
                { label: "Inactive", value: "INACTIVE" },
                { label: "Featured", value: "FEATURED" }
              ]}
              style={{ marginBottom: 0, height: 32 }}
              triggerStyle={{ backgroundColor: statusColor.bg, borderWidth: 0 }}
              textStyle={{ fontSize: 12, fontWeight: "700", color: statusColor.text }}
            />
          </View>
        </View>

        {/* Body - Image & Specs */}
        <View style={styles.cardBody}>
          <View style={styles.imageWrap}>
            <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
            {isPremium && (
              <View style={styles.premiumBadge}>
                <Star size={10} color="#000" fill="#000" />
              </View>
            )}
          </View>
          
          <View style={styles.specsWrap}>
            <View style={styles.specRow}>
              <View style={styles.specItem}>
                <Calendar size={14} color="#64748b" />
                <Text style={styles.specText}>{item.registrationYear}</Text>
              </View>
              <View style={styles.specItem}>
                <Gauge size={14} color="#64748b" />
                <Text style={styles.specText}>{formatKM(item.kilometerDriven)}</Text>
              </View>
            </View>
            <View style={styles.specRow}>
              <View style={styles.specItem}>
                <Fuel size={14} color="#64748b" />
                <Text style={styles.specText}>{item.fuelType}</Text>
              </View>
              <View style={styles.specItem}>
                <MapPin size={14} color="#64748b" />
                <Text style={styles.specText} numberOfLines={1}>{item.city || "N/A"}</Text>
              </View>
            </View>
            <Text style={styles.priceText}>{formatINR(item.askingPrice)}</Text>
          </View>
        </View>

        {/* Footer - Actions */}
        <View style={styles.cardFooter}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate("DealerVehicleDetails", { vehicleId: String(item.id) })}
          >
            <Text style={styles.actionText}>View Details</Text>
            <ArrowRight size={14} color="#be123c" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
          <View style={styles.rightActions}>
            <TouchableOpacity
              style={[styles.iconBtn, styles.editBtn]}
              onPress={() => navigation.navigate("DealerVehicleForm", { vehicleId: item.id })}
            >
              <Edit2 size={16} color="#0f172a" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconBtn, styles.deleteBtn]}
              onPress={() => handleDelete(String(item.id))}
            >
              <Trash2 size={16} color="#e11d48" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScreenWrapper layoutType="dealer" scrollEnabled={false}>
      <View style={styles.searchHeader}>
        <View style={styles.searchContainer}>
          <Search size={18} color="#e11d48" style={styles.searchIcon} />
          <TextInput
            placeholder="Search cars..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            placeholderTextColor="#94a3b8"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")} style={{ padding: 4 }}>
              <X size={18} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={handleExportCSV} style={styles.actionHeaderBtn}>
          <Download size={16} color="#475569" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => refetch()}
          disabled={isFetching}
          style={styles.actionHeaderBtn}
        >
          {isFetching ? (
            <ActivityIndicator size="small" color="#f43f5e" />
          ) : (
            <RefreshCw size={16} color="#475569" />
          )}
        </TouchableOpacity>
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontSize: 13, color: "#64748b", fontWeight: "700" }}>Total Cars: {filteredStock.length}</Text>
        <TouchableOpacity 
          style={{ flexDirection: "row", alignItems: "center", gap: 6 }} 
          onPress={() => handleToggleSelectAll(selectedVehicles.length !== filteredStock.length)}
        >
          {selectedVehicles.length > 0 && selectedVehicles.length === filteredStock.length ? (
            <CheckSquare size={18} color="#16a34a" />
          ) : (
            <Square size={18} color="#94a3b8" />
          )}
          <Text style={{ fontSize: 13, color: "#475569", fontWeight: "600" }}>Select All</Text>
        </TouchableOpacity>
      </View>

      <View style={{ paddingHorizontal: 20, paddingBottom: 8 }}>
        <TouchableOpacity
          style={[styles.bulkShareBtn, (selectedVehicles.length === 0 || shareMutation.isPending) && { opacity: 0.5 }]}
          onPress={handleBulkShareWhatsApp}
          disabled={selectedVehicles.length === 0 || shareMutation.isPending}
        >
          {shareMutation.isPending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <MessageCircle size={18} color="#fff" />
          )}
          <Text style={styles.bulkShareText}>Share on WhatsApp ({selectedVehicles.length})</Text>
        </TouchableOpacity>
      </View>
      
      {isLoading ? (
        <FlatList
          data={[1, 2, 3]}
          keyExtractor={(i) => String(i)}
          renderItem={() => (
            <View style={[styles.card, { opacity: 0.6 }]}>
              <View style={styles.cardHeader}>
                <View style={styles.titleWrap}>
                  <Skeleton style={{ width: "70%", height: 18, borderRadius: 4, marginBottom: 6 }} />
                  <Skeleton style={{ width: "40%", height: 14, borderRadius: 4 }} />
                </View>
                <Skeleton style={{ width: 90, height: 28, borderRadius: 16 }} />
              </View>
              <View style={styles.cardBody}>
                <Skeleton style={[styles.carImage, { backgroundColor: "#e2e8f0" }]} />
                <View style={styles.carInfo}>
                  <Skeleton style={{ width: "50%", height: 16, borderRadius: 4, marginBottom: 8 }} />
                  <Skeleton style={{ width: "60%", height: 14, borderRadius: 4, marginBottom: 4 }} />
                  <Skeleton style={{ width: "40%", height: 14, borderRadius: 4 }} />
                </View>
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContainer}
        />
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error.message}</Text>
          <TouchableOpacity onPress={() => refetch()} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : filteredStock.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyTitle}>No cars listed</Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery ? "No matching cars found." : "You haven't listed any stock cars in your showroom yet."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredStock}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderVehicle}
          contentContainerStyle={styles.listContainer}
          refreshing={isLoading}
          onRefresh={refetch}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("DealerVehicleForm")}
        activeOpacity={0.8}
      >
        <Plus size={24} color="#fff" />
      </TouchableOpacity>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  searchHeader: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 8,
    alignItems: "center",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 14,
    color: "#0f172a",
  },
  actionHeaderBtn: {
    width: 44,
    height: 44,
    backgroundColor: "#fff",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  errorText: {
    fontSize: 14,
    color: "#ef4444",
    textAlign: "center",
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: "#0f172a",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
  },
  emptySubtitle: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#e11d48",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#e11d48",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
    zIndex: 100,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  titleWrap: {
    flex: 1,
    paddingRight: 12,
  },
  titleText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 2,
  },
  variantText: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
  cardBody: {
    flexDirection: "row",
    padding: 16,
  },
  imageWrap: {
    width: 100,
    height: 80,
    borderRadius: 12,
    overflow: "hidden",
    marginRight: 16,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f1f5f9",
  },
  premiumBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: "#fbbf24",
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  specsWrap: {
    flex: 1,
    justifyContent: "space-between",
  },
  specRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 6,
  },
  specItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  specText: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "600",
  },
  priceText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#e11d48",
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#f8fafc",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  actionText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#be123c",
  },
  rightActions: {
    flexDirection: "row",
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  editBtn: {
    backgroundColor: "#f1f5f9",
    borderColor: "#e2e8f0",
  },
  deleteBtn: {
    backgroundColor: "#fff1f2",
    borderColor: "#ffe4e6",
  },
  bulkShareBtn: {
    backgroundColor: "#22c55e",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  bulkShareText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
});
