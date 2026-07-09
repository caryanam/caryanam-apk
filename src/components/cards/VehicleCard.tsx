import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  DeviceEventEmitter,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../../navigation/AppNavigator";
import type { Vehicle } from "../../types";
import { formatINR, formatKM } from "../../utils/helpers";
import { useWishlist } from "../../hooks/public/useWishlist";
import { useCustomer } from "../../contexts/CustomerAuthContext";
import {
  Gauge as GaugeIcon,
  Fuel as FuelIcon,
  MapPin as MapPinIcon,
  Heart as HeartIcon,
  Star as StarIcon,
} from "lucide-react-native";

const Gauge = GaugeIcon as any;
const Fuel = FuelIcon as any;
const MapPin = MapPinIcon as any;
const Heart = HeartIcon as any;
const Star = StarIcon as any;

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=533&fit=crop";

interface VehicleCardProps {
  vehicle: Vehicle;
  onWishlistRequireLogin?: () => void;
}

export function VehicleCard({
  vehicle,
  onWishlistRequireLogin,
}: VehicleCardProps) {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const customer = useCustomer();
  const isLoggedIn = !!customer;

  const imageUrl =
    vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : FALLBACK_IMG;

  const { wishlistIds, toggleWishlist } = useWishlist();
  const wishlisted = wishlistIds.includes(vehicle.id);
  const isPremium = vehicle.vehicleType === "PREMIUM";
  const isFeatured = vehicle.vehicleStatus === "FEATURED";

  const handleWishlist = async () => {
    if (!isLoggedIn) {
      if (onWishlistRequireLogin) {
        onWishlistRequireLogin();
      } else {
        DeviceEventEmitter.emit("show-auth-modal");
      }
      return;
    }

    try {
      const msg = await toggleWishlist(vehicle.id);
      Alert.alert("Wishlist Update", msg);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to update wishlist");
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.card}
      onPress={() => navigation.navigate("CarDetails", { id: vehicle.id })}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
        {/* Subtle vignette */}
        <View style={styles.vignette} />

        {/* Left tags (Featured / Premium) */}
        <View style={styles.leftBadges}>
          {isFeatured && (
            <View style={[styles.badge, styles.badgeFeatured]}>
              <Star size={10} color="#fff" fill="#fff" style={styles.badgeIcon} />
              <Text style={styles.badgeText}>FEATURED</Text>
            </View>
          )}
          {isPremium && (
            <View style={[styles.badge, styles.badgePremium]}>
              <Star size={10} color="#000" fill="#000" style={styles.badgeIcon} />
              <Text style={[styles.badgeText, { color: "#000" }]}>PREMIUM</Text>
            </View>
          )}
        </View>

        {/* Right badge: Registration Year */}
        <View style={styles.yearBadge}>
          <Text style={styles.yearBadgeText}>{vehicle.registrationYear}</Text>
        </View>

        {/* Bottom left badge: Price Tag */}
        <View style={styles.priceBadge}>
          <Text style={styles.priceText}>{formatINR(vehicle.askingPrice)}</Text>
        </View>
      </View>

      {/* Heart Wishlist Trigger - Overlaps Image and Content */}
      <View style={styles.heartButtonWrapper}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleWishlist}
          style={[styles.heartButton, wishlisted ? styles.heartButtonActive : null]}
        >
          <Heart
            size={18}
            color={wishlisted ? "#fff" : "#fff"}
            fill={wishlisted ? "#fff" : "transparent"}
          />
        </TouchableOpacity>
      </View>

      {/* Card Info Details */}
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {vehicle.brand} {vehicle.model}
        </Text>
        <Text style={styles.variant} numberOfLines={1}>
          {vehicle.variant || "Standard Variant"}
        </Text>

        {/* Clean Spec Grid Container */}
        <View style={styles.specsRow}>
          <View style={styles.specItem}>
            <Gauge size={14} color="#be185d" style={styles.specIcon} />
            <Text style={styles.specText} numberOfLines={1}>
              {formatKM(vehicle.kilometerDriven)}
            </Text>
          </View>
          <View style={styles.specItem}>
            <Fuel size={14} color="#be185d" style={styles.specIcon} />
            <Text style={styles.specText} numberOfLines={1}>
              {vehicle.fuelType || "Petrol"}
            </Text>
          </View>
        </View>

        {/* Footer Area */}
        <View style={styles.footer}>
          <View style={styles.locationContainer}>
            <MapPin size={14} color="#94a3b8" style={styles.locationIcon} />
            <Text style={styles.locationText} numberOfLines={1}>
              {vehicle.city || "Pune"}
            </Text>
          </View>
          <Text style={styles.detailsLink}>Details →</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function VehicleCardSkeleton() {
  return (
    <View style={[styles.card, styles.skeletonCard]}>
      <View style={[styles.imageContainer, styles.skeletonImage]} />
      <View style={styles.infoContainer}>
        <View style={[styles.skeletonLine, { width: "70%", height: 18 }]} />
        <View style={[styles.skeletonLine, { width: "40%", height: 12, marginTop: 6 }]} />
        <View style={[styles.specsRow, { borderTopWidth: 0, borderBottomWidth: 0, backgroundColor: "transparent" }]}>
          <View style={[styles.skeletonLine, { flex: 1, height: 14 }]} />
          <View style={[styles.skeletonLine, { flex: 1, height: 14, marginLeft: 8 }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    overflow: "visible", // To allow heart to overflow slightly if needed
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 4,
  },
  skeletonCard: {
    opacity: 0.6,
    overflow: "hidden",
  },
  imageContainer: {
    aspectRatio: 1.6, // Matches web 16/10 aspect ratio
    width: "100%",
    position: "relative",
    backgroundColor: "#f1f5f9",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  skeletonImage: {
    backgroundColor: "#e2e8f0",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  leftBadges: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "column",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 6,
  },
  badgeFeatured: {
    backgroundColor: "#be185d", // Rose 700
  },
  badgePremium: {
    backgroundColor: "#fbbf24", // Amber 400
  },
  badgeIcon: {
    marginRight: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  yearBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  yearBadgeText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#4c0519", // Rose 950
  },
  priceBadge: {
    position: "absolute",
    bottom: 12,
    left: 12,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  priceText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#4c0519",
  },
  heartButtonWrapper: {
    position: "absolute",
    right: 16,
    top: "50%",
    marginTop: -16, // Half of button height to perfectly overlap image and content
    zIndex: 10,
  },
  heartButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  heartButtonActive: {
    backgroundColor: "#881337", // Rose 900
    borderColor: "rgba(244, 63, 94, 0.2)",
  },
  infoContainer: {
    padding: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0f172a",
    textTransform: "capitalize",
    marginRight: 40, // leave space for heart
  },
  variant: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
    marginTop: 2,
    textTransform: "capitalize",
  },
  specsRow: {
    flexDirection: "row",
    paddingVertical: 10,
    marginTop: 14,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  specItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  specIcon: {
    marginRight: 6,
  },
  specText: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "800",
    textTransform: "capitalize",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationIcon: {
    marginRight: 4,
  },
  locationText: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "700",
  },
  detailsLink: {
    fontSize: 11,
    fontWeight: "900",
    color: "#9f1239",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  skeletonLine: {
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
  },
});
