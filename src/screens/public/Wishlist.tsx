import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../../navigation/AppNavigator";
import ScreenWrapper from "../../components/shared/ScreenWrapper";
import { VehicleCard, VehicleCardSkeleton } from "../../components/cards/VehicleCard";
import { useWishlist } from "../../hooks/public/useWishlist";
import { useCustomer } from "../../contexts/CustomerAuthContext";
import Button from "../../components/ui/Button";
import { Heart as HeartIcon } from "lucide-react-native";
const Heart = HeartIcon as any;

export default function Wishlist() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const customer = useCustomer();
  const isLoggedIn = !!customer;

  const { wishlistVehicles, isLoading, error, refetch } = useWishlist();

  if (!isLoggedIn) {
    return (
      <ScreenWrapper layoutType="public" scrollEnabled={true} hideFooter={true}>
        <View style={styles.centerContainer}>
          <View style={styles.iconCircle}>
            <Heart size={40} color="#fb7185" />
          </View>
          <Text style={styles.emptyTitle}>Wishlist is locked</Text>
          <Text style={styles.emptySubtitle}>
            Please log in with a customer account to save and track your favorite vehicles.
          </Text>
          <Button
            title="Log In / Sign Up"
            onPress={() => {
              import("react-native").then(({ DeviceEventEmitter }) => {
                DeviceEventEmitter.emit("show-auth-modal");
              });
            }}
            style={styles.actionBtn}
          />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper layoutType="public" scrollEnabled={true} hideFooter={true}>
      <View style={styles.headerBlock}>
        <Text style={styles.headerTitle}>My Wishlist</Text>
        <Text style={styles.description}>
          Your saved cars on Caryanam.
        </Text>
      </View>
      {isLoading ? (
        <FlatList
          data={[1, 2, 3]}
          keyExtractor={(i) => String(i)}
          renderItem={() => <VehicleCardSkeleton />}
          contentContainerStyle={styles.listContainer}
          style={{ flex: 1 }}
          scrollEnabled={false}
        />
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button title="Retry" onPress={refetch} style={styles.actionBtn} />
        </View>
      ) : wishlistVehicles.length === 0 ? (
        <View style={styles.centerContainer}>
          <View style={styles.iconCircle}>
            <Heart size={40} color="#fb7185" />
          </View>
          <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
          <Text style={styles.emptySubtitle}>
            Explore our collection of certified pre-owned cars and save your favorites.
          </Text>
          <Button
            title="Browse Cars"
            onPress={() => navigation.navigate("Cars")}
            style={styles.actionBtn}
          />
        </View>
      ) : (
        <FlatList
          data={wishlistVehicles}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <VehicleCard vehicle={item} />}
          contentContainerStyle={styles.listContainer}
          style={{ flex: 1 }}
          scrollEnabled={false}
          refreshing={isLoading}
          onRefresh={refetch}
        />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  headerBlock: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: "#f8fafc",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    marginTop: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fff1f2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  actionBtn: {
    width: 160,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  errorText: {
    fontSize: 14,
    color: "#ef4444",
    textAlign: "center",
    marginBottom: 16,
  },
});
