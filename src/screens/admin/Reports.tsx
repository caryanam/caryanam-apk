import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import ScreenWrapper from "../../components/shared/ScreenWrapper";
import { useAdminReports } from "../../hooks/admin/useAdminReports";
import {
  Download,
  TrendingUp,
  Users,
  IndianRupee,
  Inbox,
  MapPin,
  CheckCircle2,
  AlertCircle,
} from "lucide-react-native";

const DownloadIcon = Download as any;
const TrendingUpIcon = TrendingUp as any;
const UsersIcon = Users as any;
const IndianRupeeIcon = IndianRupee as any;
const InboxIcon = Inbox as any;
const MapPinIcon = MapPin as any;
const CheckCircle2Icon = CheckCircle2 as any;
const AlertCircleIcon = AlertCircle as any;

type DownloadState = "idle" | "loading" | "success" | "error";

const reports = [
  {
    key: "leadConversion",
    title: "Lead Conversion Report",
    desc: "Lead funnel and conversion analytics",
    icon: <InboxIcon size={20} color="#fff" />,
  },
  {
    key: "dealerActivity",
    title: "Dealer Activity Report",
    desc: "Monthly dealer engagement, listings and leads",
    icon: <UsersIcon size={20} color="#fff" />,
  },
  {
    key: "revenueByPlan",
    title: "Revenue by Plan",
    desc: "Subscription revenue split by plan type",
    icon: <IndianRupeeIcon size={20} color="#fff" />,
  },
  {
    key: "topCities",
    title: "Top Cities Report",
    desc: "Top performing cities by leads and listings",
    icon: <MapPinIcon size={20} color="#fff" />,
  },
  {
    key: "vehicleInventory",
    title: "Vehicle Inventory Report",
    desc: "Full vehicle inventory breakdown by status and type",
    icon: <TrendingUpIcon size={20} color="#fff" />,
  },
] as const;

type ReportKey = (typeof reports)[number]["key"];

export default function AdminReports() {
  const [states, setStates] = useState<Record<ReportKey, DownloadState>>({
    leadConversion: "idle",
    dealerActivity: "idle",
    revenueByPlan: "idle",
    topCities: "idle",
    vehicleInventory: "idle",
  });

  const {
    downloadLeadConversion,
    downloadDealerActivity,
    downloadRevenueByPlan,
    downloadTopCities,
    downloadVehicleInventory,
  } = useAdminReports();

  const downloaders: Record<ReportKey, () => Promise<void>> = {
    leadConversion: downloadLeadConversion,
    dealerActivity: downloadDealerActivity,
    revenueByPlan: downloadRevenueByPlan,
    topCities: downloadTopCities,
    vehicleInventory: downloadVehicleInventory,
  };

  const handleDownload = async (key: ReportKey) => {
    setStates((s) => ({ ...s, [key]: "loading" }));
    try {
      await downloaders[key]();
      setStates((s) => ({ ...s, [key]: "success" }));
    } catch {
      setStates((s) => ({ ...s, [key]: "error" }));
    } finally {
      setTimeout(() => setStates((s) => ({ ...s, [key]: "idle" })), 3000);
    }
  };

  return (
    <ScreenWrapper layoutType="admin" scrollEnabled={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Reports</Text>
        <Text style={styles.subtitle}>Download detailed reports for analysis</Text>
      </View>

      <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
        {reports.map((r) => {
          const state = states[r.key];
          return (
            <View key={r.key} style={styles.card}>
              <View style={styles.cardContent}>
                <View style={styles.iconBox}>
                  {r.icon}
                </View>
                <View style={styles.infoCol}>
                  <Text style={styles.reportTitle}>{r.title}</Text>
                  <Text style={styles.reportDesc}>{r.desc}</Text>
                  
                  <TouchableOpacity
                    style={[
                      styles.downloadBtn,
                      state === "success" && styles.successBtn,
                      state === "error" && styles.errorBtn,
                    ]}
                    onPress={() => handleDownload(r.key)}
                    disabled={state === "loading"}
                  >
                    {state === "loading" && <ActivityIndicator size="small" color="#0f172a" style={styles.btnIcon} />}
                    {state === "success" && <CheckCircle2Icon size={14} color="#16a34a" style={styles.btnIcon} />}
                    {state === "error" && <AlertCircleIcon size={14} color="#dc2626" style={styles.btnIcon} />}
                    {state === "idle" && <DownloadIcon size={14} color="#0f172a" style={styles.btnIcon} />}
                    
                    <Text
                      style={[
                        styles.btnText,
                        state === "success" && styles.successText,
                        state === "error" && styles.errorText,
                        state === "loading" && { color: "#64748b" }
                      ]}
                    >
                      {state === "loading"
                        ? "Downloading..."
                        : state === "success"
                          ? "Downloaded!"
                          : state === "error"
                            ? "Failed"
                            : "Download"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 4,
    fontWeight: "400",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "rgba(0,0,0,0.1)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#e11d48", // matches gradient-primary accent
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  infoCol: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  reportDesc: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
    lineHeight: 18,
  },
  downloadBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginTop: 12,
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
  },
  successBtn: {
    borderColor: "#bbf7d0",
    backgroundColor: "#f0fdf4",
  },
  errorBtn: {
    borderColor: "#fecaca",
    backgroundColor: "#fef2f2",
  },
  btnIcon: {
    marginRight: 6,
  },
  btnText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#0f172a",
  },
  successText: {
    color: "#16a34a",
  },
  errorText: {
    color: "#dc2626",
  },
});
