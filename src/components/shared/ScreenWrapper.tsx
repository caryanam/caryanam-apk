import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Platform,
  Image,
  DeviceEventEmitter,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../../navigation/AppNavigator";
import {
  Home as HomeIcon,
  Search as SearchIcon,
  Heart as HeartIcon,
  MessageSquare as MessageSquareIcon,
  User as UserIcon,
  LayoutDashboard as LayoutDashboardIcon,
  Car as CarIcon,
  FileText as FileTextIcon,
  LogOut as LogOutIcon,
  ChevronLeft as ChevronLeftIcon,
  Menu as MenuIcon,
  Users as UsersIcon,
  Layers as LayersIcon,
  Phone as PhoneIcon,
  Mail as MailIcon,
  MapPin as MapPinIcon,
} from "lucide-react-native";

const Home = HomeIcon as any;
const Search = SearchIcon as any;
const Heart = HeartIcon as any;
const MessageSquare = MessageSquareIcon as any;
const User = UserIcon as any;
const LayoutDashboard = LayoutDashboardIcon as any;
const Car = CarIcon as any;
const FileText = FileTextIcon as any;
const LogOut = LogOutIcon as any;
const ChevronLeft = ChevronLeftIcon as any;
const Menu = MenuIcon as any;
const Users = UsersIcon as any;
const Layers = LayersIcon as any;
const Phone = PhoneIcon as any;
const Mail = MailIcon as any;
const MapPin = MapPinIcon as any;

import { Modal } from "react-native";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import { useDealerAuth } from "../../contexts/DealerAuthContext";
import { useCustomer, useCustomerAuth } from "../../contexts/CustomerAuthContext";

interface ScreenWrapperProps {
  children: React.ReactNode;
  layoutType: "public" | "dealer" | "admin" | "auth" | "none";
  title?: string;
  showBackButton?: boolean;
  scrollEnabled?: boolean;
  hideFooter?: boolean;
}

