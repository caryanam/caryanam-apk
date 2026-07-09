import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../../navigation/AppNavigator";
import ScreenWrapper from "../../components/shared/ScreenWrapper";
import Skeleton from "../../components/ui/Skeleton";
import { BarChart, LineChart } from "../../components/ui/Charts";
import { useDealerAuth } from "../../contexts/DealerAuthContext";
import {
  useDealerDashboard,
  useVehicleViews,
  useVehicleLeads,
} from "../../hooks/dealer/useDealerDashboard";
import {
  Car as CarIcon,
  Star as StarIcon,
  Inbox as InboxIcon,
  Eye as EyeIcon,
  ArrowUpRight as ArrowUpRightIcon,
  LogOut as LogOutIcon,
  Plus as PlusIcon,
} from "lucide-react-native";

const Car = CarIcon as any;
const Star = StarIcon as any;
const Plus = PlusIcon as any;
const Inbox = InboxIcon as any;
const Eye = EyeIcon as any;
const ArrowUpRight = ArrowUpRightIcon as any;
const LogOut = LogOutIcon as any;

export default function DealerDashboard() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { user, logout: dealerLogout } = useDealerAuth();
  const dealerId = user?.id || "";

  const {
    data: dash,
    isLoading: dashLoading,
    refetch: refetchDash,
    isRefetching: dashRefetching,
  } = useDealerDashboard(dealerId);

  const { data: viewsData = [], isLoading: viewsLoading, refetch: refetchViews, isFetching: viewsRefetching } = useVehicleViews(dealerId);
  const { data: leadsData = [], isLoading: leadsLoading, refetch: refetchLeads, isFetching: leadsRefetching } = useVehicleLeads(dealerId);

  const handleRefresh = async () => {
    refetchDash();
    refetchViews();
    refetchLeads();
  };

  const isAnyRefetching = dashRefetching || viewsRefetching || leadsRefetching;

  const renderStatCard = (
    title: string,
    value: string | number,
    icon: React.ReactNode,
    color: string,
    loading: boolean
  ) => {
    return (
      <View style={styles.statCard}>
        <View style={styles.statTopRow}>
          <View style={[styles.statIconWrapper, { backgroundColor: color }]}>
            {icon}
          </View>
          {loading ? (
            <Skeleton style={{ width: 60, height: 28, borderRadius: 6 }} />
          ) : (
            <Text style={styles.statValue}>{value}</Text>
          )}
        </View>
        <Text style={styles.statLabel}>{title}</Text>
      </View>
    );
  };

  return (
    <ScreenWrapper layoutType="dealer" scrollEnabled={true}>
        <ScrollView
          contentContainerStyle={styles.container}
          refreshControl={
            <RefreshControl 
              refreshing={isAnyRefetching} 
              onRefresh={handleRefresh} 
              tintColor="#8b5cf6" 
              colors={["#8b5cf6"]} 
            />
          }
        >
          <View style={styles.header}>
            <View style={styles.headerTopRow}>
              <Text style={styles.dashboardTitle}>
                Dealer Dashboard
              </Text>
              <TouchableOpacity onPress={user ? dealerLogout : undefined} style={styles.pageLogoutBtn}>
                <LogOut size={16} color="#e11d48" />
                <Text style={styles.pageLogoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.dashboardSubtitle}>
              Welcome back, {dash?.dealerName || user?.name || "Dealer"}! 👋 Here is what's happening today.
            </Text>
          </View>
  
          {/* Stat Cards Grid */}
          <View style={styles.statsGrid}>
            {renderStatCard("Total Vehicles", dash?.totalVehicles ?? 0, <Car size={24} color="#ffffff" />, "#8b5cf6", dashLoading || isAnyRefetching)}
            {renderStatCard("Featured Stock", dash?.featuredVehicles ?? 0, <Star size={24} color="#ffffff" />, "#f59e0b", dashLoading || isAnyRefetching)}
            {renderStatCard("Total Leads", dash?.totalLeads ?? 0, <Inbox size={24} color="#ffffff" />, "#3b82f6", dashLoading || isAnyRefetching)}
            {renderStatCard("Profile Views", dash?.vehicleViews ?? 0, <Eye size={24} color="#ffffff" />, "#10b981", dashLoading || isAnyRefetching)}
          </View>

          {/* Quick Actions */}
          <View style={[styles.quickActionsSection, styles.darkCard]}>
            <Text style={[styles.sectionTitle, { color: "#ffffff" }]}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity style={styles.quickActionBtn} onPress={() => navigation.navigate("DealerVehicles")}>
                <View style={[styles.quickActionIcon, { backgroundColor: "rgba(255,255,255,0.1)" }]}>
                  <Car size={24} color="#a78bfa" />
                </View>
                <Text style={[styles.quickActionText, { color: "#e2e8f0" }]}>My Stock</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionBtn} onPress={() => navigation.navigate("DealerLeads")}>
                <View style={[styles.quickActionIcon, { backgroundColor: "rgba(255,255,255,0.1)" }]}>
                  <Inbox size={24} color="#60a5fa" />
                </View>
                <Text style={[styles.quickActionText, { color: "#e2e8f0" }]}>Leads</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionBtn} onPress={() => navigation.navigate("DealerVehicleForm")}>
                <View style={[styles.quickActionIcon, { backgroundColor: "rgba(255,255,255,0.1)" }]}>
                  <Plus size={24} color="#34d399" />
                </View>
                <Text style={[styles.quickActionText, { color: "#e2e8f0" }]}>Add Car</Text>
              </TouchableOpacity>
            </View>
          </View>

            {/* Leads Analytics Bar Section */}
            <View style={styles.analyticsSection}>
              <Text style={styles.sectionTitle}>Views by Month</Text>
              {viewsLoading || isAnyRefetching ? (
                <View style={{ marginVertical: 12 }}>
                  <Skeleton style={{ height: 200, width: "100%", borderRadius: 12 }} />
                </View>
              ) : viewsData.length === 0 ? (
                <Text style={styles.emptyText}>No views data available yet.</Text>
              ) : (
                <LineChart
                  data={viewsData.map((item: any) => ({ label: item.month, value: item.views || 0 }))}
                  color="#2563eb"
                />
              )}
            </View>

            {/* Performance Analytics Section */}
            <View style={[styles.analyticsSection, { marginBottom: 32 }]}>
              <Text style={styles.sectionTitle}>Leads Performance</Text>
              {leadsLoading || isAnyRefetching ? (
                <View style={{ marginVertical: 12 }}>
                  <Skeleton style={{ height: 200, width: "100%", borderRadius: 12 }} />
                </View>
              ) : leadsData.length === 0 ? (
                <Text style={styles.emptyText}>No leads logged yet.</Text>
              ) : (
                <BarChart
                  data={leadsData.map((item: any) => ({ label: item.month, value: item.leads || 0 }))}
                  color="#10b981"
                />
              )}
            </View>
        </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  pageLogoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffe4e6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  pageLogoutText: {
    color: "#e11d48",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  dashboardTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#881337",
  },
  dashboardSubtitle: {
    fontSize: 14,
    color: "#333333",
    marginTop: 6,
    fontWeight: "600",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: "rgba(0, 0, 0, 0.05)",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  statTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  statIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "900",
    color: "#000000",
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#555555",
    textTransform: "uppercase",
  },
  quickActionsSection: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    marginTop: 8,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: "rgba(0, 0, 0, 0.05)",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  darkCard: {
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
  },
  quickActionsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickActionBtn: {
    alignItems: "center",
    flex: 1,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
  },
  analyticsSection: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    marginTop: 8,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: "rgba(0, 0, 0, 0.05)",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: 0.5,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "center",
    marginVertical: 12,
  },
  barChartContainer: {
    paddingVertical: 4,
  },
  chartBarRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
});
