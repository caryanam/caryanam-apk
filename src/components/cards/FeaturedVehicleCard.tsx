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
  Heart as HeartIcon,
  Star as StarIcon,
} from "lucide-react-native";

const Heart = HeartIcon as any;
const Star = StarIcon as any;

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=533&fit=crop";

interface FeaturedVehicleCardProps {
  vehicle: Vehicle;
  onWishlistRequireLogin?: () => void;
}

export function FeaturedVehicleCard({
  vehicle,
  onWishlistRequireLogin,
}: FeaturedVehicleCardProps) {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const customer = useCustomer();
  const isLoggedIn = !!customer;

  const imageUrl =
    vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : FALLBACK_IMG;

  const { wishlistIds, toggleWishlist } = useWishlist();
  const wishlisted = wishlistIds.includes(vehicle.id);
  const isPremium = vehicle.vehicleType === "PREMIUM";

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

  const formatPrice = (p: number) => {
    if (p >= 100000) {
      return `₹${(p / 100000).toFixed(2)} L`;
    }
    return `₹${p.toLocaleString("en-IN")}`;
  };

  const formatKms = (kms: number) => {
    if (kms >= 1000) {
      return `${(kms / 1000).toFixed(0)}k km`;
    }
    return `${kms} km`;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.card}
      onPress={() => navigation.navigate("CarDetails", { id: vehicle.id })}
    >
      <Image
        source={{ uri: imageUrl }}
        style={styles.imageBackground}
        resizeMode="cover"
      />
      <View style={styles.vignetteTop} />
      <View style={styles.vignetteBottom} />

      {/* Top Left Badges */}
      <View style={styles.topLeftContainer}>
        <View style={styles.badgeFeatured}>
          <Star size={12} color="#fff" fill="#fff" style={styles.badgeIcon} />
          <Text style={styles.badgeText}>FEATURED</Text>
        </View>
        {isPremium && (
          <View style={styles.badgePremium}>
            <Star size={12} color="#000" fill="#000" style={styles.badgeIcon} />
            <Text style={[styles.badgeText, { color: "#000" }]}>PREMIUM</Text>
          </View>
        )}
      </View>

      {/* Top Right Price Tag */}
      <View style={styles.topRightContainer}>
        <View style={styles.priceTag}>
          <Text style={styles.priceTagText}>{formatPrice(vehicle.askingPrice)}</Text>
        </View>
      </View>

      {/* Bottom Info Layer */}
      <View style={styles.bottomInfoContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {vehicle.brand} {vehicle.model}
        </Text>

        <View style={styles.specsRow}>
          <View style={styles.specsLeft}>
            <View style={styles.specColumn}>
              <Text style={styles.specLabel}>KMS</Text>
              <Text style={styles.specValue}>{formatKms(vehicle.kilometerDriven)}</Text>
            </View>
            <View style={styles.specColumn}>
              <Text style={styles.specLabel}>FUEL</Text>
              <Text style={styles.specValue} numberOfLines={1}>{vehicle.fuelType}</Text>
            </View>
            <View style={styles.specColumn}>
              <Text style={styles.specLabel}>YEAR</Text>
              <Text style={styles.specValue}>{vehicle.registrationYear}</Text>
            </View>
          </View>

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
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    aspectRatio: 1.4,
    borderRadius: 24,
    backgroundColor: "#0f172a",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  imageBackground: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  vignetteTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "40%",
    backgroundColor: "rgba(0,0,0,0.4)", // Simple fallback for top shadow
  },
  vignetteBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "60%",
    backgroundColor: "rgba(0,0,0,0.75)", // Simple fallback for bottom shadow
  },
  topLeftContainer: {
    position: "absolute",
    top: 16,
    left: 16,
    gap: 8,
  },
  badgeFeatured: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#be185d", // Rose 700
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgePremium: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fbbf24", // Amber 400
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 8,
  },
  badgeIcon: {
    marginRight: 6,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  topRightContainer: {
    position: "absolute",
    top: 16,
    right: 16,
  },
  priceTag: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  priceTagText: {
    color: "#881337", // Rose 900
    fontSize: 12,
    fontWeight: "900",
  },
  bottomInfoContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: "#fff",
    textTransform: "capitalize",
    marginBottom: 12,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  specsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.15)",
    paddingTop: 12,
  },
  specsLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },
  specColumn: {
    flexDirection: "column",
  },
  specLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: "rgba(255,255,255,0.5)",
    letterSpacing: 1,
    marginBottom: 2,
  },
  specValue: {
    fontSize: 13,
    fontWeight: "800",
    color: "#fff",
    textTransform: "capitalize",
  },
  heartButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  heartButtonActive: {
    backgroundColor: "#881337", // Rose 900
    borderColor: "#9f1239",
  },
});