export default function ScreenWrapper({
  children,
  layoutType,
  title,
  showBackButton = false,
  scrollEnabled = true,
}: ScreenWrapperProps) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute();

  const customer = useCustomer();
  const { logout: customerLogout } = useCustomerAuth();
  const { user: dealer, logout: dealerLogout } = useDealerAuth();
  const { user: admin, logout: adminLogout } = useAdminAuth();

  const [drawerVisible, setDrawerVisible] = useState(false);

  const handleLogout = async () => {
    if (layoutType === "admin") {
      await adminLogout();
    } else if (layoutType === "dealer") {
      await dealerLogout();
    } else {
      await customerLogout();
    }
  };

  const currentScreenName = route.name;

  const dealerTabs = [
    { name: "DealerDashboard", icon: LayoutDashboard, label: "Dashboard" },
    { name: "DealerVehicles", icon: Car, label: "Vehicles Stock" },
    { name: "DealerLeads", icon: FileText, label: "Leads" },
    { name: "DealerChat", icon: MessageSquare, label: "Chat" },
    { name: "DealerProfile", icon: User, label: "Profile" },
    { name: "DealerSubscription", icon: Layers, label: "Subscription" },
  ];

  const adminTabs = [
    { name: "AdminDashboard", icon: LayoutDashboard, label: "Dashboard" },
    { name: "AdminDealers", icon: Users, label: "Dealers" },
    { name: "AdminVehicles", icon: Car, label: "Cars Stock" },
    { name: "AdminLeads", icon: FileText, label: "Leads" },
    { name: "AdminChat", icon: MessageSquare, label: "Chats" },
    { name: "AdminSubscriptions", icon: Layers, label: "Subscriptions" },
    { name: "AdminReports", icon: Layers, label: "Reports" },
  ];

  const publicTabs = [
    { name: "Home", icon: Home, label: "Home" },
    { name: "Cars", icon: Search, label: "Browse Cars" },
    { name: "PremiumCars", icon: Car, label: "Premium Cars" },
    { name: "RTOForm", icon: FileText, label: "RTO Form" },
    { name: "About", icon: User, label: "About" },
  ];

  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const renderHeader = () => {
    if (layoutType === "none") return null;

    return (
      <View style={[styles.header, { paddingTop: insets.top, height: 56 + insets.top }]}>
        <View style={styles.headerLeft}>
          {showBackButton && (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <ChevronLeft size={24} color="#fff" />
            </TouchableOpacity>
          )}
          
          {(!showBackButton) && (
            <View style={styles.logoWrapper}>
              <Image
                source={require("../../assets/logo.png")}
                style={styles.logoIcon}
                resizeMode="cover"
              />
              <Text style={styles.logoText}>
                CARY<Text style={{ color: "#fbbf24" }}>A</Text>NAM
              </Text>
            </View>
          )}
          {title && <Text style={styles.headerTitle}>{title}</Text>}
        </View>

        <View style={styles.headerRight}>
          {layoutType === "public" ? (
            <View style={{ position: "relative", zIndex: 50, marginRight: 12 }}>
              <TouchableOpacity
                onPress={() => {
                  if (!customer) {
                    DeviceEventEmitter.emit("show-auth-modal");
                  } else {
                    setUserMenuOpen(!userMenuOpen);
                  }
                }}
                style={[
                  styles.avatarBtn,
                  customer ? styles.avatarBtnActive : styles.avatarBtnInactive
                ]}
              >
                {customer ? (
                  <Text style={styles.avatarText}>
                    {(customer.customerName || customer.email || "U").trim().charAt(0).toUpperCase()}
                  </Text>
                ) : (
                  <User size={20} color="#fff" />
                )}
              </TouchableOpacity>

              {userMenuOpen && customer && (
                <View style={styles.userDropdown}>
                  <View style={styles.dropdownHeader}>
                    <Text style={styles.dropdownName} numberOfLines={1}>
                      {customer.customerName || customer.email}
                    </Text>
                    <Text style={styles.dropdownEmail} numberOfLines={1}>
                      {customer.email}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      setUserMenuOpen(false);
                      navigation.navigate("Wishlist");
                    }}
                  >
                    <Heart size={16} color="#f43f5e" style={{ marginRight: 8 }} />
                    <Text style={styles.dropdownItemText}>My Wishlist</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      setUserMenuOpen(false);
                      handleLogout();
                    }}
                  >
                    <LogOut size={16} color="#f43f5e" style={{ marginRight: 8 }} />
                    <Text style={styles.dropdownItemText}>Logout</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : null}

          {(!showBackButton) && (
            <TouchableOpacity
              onPress={() => setDrawerVisible(true)}
              style={styles.menuButton}
            >
              <Menu size={24} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderBottomBar = () => {
    return null;
  };

  const renderDrawer = () => {
    if (!drawerVisible) return null;

    const tabs = layoutType === "admin" ? adminTabs : layoutType === "dealer" ? dealerTabs : publicTabs;
    const userEmail = layoutType === "admin" ? admin?.email : layoutType === "dealer" ? dealer?.email : customer?.email;
    const userRole = layoutType === "admin" ? "Admin Staff" : layoutType === "dealer" ? "Dealer Showroom" : customer ? "Customer" : "Guest";

    return (
      <View style={[StyleSheet.absoluteFill, { zIndex: 9999, elevation: 9999 }]}>
        <View style={styles.drawerOverlay}>
          <TouchableOpacity
            style={styles.drawerBackdrop}
            activeOpacity={1}
            onPress={() => setDrawerVisible(false)}
          />

          <View style={[styles.drawerContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <View style={styles.drawerHeader}>
              <Image
                source={require("../../assets/logo.png")}
                style={styles.logoIcon}
                resizeMode="cover"
              />
              <Text style={styles.logoText}>
                CARY<Text style={{ color: "#fbbf24" }}>A</Text>NAM
              </Text>
            </View>

            <ScrollView style={styles.drawerNav}>
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                const isActive = currentScreenName === tab.name;
                return (
                  <TouchableOpacity
                    key={tab.name}
                    activeOpacity={0.8}
                    style={[styles.drawerNavItem, isActive ? styles.drawerNavItemActive : null]}
                    onPress={() => {
                      setDrawerVisible(false);
                      navigation.navigate(tab.name as any);
                    }}
                  >
                    <IconComponent
                      size={18}
                      color={isActive ? "#fff" : "#94a3b8"}
                    />
                    <Text style={[styles.drawerNavLabel, isActive ? styles.drawerNavLabelActive : null]}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {layoutType === "public" ? (
              <View style={styles.drawerFooterPublic}>
                <TouchableOpacity
                  onPress={() => {
                    setDrawerVisible(false);
                    navigation.navigate("Login");
                  }}
                  style={styles.drawerDealerLoginBtn}
                >
                  <Text style={styles.drawerDealerLoginText}>Dealer Login</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setDrawerVisible(false);
                    navigation.navigate("Register");
                  }}
                  style={styles.drawerRegisterBtn}
                >
                  <Text style={styles.drawerRegisterText}>Register Dealer</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.drawerFooter}>
                <Text style={styles.footerSignedText}>Signed in as</Text>
                <Text style={styles.footerEmailText} numberOfLines={1}>
                  {userEmail || "Guest User"}
                </Text>
                <Text style={styles.footerRoleText}>{userRole}</Text>

                {((layoutType === "admin" && admin) || (layoutType === "dealer" && dealer)) && (
                  <TouchableOpacity
                    onPress={() => {
                      setDrawerVisible(false);
                      handleLogout();
                    }}
                    style={styles.drawerLogoutBtn}
                  >
                    <LogOut size={16} color="#f43f5e" />
                    <Text style={styles.drawerLogoutText}>LOGOUT</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderPublicFooter = () => {
    if (layoutType !== "public") return null;
    return (
      <View style={styles.publicFooter}>
        <View style={styles.footerWatermarkContainer}>
          <Text 
            style={styles.footerWatermarkText}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.3}
          >
            CARY<Text style={{ color: "#fbbf24" }}>A</Text>NAM
          </Text>
        </View>
        <View style={styles.footerContent}>
          <Text style={styles.footerExploreTitle}>
            <Text style={{ color: "#f43f5e", fontSize: 16 }}>+ </Text>EXPLORE MORE ON CARYANAM
          </Text>

          {/* Section 1: Logo & Desc */}
          <View style={styles.footerSection}>
            <View style={styles.logoWrapper}>
              <Image
                source={require("../../assets/logo.png")}
                style={styles.logoIcon}
                resizeMode="cover"
              />
              <Text style={styles.logoText}>
                CARY<Text style={{ color: "#fbbf24" }}>A</Text>NAM
              </Text>
            </View>
            <Text style={styles.footerDesc}>
              India's most trusted used-car dealer marketplace. Verified inventory across 150+ cities.
            </Text>
          </View>

          {/* Section 2: Explore */}
          <View style={styles.footerSection}>
            <Text style={styles.footerSectionTitle}>EXPLORE</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Cars")}><Text style={styles.footerLink}>Browse Cars</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate("PremiumCars")}><Text style={styles.footerLink}>Premium Cars</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}><Text style={styles.footerLink}>Dealer Registration</Text></TouchableOpacity>
          </View>

          {/* Section 3: Company */}
          <View style={styles.footerSection}>
            <Text style={styles.footerSectionTitle}>COMPANY</Text>
            <TouchableOpacity onPress={() => navigation.navigate("About")}><Text style={styles.footerLink}>About</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate("PrivacyPolicy")}><Text style={styles.footerLink}>Privacy Policy</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate("Terms")}><Text style={styles.footerLink}>Terms & Conditions</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate("RefundPolicy")}><Text style={styles.footerLink}>Refund Policy</Text></TouchableOpacity>
          </View>

          {/* Section 4: Reach Us */}
          <View style={styles.footerSection}>
            <Text style={styles.footerSectionTitle}>REACH US</Text>
            <View style={styles.footerContactRow}>
              <Phone size={14} color="#f43f5e" />
              <Text style={styles.footerLink}>+91 7755994123</Text>
            </View>
            <View style={styles.footerContactRow}>
              <Mail size={14} color="#f43f5e" />
              <Text style={styles.footerLink}>support@caryanam.com</Text>
            </View>
            <View style={styles.footerContactRow}>
              <MapPin size={14} color="#f43f5e" />
              <Text style={styles.footerLink}>Kharadi, Pune, 411014</Text>
            </View>
          </View>

        </View>
        <View style={styles.footerCopyrightRow}>
          <Text style={styles.footerCopyrightText}>
            Developed by <Text style={{ color: '#881337', fontWeight: '900' }}>Caryanamindia Pvt Ltd</Text>
          </Text>
          <Text style={[styles.footerCopyrightText, { marginTop: 8 }]}>
            © 2026 Caryanam. All rights reserved by Caryanamindia Pvt Ltd.
          </Text>
        </View>
      </View>
    );
  };

  const ContentContainer = scrollEnabled ? ScrollView : View;

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      {renderHeader()}
      <ContentContainer
        style={styles.container}
        contentContainerStyle={scrollEnabled ? styles.scrollContent : undefined}
        keyboardShouldPersistTaps="handled"
      >
        {children}
        {currentScreenName !== "Chat" && renderPublicFooter()}
      </ContentContainer>
      {/* Customer Floating Chat Button */}
      {layoutType === "public" && customer && currentScreenName !== "Chat" && (
        <TouchableOpacity
          style={[styles.floatingChatBtn, { bottom: Math.max(insets.bottom, 20) }]}
          onPress={() => navigation.navigate("Chat" as any)}
          activeOpacity={0.9}
        >
          <MessageSquare size={24} color="#fff" />
        </TouchableOpacity>
      )}

      {renderBottomBar()}
      {renderDrawer()}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    height: 56,
    backgroundColor: "#000",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
    marginRight: 8,
  },
  logoText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 2.5,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 4,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  menuButton: {
    padding: 4,
    marginLeft: 8,
  },
  avatarBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  avatarBtnActive: {
    backgroundColor: "#be185d", // rose-700
    borderColor: "rgba(244, 63, 94, 0.4)",
  },
  avatarBtnInactive: {
    backgroundColor: "rgba(244, 63, 94, 0.3)",
    borderColor: "rgba(244, 63, 94, 0.4)",
  },
  avatarText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },
  userDropdown: {
    position: "absolute",
    top: 48,
    right: 0,
    width: 200,
    backgroundColor: "#0f172a", // slate-900
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
    overflow: "hidden",
  },
  dropdownHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  dropdownName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  dropdownEmail: {
    color: "rgba(255, 255, 255, 0.4)",
    fontSize: 12,
    marginTop: 2,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownItemText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
  },
  activeTabLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#be185d",
    marginTop: 4,
  },
  drawerOverlay: {
    flex: 1,
    flexDirection: "row-reverse",
  },
  drawerBackdrop: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  drawerContainer: {
    width: 280,
    height: "100%",
    backgroundColor: "#000",
    borderRightWidth: 1,
    borderRightColor: "#1e293b",
    elevation: 16,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  drawerHeader: {
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  drawerNav: {
    flex: 1,
    padding: 16,
  },
  drawerNavItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  drawerNavItemActive: {
    backgroundColor: "#f43f5e",
    shadowColor: "#f43f5e",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  drawerNavLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#94a3b8",
    marginLeft: 12,
  },
  drawerNavLabelActive: {
    color: "#fff",
  },
  drawerFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
    backgroundColor: "rgba(255, 255, 255, 0.02)",
  },
  footerSignedText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#475569",
    textTransform: "uppercase",
  },
  footerEmailText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#cbd5e1",
    marginTop: 2,
  },
  footerRoleText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 2,
  },
  drawerLogoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    paddingVertical: 8,
  },
  drawerLogoutText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#f43f5e",
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  drawerFooterPublic: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    gap: 12,
  },
  drawerDealerLoginBtn: {
    backgroundColor: "#be185d",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  drawerDealerLoginText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  drawerRegisterBtn: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  drawerRegisterText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    fontWeight: "600",
  },
  publicFooter: {
    backgroundColor: "#000",
    position: "relative",
    overflow: "hidden",
  },
  footerWatermarkContainer: {
    position: "absolute",
    bottom: -10,
    left: 0,
    right: 0,
    alignItems: "center",
    opacity: 0.2, // slightly lighter/brighter
  },
  footerWatermarkText: {
    fontSize: 80, // Very large text
    fontWeight: "900",
    color: "#fff",
    textTransform: "uppercase",
    letterSpacing: 8,
  },
  footerContent: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 24,
    zIndex: 10,
  },
  footerExploreTitle: {
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 32,
  },
  footerSection: {
    marginBottom: 32,
  },
  footerDesc: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 16,
  },
  footerSectionTitle: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 16,
  },
  footerLink: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 13,
    marginBottom: 12,
  },
  footerContactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  footerCopyrightRow: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 24,
    paddingHorizontal: 24,
    alignItems: "center",
    zIndex: 10,
  },
  footerCopyrightText: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 14,
    textAlign: "center",
  },
  floatingChatBtn: {
    position: "absolute",
    right: 20,
    backgroundColor: "#e11d48", // Dark red / rose-600 matching web customer chat widget
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#e11d48",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 9999,
  }
});
