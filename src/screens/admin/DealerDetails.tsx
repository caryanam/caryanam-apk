import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import ScreenWrapper from "../../components/shared/ScreenWrapper";
import { useRoute, RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "../../navigation/AppNavigator";
import { useAdminDealerDetails } from "../../hooks/admin/useAdminDealerDetails";
import { useAdminDealers } from "../../hooks/admin/useAdminDealers";
import { MapPin, Phone, Landmark, Building, List, Users, Eye, Star, Car } from "lucide-react-native";
import { formatINR, formatDate } from "../../utils/helpers";
import { ENV } from "../../utils/env";
import Skeleton from "../../components/ui/Skeleton";

const MapPinIcon = MapPin as any;
const PhoneIcon = Phone as any;
const LandmarkIcon = Landmark as any;
const BuildingIcon = Building as any;
const ListIcon = List as any;
const UsersIcon = Users as any;
const EyeIcon = Eye as any;
const StarIcon = Star as any;
const CarIcon = Car as any;

type DealerDetailsRouteProp = RouteProp<RootStackParamList, "AdminDealerDetails">;

export default function AdminDealerDetails() {
  const route = useRoute<DealerDetailsRouteProp>();
  const dealerId = Number(route.params?.id);

  const [activeTab, setActiveTab] = useState<"vehicles" | "leads">("vehicles");

  const { data: details, isLoading: isDetailsLoading } = useAdminDealerDetails(dealerId);
  const { data: dealers = [], isLoading: isDealersLoading } = useAdminDealers();
  const dealerInfo = dealers.find((d: any) => d.id === dealerId);

  const getImageUrl = (path?: string | null) => {
    if (!path) return "";
    const cleanPath = path.trim();
    if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) {
      return cleanPath;
    }
    return `${ENV.API_BASE_URL}/${cleanPath}`;
  };

  const getLeadStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "NEW": return { bg: "#dbeafe", text: "#1e40af" };
      case "CONTACTED": return { bg: "#fef3c7", text: "#92400e" };
      case "SOLD": return { bg: "#d1fae5", text: "#065f46" };
      case "LOST": return { bg: "#fee2e2", text: "#991b1b" };
      default: return { bg: "#f1f5f9", text: "#475569" };
    }
  };

  const getVehicleStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE": return { bg: "#d1fae5", text: "#065f46" };
      case "FEATURED": return { bg: "#ffe4e6", text: "#881337" };
      case "PENDING": return { bg: "#fef3c7", text: "#92400e" };
      case "SOLD": return { bg: "#f1f5f9", text: "#475569" };
      case "INACTIVE": return { bg: "#fee2e2", text: "#ef4444" };
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

  const isLoading = isDetailsLoading || isDealersLoading;

  if (isLoading) {
    return (
      <ScreenWrapper layoutType="admin" showBackButton={true} title="Dealer Profile Audit">
        <ScrollView contentContainerStyle={styles.container} scrollEnabled={false}>
          {/* Banner Skeleton */}
          <View style={styles.bannerContainer}>
            <Skeleton style={{ width: "100%", height: "100%" }} />
            <View style={styles.logoAndTitleContainer}>
              <Skeleton style={{ width: 48, height: 48, borderRadius: 12 }} />
              <View style={styles.titleInfo}>
                <Skeleton style={{ width: 150, height: 20, marginBottom: 4, borderRadius: 4 }} />
                <Skeleton style={{ width: 100, height: 12, borderRadius: 4 }} />
              </View>
            </View>
          </View>

          {/* Metrics Skeleton */}
          <View style={styles.metricsContainer}>
            {[1, 2, 3, 4].map((key) => (
              <View key={key} style={[styles.metricCard, { borderColor: "#f1f5f9", borderLeftColor: "#e2e8f0" }]}>
                <View style={styles.metricTopRow}>
                  <Skeleton style={{ width: 32, height: 32, borderRadius: 10 }} />
                  <Skeleton style={{ width: 40, height: 20, borderRadius: 4 }} />
                </View>
                <Skeleton style={{ width: 80, height: 12, borderRadius: 4 }} />
              </View>
            ))}
          </View>

          {/* Info Cards Skeleton */}
          <View style={styles.section}>
            {[1, 2].map((key) => (
              <View key={key} style={styles.infoCard}>
                <Skeleton style={{ width: 140, height: 14, marginBottom: 16, borderRadius: 4 }} />
                <View style={styles.infoRow}>
                  <Skeleton style={{ width: "30%", height: 12, borderRadius: 4 }} />
                  <Skeleton style={{ width: "50%", height: 12, borderRadius: 4 }} />
                </View>
                <View style={styles.infoRow}>
                  <Skeleton style={{ width: "30%", height: 12, borderRadius: 4 }} />
                  <Skeleton style={{ width: "40%", height: 12, borderRadius: 4 }} />
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </ScreenWrapper>
    );
  }

  if (!dealerInfo) {
    return (
      <ScreenWrapper layoutType="admin" showBackButton={true} title="Dealer Profile Audit">
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Dealer profile not found.</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper layoutType="admin" showBackButton={true} title="Dealer Profile Audit">
      <ScrollView contentContainerStyle={styles.container}>
        {/* Showroom Image Header Banner */}
        <View style={styles.bannerContainer}>
          {dealerInfo.showroomImage ? (
            <Image
              source={{ uri: getImageUrl(dealerInfo.showroomImage) }}
              style={styles.bannerImage}
            />
          ) : (
            <View style={styles.bannerPlaceholder}>
              <BuildingIcon size={48} color="rgba(255,255,255,0.2)" />
            </View>
          )}
          <View style={styles.bannerOverlay} />

          {/* Logo badge and title overlay */}
          <View style={styles.logoAndTitleContainer}>
            {dealerInfo.dealerLogo ? (
              <Image
                source={{ uri: getImageUrl(dealerInfo.dealerLogo) }}
                style={styles.dealerLogo}
              />
            ) : (
              <View style={styles.dealerLogoPlaceholder}>
                <Text style={styles.logoTextChar}>
                  {dealerInfo.businessName?.charAt(0)?.toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.titleInfo}>
              <Text style={styles.businessName}>{dealerInfo.businessName}</Text>
              <Text style={styles.ownerName}>Owner: {dealerInfo.ownerName}</Text>
            </View>
          </View>

          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>{dealerInfo.dealerAccountStatus}</Text>
          </View>
        </View>

        {/* KPI Analytics metrics row */}
        <View style={styles.metricsContainer}>
          <View style={[styles.metricCard, { borderLeftColor: "#0d9488" }]}>
            <View style={styles.metricTopRow}>
              <View style={[styles.metricIconBg, { backgroundColor: "#ccfbf1" }]}>
                <UsersIcon size={16} color="#0d9488" />
              </View>
              <Text style={[styles.metricValue, { color: "#0d9488" }]}>{details.dashboard?.totalLeads ?? 0}</Text>
            </View>
            <Text style={styles.metricLabel}>Total Leads</Text>
          </View>
          <View style={[styles.metricCard, { borderLeftColor: "#2563eb" }]}>
            <View style={styles.metricTopRow}>
              <View style={[styles.metricIconBg, { backgroundColor: "#dbeafe" }]}>
                <CarIcon size={16} color="#2563eb" />
              </View>
              <Text style={[styles.metricValue, { color: "#2563eb" }]}>{details.dashboard?.totalVehicles ?? 0}</Text>
            </View>
            <Text style={styles.metricLabel}>Total Vehicles</Text>
          </View>
          <View style={[styles.metricCard, { borderLeftColor: "#9333ea" }]}>
            <View style={styles.metricTopRow}>
              <View style={[styles.metricIconBg, { backgroundColor: "#f3e8ff" }]}>
                <EyeIcon size={16} color="#9333ea" />
              </View>
              <Text style={[styles.metricValue, { color: "#9333ea" }]}>{details.dashboard?.vehicleViews ?? 0}</Text>
            </View>
            <Text style={styles.metricLabel}>Vehicle Views</Text>
          </View>
          <View style={[styles.metricCard, { borderLeftColor: "#eab308" }]}>
            <View style={styles.metricTopRow}>
              <View style={[styles.metricIconBg, { backgroundColor: "#fef9c3" }]}>
                <StarIcon size={16} color="#eab308" />
              </View>
              <Text style={[styles.metricValue, { color: "#eab308" }]}>{details.dashboard?.featuredVehicles ?? 0}</Text>
            </View>
            <Text style={styles.metricLabel}>Featured Cars</Text>
          </View>
        </View>

        {/* Business details info cards */}
        <View style={styles.section}>
          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>
              <LandmarkIcon size={14} color="#3b82f6" /> Business Identity
            </Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>GST Number:</Text>
              <Text style={styles.infoValue}>{dealerInfo.gstNumber || "—"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Years In Business:</Text>
              <Text style={styles.infoValue}>{dealerInfo.yearsInBusiness ?? "—"} Years</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>
              <PhoneIcon size={14} color="#10b981" /> Contact Information
            </Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{dealerInfo.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Mobile:</Text>
              <Text style={styles.infoValue}>{dealerInfo.dealerMobile}</Text>
            </View>
            {dealerInfo.executiveMobile ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Exec Mobile:</Text>
                <Text style={styles.infoValue}>{dealerInfo.executiveMobile}</Text>
              </View>
            ) : null}
            {dealerInfo.whatsapp && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>WhatsApp:</Text>
                <Text style={styles.infoValue}>{dealerInfo.whatsapp}</Text>
              </View>
            )}
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>
              <MapPinIcon size={14} color="#f43f5e" /> Showroom Address
            </Text>
            <Text style={styles.addressText}>{dealerInfo.address || "—"}</Text>
            <Text style={styles.cityStateText}>
              {dealerInfo.city}, {dealerInfo.state} - {dealerInfo.pinCode || ""}
            </Text>
          </View>
        </View>

        {/* Tabs switcher: Vehicles / Leads */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === "vehicles" ? styles.tabBtnActive : null]}
            onPress={() => setActiveTab("vehicles")}
          >
            <ListIcon size={16} color={activeTab === "vehicles" ? "#f43f5e" : "#64748b"} />
            <Text style={[styles.tabText, activeTab === "vehicles" ? styles.tabTextActive : null]}>
              Vehicles
            </Text>
            <View style={[styles.tabBadge, activeTab === "vehicles" ? styles.tabBadgeActive : null]}>
              <Text style={[styles.tabBadgeText, activeTab === "vehicles" ? styles.tabBadgeTextActive : null]}>
                {details.vehicles?.length ?? 0}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === "leads" ? styles.tabBtnActive : null]}
            onPress={() => setActiveTab("leads")}
          >
            <UsersIcon size={16} color={activeTab === "leads" ? "#f43f5e" : "#64748b"} />
            <Text style={[styles.tabText, activeTab === "leads" ? styles.tabTextActive : null]}>
              Leads
            </Text>
            <View style={[styles.tabBadge, activeTab === "leads" ? styles.tabBadgeActive : null]}>
              <Text style={[styles.tabBadgeText, activeTab === "leads" ? styles.tabBadgeTextActive : null]}>
                {details.leads?.length ?? 0}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* List items rendering */}
        <View style={styles.listContainer}>
          {activeTab === "vehicles" ? (
            (details.vehicles?.length === 0) ? (
              <Text style={styles.emptyListText}>No vehicles listed by this dealer yet.</Text>
            ) : (
              details.vehicles.map((v: any, idx: number) => {
                const statusColor = getVehicleStatusColor(v.vehicleStatus);
                const carImage = v.images?.[0] ? getImageUrl(v.images[0]) : null;
                return (
                  <View key={v.id} style={styles.richCard}>
                    <View style={styles.richCardHeader}>
                      <Text style={styles.srNo}>#{idx + 1}</Text>
                      <View style={[styles.statusPill, { backgroundColor: statusColor.bg }]}>
                        <Text style={[styles.statusPillText, { color: statusColor.text }]}>{v.vehicleStatus}</Text>
                      </View>
                    </View>
                    <View style={styles.richCardBody}>
                      {carImage ? (
                        <Image source={{ uri: carImage }} style={styles.carThumb} />
                      ) : (
                        <View style={styles.carThumbPlaceholder}>
                          <CarIcon size={24} color="#94a3b8" />
                        </View>
                      )}
                      <View style={styles.carInfo}>
                        <Text style={styles.itemTitle}>{v.brand} {v.model}</Text>
                        <Text style={styles.itemSubtitle}>{v.variant}</Text>
                        <Text style={styles.itemPrice}>{formatINR(v.askingPrice)}</Text>
                      </View>
                    </View>
                    <View style={styles.richCardFooter}>
                      <View style={styles.footerCol}>
                        <Text style={styles.footerLabel}>Details</Text>
                        <Text style={styles.footerValue}>{v.kilometerDriven?.toLocaleString("en-IN")} km • {v.fuelType} • {v.registrationYear}</Text>
                      </View>
                      <View style={styles.footerColRight}>
                        <Text style={styles.footerLabel}>Location & Date</Text>
                        <Text style={styles.footerValue}><MapPinIcon size={10} color="#64748b" /> {v.city} • {formatDate(v.createdAt)}</Text>
                      </View>
                    </View>
                  </View>
                );
              })
            )
          ) : (
            (details.leads?.length === 0) ? (
              <Text style={styles.emptyListText}>No customer leads generated yet.</Text>
            ) : (
              details.leads.map((l: any, idx: number) => {
                const statusColor = getLeadStatusColor(l.leadStatus);
                const avatarColor = getAvatarColor(l.customerName);
                return (
                  <View key={l.id} style={styles.richCard}>
                    <View style={styles.richCardHeader}>
                      <Text style={styles.srNo}>#{idx + 1} • ID: {l.uniqueLeadId}</Text>
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
                        <Text style={styles.itemLeadDetails}>Enquiry: <Text style={{fontWeight: "800", color: "#0f172a"}}>{l.vehicleName}</Text></Text>
                      </View>
                    </View>
                    <View style={styles.richCardFooter}>
                      <View style={styles.footerCol}>
                        <Text style={styles.footerLabel}>Location</Text>
                        <Text style={styles.footerValue}><MapPinIcon size={10} color="#64748b" /> {l.customerCity}</Text>
                      </View>
                      <View style={styles.footerColRight}>
                        <Text style={styles.footerLabel}>Date</Text>
                        <Text style={styles.footerValue}>{formatDate(l.enquiryDate)}</Text>
                      </View>
                    </View>
                  </View>
                );
              })
            )
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  loader: {
    marginTop: 80,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 14,
    color: "#64748b",
  },
  container: {
    paddingBottom: 32,
  },
  bannerContainer: {
    height: 180,
    width: "100%",
    position: "relative",
    backgroundColor: "#1e293b",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  bannerPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f172a",
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  logoAndTitleContainer: {
    position: "absolute",
    bottom: 16,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  dealerLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#fff",
    backgroundColor: "#fff",
  },
  dealerLogoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#3b82f6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  logoTextChar: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 18,
  },
  titleInfo: {
    marginLeft: 12,
  },
  businessName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
  },
  ownerName: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 11,
    marginTop: 2,
  },
  statusBadge: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  section: {
    padding: 16,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  infoCardTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0f172a",
    textTransform: "uppercase",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingBottom: 8,
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  infoLabel: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "600",
  },
  infoValue: {
    color: "#0f172a",
    fontSize: 12,
    fontWeight: "700",
  },
  addressText: {
    fontSize: 12,
    color: "#0f172a",
    fontWeight: "600",
    lineHeight: 16,
  },
  cityStateText: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    backgroundColor: "#fff",
    height: 48,
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  tabBtnActive: {
    borderBottomWidth: 2,
    borderBottomColor: "#f43f5e",
  },
  tabText: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "600",
    marginLeft: 8,
  },
  tabTextActive: {
    color: "#f43f5e",
    fontWeight: "800",
  },
  tabBadge: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  tabBadgeActive: {
    backgroundColor: "#ffe4e6",
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#64748b",
  },
  tabBadgeTextActive: {
    color: "#f43f5e",
  },
  listContainer: {
    padding: 16,
  },
  emptyListText: {
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 16,
  },
  richCard: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
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
  carThumb: {
    width: 60,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  carThumbPlaceholder: {
    width: 60,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
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
  itemPrice: {
    fontSize: 13,
    fontWeight: "900",
    color: "#f43f5e",
    marginTop: 4,
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
  metricsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  metricCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "rgba(0,0,0,0.05)",
    borderLeftWidth: 4,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 14,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  metricTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  metricIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  metricValue: {
    fontSize: 20,
    fontWeight: "900",
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748b",
    textTransform: "uppercase",
  },
});
