import { Alert, Platform } from "react-native";
import ReactNativeBlobUtil from "react-native-blob-util";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ENV } from "../../utils/env";

type ReportEndpoint =
  | "/api/admin/reports/lead-conversion"
  | "/api/admin/reports/dealer-activity"
  | "/api/admin/reports/revenue-by-plan"
  | "/api/admin/reports/top-cities"
  | "/api/admin/reports/vehicle-inventory";

async function requestReport(endpoint: ReportEndpoint, filename: string): Promise<void> {
  try {
    const token = await AsyncStorage.getItem("adminToken");
    if (!token) throw new Error("No admin token found");

    const url = `${ENV.API_BASE_URL}${endpoint}`;
    const dirs = ReactNativeBlobUtil.fs.dirs;
    const downloadDir = Platform.OS === "ios" ? dirs.DocumentDir : dirs.DownloadDir;
    const filePath = `${downloadDir}/${filename}`;

    const res = await ReactNativeBlobUtil.config({
      fileCache: true,
      path: filePath,
      addAndroidDownloads: {
        useDownloadManager: true,
        notification: true,
        path: filePath,
        description: "Downloading report...",
        title: filename,
        mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }
    }).fetch("GET", url, {
      Authorization: `Bearer ${token}`
    });

    if (Platform.OS === "ios") {
      ReactNativeBlobUtil.ios.previewDocument(res.path());
    }

  } catch (err: any) {
    console.error("Report download error:", err);
    throw err;
  }
}

export function useAdminReports() {
  return {
    downloadLeadConversion: () => requestReport("/api/admin/reports/lead-conversion", "LeadConversionReport.xlsx"),
    downloadDealerActivity: () => requestReport("/api/admin/reports/dealer-activity", "DealerActivityReport.xlsx"),
    downloadRevenueByPlan: () => requestReport("/api/admin/reports/revenue-by-plan", "RevenueByPlanReport.xlsx"),
    downloadTopCities: () => requestReport("/api/admin/reports/top-cities", "TopCitiesReport.xlsx"),
    downloadVehicleInventory: () => requestReport("/api/admin/reports/vehicle-inventory", "VehicleInventoryReport.xlsx"),
  };
}
