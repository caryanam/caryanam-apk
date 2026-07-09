import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  Linking,
} from "react-native";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import type { RootStackParamList } from "../../../navigation/AppNavigator";
import ScreenWrapper from "../../../components/shared/ScreenWrapper";
import { useGetVehicleDetails } from "../../../hooks/dealer/useGetVehicleDetails";
import { Fuel, Users, MapPin, Calendar, Gauge, DollarSign } from "lucide-react-native";
import { formatINR, formatKM } from "../../../utils/helpers";
import Video from "react-native-video";

const { width } = Dimensions.get("window");

type VehicleDetailsRouteProp = RouteProp<RootStackParamList, "DealerVehicleDetails">;

const FALLBACK_IMG = "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=533&fit=crop";

export default function DealerVehicleDetails() {
  const route = useRoute<VehicleDetailsRouteProp>();
  const vehicleId = route.params?.vehicleId;
  const { data: vehicle, isLoading, error } = useGetVehicleDetails(vehicleId ? Number(vehicleId) : undefined);

  if (isLoading) {
    return (
      <ScreenWrapper layoutType="dealer" showBackButton={true} title="Vehicle Details">
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#e11d48" />
        </View>
      </ScreenWrapper>
    );
  }

  if (error || !vehicle) {
    return (
      <ScreenWrapper layoutType="dealer" showBackButton={true} title="Vehicle Details">
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Failed to load vehicle details.</Text>
        </View>
      </ScreenWrapper>
    );
  }

  // Handle images array which might be array of objects {url: string} or strings
  const rawImages = vehicle.images || [];
  const images: string[] = rawImages.map((img: any) => typeof img === 'string' ? img : img.url).filter(Boolean);
  if (images.length === 0) images.push(FALLBACK_IMG);

  const videos: string[] = vehicle.videos || [];

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE": return { bg: "#ecfdf5", text: "#047857" };
      case "INACTIVE": return { bg: "#fff1f2", text: "#e11d48" };
      case "FEATURED": return { bg: "#fffbeb", text: "#d97706" };
      default: return { bg: "#f1f5f9", text: "#475569" };
    }
  };

  const statusColor = getStatusColor(vehicle.vehicleStatus || "ACTIVE");

  const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  return (
    <ScreenWrapper layoutType="dealer" showBackButton={true} title="Vehicle Details" scrollEnabled={false}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        
        {/* Image Gallery */}
        <View style={styles.galleryContainer}>
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
            {images.map((imgUrl, index) => (
              <Image key={index} source={{ uri: imgUrl }} style={styles.galleryImage} resizeMode="cover" />
            ))}
          </ScrollView>
          {images.length > 1 && (
            <View style={styles.paginationBadge}>
              <Text style={styles.paginationText}>Swipe for more ({images.length})</Text>
            </View>
          )}
        </View>

        {/* Basic Info */}
        <View style={styles.infoSection}>
          <View style={styles.badgesRow}>
            <View style={[styles.badge, { backgroundColor: statusColor.bg }]}>
              <Text style={[styles.badgeText, { color: statusColor.text }]}>{vehicle.vehicleStatus}</Text>
            </View>
            {vehicle.vehicleType && (
              <View style={[styles.badge, vehicle.vehicleType === "PREMIUM" ? styles.badgePremium : styles.badgeDefault]}>
                <Text style={[styles.badgeText, vehicle.vehicleType === "PREMIUM" ? styles.badgePremiumText : styles.badgeDefaultText]}>
                  {vehicle.vehicleType}
                </Text>
              </View>
            )}
          </View>
          
          <Text style={styles.titleText}>
            {vehicle.registrationYear} {vehicle.brand} {vehicle.model} {vehicle.variant}
          </Text>
          <Text style={styles.priceText}>{formatINR(vehicle.askingPrice)}</Text>
        </View>

        {/* Specs Grid */}
        <View style={styles.specsGrid}>
          <SpecBox icon={<Fuel size={16} color="#e11d48" />} label="Fuel Type" value={vehicle.fuelType} />
          <SpecBox icon={<Gauge size={16} color="#e11d48" />} label="KM Driven" value={formatKM(vehicle.kilometerDriven)} />
          <SpecBox icon={<Calendar size={16} color="#e11d48" />} label="Reg. Year" value={String(vehicle.registrationYear)} />
          <SpecBox icon={<Users size={16} color="#e11d48" />} label="Ownership" value={`${getOrdinal(vehicle.ownershipDetails || 1)} Owner`} />
          <SpecBox icon={<MapPin size={16} color="#e11d48" />} label="City" value={vehicle.city} />
          <SpecBox icon={<DollarSign size={16} color="#e11d48" />} label="Finance" value={vehicle.financeAvailability ? "Available" : "Not Available"} />
        </View>

        {/* Description */}
        {vehicle.vehicleDescription ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{vehicle.vehicleDescription}</Text>
          </View>
        ) : null}

        {/* Videos Section */}
        {videos.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Videos</Text>
            <View style={styles.videoList}>
              {videos.map((vid, idx) => (
                <View key={idx} style={styles.videoContainer}>
                  <Video
                    source={{ uri: vid }}
                    style={styles.videoPlayer}
                    controls={true}
                    resizeMode="contain"
                    paused={true}
                  />
                </View>
              ))}
            </View>
          </View>
        )}

      </ScrollView>
    </ScreenWrapper>
  );
}

function SpecBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | undefined }) {
  return (
    <View style={styles.specBox}>
      <View style={styles.specIconWrap}>{icon}</View>
      <View style={styles.specTexts}>
        <Text style={styles.specLabel}>{label}</Text>
        <Text style={styles.specValue}>{value || "—"}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 16,
  },
  galleryContainer: {
    width: "100%",
    height: 250,
    position: "relative",
  },
  galleryImage: {
    width: width,
    height: 250,
    backgroundColor: "#f1f5f9",
  },
  paginationBadge: {
    position: "absolute",
    bottom: 12,
    right: 16,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  paginationText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  infoSection: {
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  badgesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  badgePremium: {
    backgroundColor: "#fef3c7",
  },
  badgePremiumText: {
    color: "#b45309",
  },
  badgeDefault: {
    backgroundColor: "#f1f5f9",
  },
  badgeDefaultText: {
    color: "#475569",
  },
  titleText: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: 6,
  },
  priceText: {
    fontSize: 28,
    fontWeight: "900",
    color: "#e11d48",
  },
  specsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 12,
    gap: 12,
  },
  specBox: {
    width: (width - 36) / 2, // 2 columns with 12px gap
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  specIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff1f2",
    alignItems: "center",
    justifyContent: "center",
  },
  specTexts: {
    flex: 1,
  },
  specLabel: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "600",
    marginBottom: 2,
  },
  specValue: {
    fontSize: 13,
    color: "#0f172a",
    fontWeight: "800",
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 22,
  },
  videoList: {
    gap: 16,
  },
  videoContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
    borderRadius: 12,
    overflow: "hidden",
  },
  videoPlayer: {
    width: "100%",
    height: "100%",
  }
});
