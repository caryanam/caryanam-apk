import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../../navigation/AppNavigator";
import ScreenWrapper from "../../components/shared/ScreenWrapper";
import {
  useAdminDealerCount,
  useAdminVehicleCount,
  useAdminPendingCount,
  useAdminLeadCount,
  useAdminTotalRevenue,
  useMonthlyDealerRegistrations,
  useMonthlyLeads,
  useMonthlyRevenue,
} from "../../hooks/admin/useAdminDashboard";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import {
  Users as UsersIcon,
  Car as CarIcon,
  AlertTriangle as AlertTriangleIcon,
  Coins as CoinsIcon,
  LogOut as LogOutIcon,
  Inbox as InboxIcon,
  BarChart2 as BarChart2Icon,
} from "lucide-react-native";

const Users = UsersIcon as any;
const Car = CarIcon as any;
const AlertTriangle = AlertTriangleIcon as any;
const Coins = CoinsIcon as any;
const LogOut = LogOutIcon as any;
const Inbox = InboxIcon as any;
const BarChart2 = BarChart2Icon as any;

import { formatINR } from "../../utils/helpers";
import { BarChart, LineChart } from "../../components/ui/Charts";
import Skeleton from "../../components/ui/Skeleton";

export default function AdminDashboard() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { user, logout: adminLogout } = useAdminAuth();

  const { data: dealerData, isLoading: dealerLoading, refetch: refetchDealers, isFetching: fetchingDealers } = useAdminDealerCount();
  const { data: vehicleData, isLoading: vehicleLoading, refetch: refetchVehicles, isFetching: fetchingVehicles } = useAdminVehicleCount();
  const { data: pendingData, isLoading: pendingLoading, refetch: refetchPending, isFetching: fetchingPending } = useAdminPendingCount();
  const { data: leadData, isLoading: leadLoading, refetch: refetchLeads, isFetching: fetchingLeads } = useAdminLeadCount();
  const { data: revenueData, isLoading: revenueLoading, refetch: refetchRevenue, isFetching: fetchingRevenue } = useAdminTotalRevenue();

  const { data: monthlyRegs = [], isLoading: regsLoading, refetch: refetchRegs, isFetching: fetchingRegs } = useMonthlyDealerRegistrations();
  const { data: monthlyLeads = [], isLoading: leadsChartLoading, refetch: refetchLeadsChart, isFetching: fetchingLeadsChart } = useMonthlyLeads();
  const { data: monthlyRev = [], isLoading: revLoading, refetch: refetchRev, isFetching: fetchingRev } = useMonthlyRevenue();

  const handleRefresh = async () => {
    refetchDealers();
    refetchVehicles();
    refetchPending();
    refetchLeads();
    refetchRevenue();
    refetchRegs();
    refetchLeadsChart();
    refetchRev();
  };

  const isStatsLoading = dealerLoading || vehicleLoading || pendingLoading || leadLoading || revenueLoading;
  const isRefetching = fetchingDealers || fetchingVehicles || fetchingPending || fetchingLeads || fetchingRevenue || fetchingRegs || fetchingLeadsChart || fetchingRev;

  const renderStat = (
    title: string,
    value: string | number,
    icon: React.ReactNode,
    loading: boolean,
    iconBgColor: string
  ) => {
    return (
      <View style={styles.statCard}>
        <View style={styles.statTopRow}>
          <View style={[styles.statIconWrapper, { backgroundColor: iconBgColor }]}>
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
    <ScreenWrapper layoutType="admin" scrollEnabled={true}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl 
            refreshing={isRefetching} 
            onRefresh={handleRefresh} 
            tintColor="#881337" 
            colors={["#881337"]} 
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <Text style={styles.dashboardTitle}>
              Admin Dashboard
            </Text>
            <TouchableOpacity onPress={user ? adminLogout : undefined} style={styles.pageLogoutBtn}>
              <LogOut size={16} color="#e11d48" />
              <Text style={styles.pageLogoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.dashboardSubtitle}>
            Welcome back, {user?.name || "Admin"}! 👋 Here is what's happening today.
          </Text>
        </View>

        {/* Total Revenue - Full Width Top Banner */}
        <View style={styles.revenueCard}>
          <View style={styles.revenueIconBg}>
            <Coins size={28} color="#059669" />
          </View>
          <View style={styles.revenueTextCol}>
            {revenueLoading || isRefetching ? (
              <Skeleton style={{ width: 140, height: 32, borderRadius: 8, marginBottom: 4 }} />
            ) : (
              <Text style={styles.revenueValue}>{formatINR(revenueData?.totalRevenue ?? 0)}</Text>
            )}
            <Text style={styles.revenueLabel}>Total Revenue</Text>
          </View>
        </View>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          {renderStat("Active Dealers", dealerData?.totalDealers ?? 0, <Users size={24} color="#ffffff" />, isStatsLoading || isRefetching, "#2563eb")} 
          {renderStat("Listed Vehicles", vehicleData?.totalVehicles ?? 0, <Car size={24} color="#ffffff" />, isStatsLoading || isRefetching, "#9333ea")} 
          {renderStat("Pending Dealers", pendingData?.totalPendingDealers ?? 0, <AlertTriangle size={24} color="#ffffff" />, isStatsLoading || isRefetching, "#eab308")} 
          {renderStat("Total Leads", leadData?.totalCustomerLeads ?? 0, <Users size={24} color="#ffffff" />, isStatsLoading || isRefetching, "#000000")} 
        </View>

        {/* Quick Actions */}
        <View style={[styles.quickActionsSection, styles.darkCard]}>
          <Text style={[styles.sectionTitle, { color: "#ffffff" }]}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.quickActionBtn} onPress={() => navigation.navigate("AdminDealers")}>
              <View style={[styles.quickActionIcon, { backgroundColor: "rgba(255,255,255,0.1)" }]}>
                <Users size={24} color="#60a5fa" />
              </View>
              <Text style={[styles.quickActionText, { color: "#e2e8f0" }]}>Dealers</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionBtn} onPress={() => navigation.navigate("AdminLeads")}>
              <View style={[styles.quickActionIcon, { backgroundColor: "rgba(255,255,255,0.1)" }]}>
                <Inbox size={24} color="#a78bfa" />
              </View>
              <Text style={[styles.quickActionText, { color: "#e2e8f0" }]}>Leads</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionBtn} onPress={() => navigation.navigate("AdminReports")}>
              <View style={[styles.quickActionIcon, { backgroundColor: "rgba(255,255,255,0.1)" }]}>
                <BarChart2 size={24} color="#f472b6" />
              </View>
              <Text style={[styles.quickActionText, { color: "#e2e8f0" }]}>Reports</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionBtn} onPress={() => navigation.navigate("AdminVehicles")}>
              <View style={[styles.quickActionIcon, { backgroundColor: "rgba(255,255,255,0.1)" }]}>
                <Car size={24} color="#34d399" />
              </View>
              <Text style={[styles.quickActionText, { color: "#e2e8f0" }]}>Cars</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Monthly Registrations Chart */}
        <View style={styles.chartSection}>
          <Text style={[styles.chartTitle, { color: "#2563eb" }]}>Monthly Dealer Registrations</Text>
          {regsLoading || isRefetching ? (
            <View style={styles.chartSkeletonContainer}>
              <Skeleton style={{ height: 200, width: "100%", borderRadius: 12 }} />
            </View>
          ) : monthlyRegs.length === 0 ? (
            <Text style={styles.emptyText}>No onboarding data found.</Text>
          ) : (
            <BarChart
              data={monthlyRegs.map((item: any) => ({ label: item.month, value: item.dealer }))}
              color="#2563eb"
            />
          )}
        </View>

        {/* Monthly Leads Chart */}
        <View style={styles.chartSection}>
          <Text style={[styles.chartTitle, { color: "#000000" }]}>Lead Analytics</Text>
          {leadsChartLoading || isRefetching ? (
            <View style={styles.chartSkeletonContainer}>
              <Skeleton style={{ height: 200, width: "100%", borderRadius: 12 }} />
            </View>
          ) : monthlyLeads.length === 0 ? (
            <Text style={styles.emptyText}>No lead logs found.</Text>
          ) : (
            <LineChart
              data={monthlyLeads.map((item: any) => ({ label: item.month, value: item.leads }))}
              color="#000000"
            />
          )}
        </View>

        {/* Monthly Revenue Chart */}
        <View style={[styles.chartSection, { marginBottom: 32 }]}>
          <Text style={[styles.chartTitle, { color: "#059669" }]}>Monthly Revenue Analytics</Text>
          {revLoading || isRefetching ? (
            <View style={styles.chartSkeletonContainer}>
              <Skeleton style={{ height: 200, width: "100%", borderRadius: 12 }} />
            </View>
          ) : monthlyRev.length === 0 ? (
            <Text style={styles.emptyText}>No billing logs found.</Text>
          ) : (
            <BarChart
              data={monthlyRev.map((item: any) => ({ label: item.month, value: item.revenue }))}
              color="#059669"
              formatValue={(val) =>
                val >= 1000 ? `₹${(val / 1000).toFixed(0)}k` : `₹${val}`
              }
            />
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#ffffff",
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
  revenueCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "rgba(5, 150, 105, 0.2)",
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  revenueIconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(5, 150, 105, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 20,
  },
  revenueTextCol: {
    flex: 1,
  },
  revenueValue: {
    fontSize: 28,
    fontWeight: "900",
    color: "#000000",
  },
  revenueLabel: {
    fontSize: 14,
    color: "#555555",
    fontWeight: "700",
    marginTop: 4,
    textTransform: "uppercase",
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
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#334155",
  },
  chartSection: {
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
  chartTitle: {
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  chartSkeletonContainer: {
    marginVertical: 12,
  },
  emptyText: {
    fontSize: 14,
    color: "#555555",
    textAlign: "center",
    marginVertical: 20,
    fontWeight: "600",
  },
});
