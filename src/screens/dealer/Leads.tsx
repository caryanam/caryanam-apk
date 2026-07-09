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
  Platform,
  DeviceEventEmitter,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../../navigation/AppNavigator";
import ReactNativeBlobUtil from "react-native-blob-util";
import ScreenWrapper from "../../components/shared/ScreenWrapper";
import Skeleton from "../../components/ui/Skeleton";
import { useDealerAuth } from "../../contexts/DealerAuthContext";
import { useGetLeads } from "../../hooks/dealer/useGetLeads";
import { useUpdateLeadStatus } from "../../hooks/dealer/useUpdateLeadStatus";
import { formatDate } from "../../utils/helpers";
import Select from "../../components/ui/Select";
import {
  Phone as PhoneIcon,
  MapPin as MapPinIcon,
  Calendar as CalendarIcon,
  ClipboardList as ClipboardListIcon,
  Search as SearchIcon,
  RefreshCw as RefreshCwIcon,
  X as XIcon,
  Download as DownloadIcon,
} from "lucide-react-native";
import type { LeadStatus } from "../../types";

const Phone = PhoneIcon as any;
const MapPin = MapPinIcon as any;
const Calendar = CalendarIcon as any;
const ClipboardList = ClipboardListIcon as any;
const Search = SearchIcon as any;
const RefreshCw = RefreshCwIcon as any;
const X = XIcon as any;
const Download = DownloadIcon as any;

