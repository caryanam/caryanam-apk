import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { useAdminAuth } from "../contexts/AdminAuthContext";
import { useDealerAuth } from "../contexts/DealerAuthContext";
import { useCustomer } from "../contexts/CustomerAuthContext";

// Public / Customer Screens
import Home from "../screens/public/Home";
import Cars from "../screens/public/Cars";
import PremiumCars from "../screens/public/PremiumCars";
import CarDetails from "../screens/public/CarDetails";
import Wishlist from "../screens/public/Wishlist";
import CustomerChat from "../screens/public/Chat";
import About from "../screens/public/About";
import PrivacyPolicy from "../screens/public/PrivacyPolicy";
import Terms from "../screens/public/Terms";
import RefundPolicy from "../screens/public/RefundPolicy";
import RTOForm from "../screens/public/RTOForm";

// Auth Screens
import Login from "../screens/auth/Login";
import Register from "../screens/auth/Register";

// Dealer Screens
import DealerDashboard from "../screens/dealer/Dashboard";
import DealerVehicles from "../screens/dealer/vehicle/Vehicles";
import DealerVehicleDetails from "../screens/dealer/vehicle/VehicleDetails";
import DealerVehicleForm from "../screens/dealer/vehicle/VehicleForm";
import DealerLeads from "../screens/dealer/Leads";
import DealerProfile from "../screens/dealer/Profile";
import DealerWishlist from "../screens/dealer/CustomerWishlist";
import DealerChat from "../screens/dealer/Chat";
import DealerSubscription from "../screens/dealer/subscription/Subscription";

// Admin Screens
import AdminDashboard from "../screens/admin/Dashboard";
import AdminDealers from "../screens/admin/Dealers";
import AdminDealerDetails from "../screens/admin/DealerDetails";
import AdminVehicles from "../screens/admin/Vehicles";
import AdminLeads from "../screens/admin/Leads";
import AdminSubscriptions from "../screens/admin/Subscriptions";
import AdminChat from "../screens/admin/Chat";
import AdminReports from "../screens/admin/Reports";
import AdminOffers from "../screens/admin/Offers";

export type RootStackParamList = {
  // Public
  Home: undefined;
  Cars: { brand?: string; model?: string; city?: string } | undefined;
  PremiumCars: undefined;
  CarDetails: { id: number };
  Wishlist: undefined;
  Chat: undefined;
  About: undefined;
  PrivacyPolicy: undefined;
  Terms: undefined;
  RefundPolicy: undefined;
  RTOForm: undefined;

  // Auth
  Login: { defaultRole?: "customer" | "dealer" | "admin" } | undefined;
  Register: undefined;

  // Dealer
  DealerDashboard: undefined;
  DealerVehicles: undefined;
  DealerVehicleDetails: { vehicleId: string };
  DealerVehicleForm: { vehicleId?: number } | undefined;
  DealerLeads: undefined;
  DealerProfile: undefined;
  DealerWishlist: undefined;
  DealerChat: undefined;
  DealerSubscription: undefined;

  // Admin
  AdminDashboard: undefined;
  AdminDealers: undefined;
  AdminDealerDetails: { id: string };
  AdminVehicles: undefined;
  AdminLeads: undefined;
  AdminSubscriptions: undefined;
  AdminChat: undefined;
  AdminReports: undefined;
  AdminOffers: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { user: admin, loading: adminLoading } = useAdminAuth();
  const { user: dealer, loading: dealerLoading } = useDealerAuth();
  const customer = useCustomer();

  // Show nothing while restoring credentials
  if (adminLoading || dealerLoading) {
    return null;
  }

  // Determine active view mode
  const isAdmin = !!admin;
  const isDealer = !!dealer;

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {isAdmin ? (
        // Admin Flow
        <>
          <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
          <Stack.Screen name="AdminDealers" component={AdminDealers} />
          <Stack.Screen name="AdminDealerDetails" component={AdminDealerDetails} />
          <Stack.Screen name="AdminVehicles" component={AdminVehicles} />
          <Stack.Screen name="AdminLeads" component={AdminLeads} />
          <Stack.Screen name="AdminSubscriptions" component={AdminSubscriptions} />
          <Stack.Screen name="AdminChat" component={AdminChat} />
          <Stack.Screen name="AdminReports" component={AdminReports} />
          <Stack.Screen name="AdminOffers" component={AdminOffers} />
        </>
      ) : isDealer ? (
        // Dealer Flow
        <>
          <Stack.Screen name="DealerDashboard" component={DealerDashboard} />
          <Stack.Screen name="DealerVehicles" component={DealerVehicles} />
          <Stack.Screen name="DealerVehicleDetails" component={DealerVehicleDetails} />
          <Stack.Screen name="DealerVehicleForm" component={DealerVehicleForm} />
          <Stack.Screen name="DealerLeads" component={DealerLeads} />
          <Stack.Screen name="DealerProfile" component={DealerProfile} />
          <Stack.Screen name="DealerWishlist" component={DealerWishlist} />
          <Stack.Screen name="DealerChat" component={DealerChat} />
          <Stack.Screen name="DealerSubscription" component={DealerSubscription} />
        </>
      ) : (
        // Public Flow (Customer & Guests)
        <>
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Cars" component={Cars} />
          <Stack.Screen name="PremiumCars" component={PremiumCars} />
          <Stack.Screen name="CarDetails" component={CarDetails} />
          <Stack.Screen name="Wishlist" component={Wishlist} />
          <Stack.Screen name="Chat" component={CustomerChat} />
          <Stack.Screen name="About" component={About} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
          <Stack.Screen name="Terms" component={Terms} />
          <Stack.Screen name="RefundPolicy" component={RefundPolicy} />
          <Stack.Screen name="RTOForm" component={RTOForm} />

          {/* Auth Flow (Login & Register are in stack so guests can open them) */}
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
        </>
      )}
    </Stack.Navigator>
  );
}