export default function DealerLeads() {
  const { user } = useDealerAuth();
  const dealerId = user?.id || "";

  const [searchQuery, setSearchQuery] = useState("");
  const { data: leads = [], isLoading, error, refetch, isRefetching } = useGetLeads(dealerId);
  const { mutateAsync: updateLeadStatus } = useUpdateLeadStatus(dealerId);

  const handleStatusChange = async (leadId: string, nextStatus: LeadStatus) => {
    try {
      await updateLeadStatus({ leadId, status: nextStatus });
      // Removed alert for seamless UX
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to update lead status.");
    }
  };

  const handleCallCustomer = (mobileNum: string) => {
    Linking.openURL(`tel:${mobileNum}`).catch(() => {
      Alert.alert("Error", "Dialing is not supported on this device.");
    });
  };

  const handleExportCSV = async () => {
    try {
      if (filteredLeads.length === 0) {
        Alert.alert("Export CSV", "No leads to export.");
        return;
      }

      const headers = [
        "Lead ID", "Customer Name", "Mobile", "City", 
        "Vehicle", "Status", "Date"
      ].join(",");

      const csvContent = [
        headers,
        ...filteredLeads.map((row: any) => [
          `"${row.uniqueLeadId || ''}"`,
          `"${row.customerName?.replace(/"/g, '""') || ''}"`,
          `"${row.mobile || ''}"`,
          `"${row.customerCity?.replace(/"/g, '""') || ''}"`,
          `"${row.vehicleTitle?.replace(/"/g, '""') || ''}"`,
          `"${row.status || ''}"`,
          `"${formatDate(row.createdAt)}"`
        ].join(","))
      ].join("\n");

      const { dirs } = ReactNativeBlobUtil.fs;
      const dirToSave = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.DownloadDir;
      const filename = `leads_export_${new Date().getTime()}.csv`;
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

  const filteredLeads = leads.filter((l: any) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      (l.customerName || "").toLowerCase().includes(searchLower) ||
      (l.mobile || "").toLowerCase().includes(searchLower) ||
      (l.customerCity || "").toLowerCase().includes(searchLower) ||
      (l.vehicleTitle || "").toLowerCase().includes(searchLower) ||
      (l.status || "").toLowerCase().includes(searchLower) ||
      (l.uniqueLeadId || "").toLowerCase().includes(searchLower)
    );
  });

  const isFetching = isLoading || isRefetching;

  return (
    <ScreenWrapper layoutType="dealer" scrollEnabled={false}>
      {/* Search Header Area */}
      <View style={styles.searchHeader}>
        <View style={styles.searchContainer}>
          <Search size={18} color="#e11d48" style={styles.searchIcon} />
          <TextInput
            placeholder="Search leads..."
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
        <TouchableOpacity
          onPress={handleExportCSV}
          style={styles.refreshBtn}
        >
          <Download size={16} color="#475569" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => refetch()}
          disabled={isFetching}
          style={styles.refreshBtn}
        >
          {isFetching ? (
            <ActivityIndicator size="small" color="#f43f5e" />
          ) : (
            <RefreshCw size={16} color="#475569" />
          )}
        </TouchableOpacity>
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 }}>
        <Text style={{ fontSize: 13, color: "#64748b", fontWeight: "700" }}>Total Leads: {filteredLeads.length}</Text>
      </View>

      {isLoading ? (
        <FlatList
          data={[1, 2, 3]}
          keyExtractor={(i) => String(i)}
          renderItem={() => (
            <View style={[styles.richCard, { opacity: 0.6 }]}>
              <View style={styles.richCardHeader}>
                <Skeleton style={{ width: 120, height: 16, borderRadius: 4 }} />
                <Skeleton style={{ width: 90, height: 26, borderRadius: 12 }} />
              </View>
              <View style={styles.richCardBody}>
                <Skeleton style={[styles.leadAvatar, { backgroundColor: "#e2e8f0" }]} />
                <View style={styles.carInfo}>
                  <Skeleton style={{ width: "60%", height: 16, borderRadius: 4, marginBottom: 6 }} />
                  <Skeleton style={{ width: "80%", height: 14, borderRadius: 4, marginBottom: 4 }} />
                  <Skeleton style={{ width: "50%", height: 14, borderRadius: 4 }} />
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
      ) : filteredLeads.length === 0 ? (
        <View style={styles.centerContainer}>
          <ClipboardList size={48} color="#cbd5e1" style={{ marginBottom: 12 }} />
          <Text style={styles.emptySubtitle}>
            {searchQuery ? "No matching leads found." : "No leads found."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredLeads}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshing={isLoading}
          onRefresh={refetch}
          renderItem={({ item, index }) => {
            const avatarColor = getAvatarColor(item.customerName);
            const statusColor = getLeadStatusColor(item.status);
            
            return (
              <View style={styles.richCard}>
                <View style={styles.richCardHeader}>
                  <Text style={styles.srNo}>#{index + 1} • ID: {item.uniqueLeadId || "-"}</Text>
                  <View style={styles.selectWrapper}>
                    <Select
                      value={item.status}
                      onValueChange={(val) => handleStatusChange(item.id, val as LeadStatus)}
                      options={["New", "Contacted", "Converted"]}
                      style={{ marginBottom: 0, height: 26, width: 110 }}
                      triggerStyle={{ backgroundColor: statusColor.bg, borderWidth: 0, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, height: 24, minHeight: 24 }}
                      textStyle={{ color: statusColor.text, fontWeight: "900", fontSize: 10, textTransform: "uppercase" }}
                    />
                  </View>
                </View>
                
                <View style={styles.richCardBody}>
                  <View style={[styles.leadAvatar, { backgroundColor: avatarColor, shadowColor: avatarColor, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 }]}>
                    <Text style={[styles.leadAvatarText, { color: "#ffffff" }]}>{(item.customerName || "U")[0].toUpperCase()}</Text>
                  </View>
                  <View style={styles.carInfo}>
                    <Text style={styles.itemTitle}>{item.customerName || "N/A"}</Text>
                    <Text style={styles.itemSubtitle}>{item.mobile}</Text>
                    <Text style={styles.itemLeadDetails}>Enquiry: <Text style={{fontWeight: "800", color: "#0f172a"}}>{item.vehicleTitle || "—"}</Text></Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleCallCustomer(item.mobile)}
                    style={styles.callButton}
                  >
                    <Phone size={14} color="#fff" />
                    <Text style={styles.callBtnText}>Call</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.richCardFooter}>
                  <View style={styles.footerCol}>
                    <Text style={styles.footerLabel}>Location</Text>
                    <Text style={styles.footerValue}><MapPin size={10} color="#64748b" /> {item.customerCity || "—"}</Text>
                  </View>
                  <View style={styles.footerColRight}>
                    <Text style={styles.footerLabel}>Date</Text>
                    <Text style={styles.footerValue}>{formatDate(item.createdAt)}</Text>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  searchHeader: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fff",
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
  refreshBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
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
  selectWrapper: {
    width: 110,
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
  callButton: {
    backgroundColor: "#e11d48",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    shadowColor: "#e11d48",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
    marginLeft: 10,
  },
  callBtnText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
    marginLeft: 4,
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
