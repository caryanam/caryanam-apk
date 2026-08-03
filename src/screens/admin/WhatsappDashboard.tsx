import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  MessageSquare,
  RefreshCw,
  CheckCircle2,
  XCircle,
  CheckSquare,
  Activity,
  Inbox,
  CarFront,
  Gift,
  Cake,
  FileText,
  AlertCircle,
} from "lucide-react-native";

import ScreenWrapper from "../../components/shared/ScreenWrapper";
import {
  useWhatsappDashboard,
  useWhatsappLeadStats,
  useWhatsappOfferStats,
  useWhatsappVehicleStats,
  useWhatsappBirthdayStats,
  useWhatsappFailedMessages,
  useWhatsappLeadLogs,
  useWhatsappOfferLogs,
  useWhatsappVehicleLogs,
  useWhatsappBirthdayLogs,
  useRetryWhatsappMessage,
  WhatsappLogItem,
} from "../../hooks/admin/useWhatsappDashboard";

export default function AdminWhatsappDashboard() {
  const { data: stats, isLoading: isStatsLoading } = useWhatsappDashboard();
  const { data: leadStats, isLoading: isLeadLoading } = useWhatsappLeadStats();
  const { data: offerStats, isLoading: isOfferLoading } = useWhatsappOfferStats();
  const { data: vehicleStats, isLoading: isVehicleLoading } = useWhatsappVehicleStats();
  const { data: birthdayStats, isLoading: isBirthdayLoading } = useWhatsappBirthdayStats();

  const { data: failedMessages = [], isLoading: isMessagesLoading } = useWhatsappFailedMessages();
  const { data: leadLogs = [], isLoading: isLeadLogsLoading } = useWhatsappLeadLogs();
  const { data: offerLogs = [], isLoading: isOfferLogsLoading } = useWhatsappOfferLogs();
  const { data: vehicleLogs = [], isLoading: isVehicleLogsLoading } = useWhatsappVehicleLogs();
  const { data: birthdayLogs = [], isLoading: isBirthdayLogsLoading } = useWhatsappBirthdayLogs();

  const retryMutation = useRetryWhatsappMessage();
  const [retryingId, setRetryingId] = useState<number | null>(null);

  const [activeTab, setActiveTab] = useState<"failed" | "logs">("failed");
  const [activeLogTab, setActiveLogTab] = useState<"leads" | "offers" | "vehicles" | "birthdays">("leads");

  const handleRetry = async (logType: string, logId: number) => {
    setRetryingId(logId);
    try {
      const result = await retryMutation.mutateAsync({ logType, logId });
      if (result.success) {
        Alert.alert("Success", result.message || "Message retried successfully.");
      } else {
        Alert.alert("Error", result.message || "Retry failed.");
      }
    } catch (error: any) {
      Alert.alert("Error", error?.response?.data?.message || "An error occurred while retrying.");
    } finally {
      setRetryingId(null);
    }
  };

  const renderOverallStat = (
    label: string,
    value: string | number,
    icon: React.ReactNode,
    bgColor: string,
    textColor: string,
    borderColor: string
  ) => (
    <View style={[styles.overallStatCard, { backgroundColor: bgColor, borderColor }]}>
      <View style={[styles.overallStatIconWrapper, { backgroundColor: borderColor }]}>{icon}</View>
      <Text style={[styles.overallStatLabel, { color: textColor }]}>{label}</Text>
      <Text style={styles.overallStatValue}>{value}</Text>
    </View>
  );

  const renderTemplateStat = (title: string, icon: React.ReactNode, templateStats: any, loading: boolean) => (
    <View style={styles.templateCard}>
      <View style={styles.templateHeader}>
        {icon}
        <Text style={styles.templateTitle}>{title}</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="small" color="#cbd5e1" style={{ marginVertical: 20 }} />
      ) : templateStats ? (
        <View style={styles.templateStatsGrid}>
          <View style={styles.templateStatRow}>
            <Text style={styles.templateStatLabel}>Sent</Text>
            <Text style={styles.templateStatVal}>{templateStats.totalSent ?? templateStats.sent ?? 0}</Text>
          </View>
          <View style={styles.templateStatRow}>
            <Text style={styles.templateStatLabel}>Queued</Text>
            <Text style={[styles.templateStatVal, { color: "#d97706" }]}>{templateStats.totalQueued ?? templateStats.queued ?? templateStats.accepted ?? templateStats.totalAccepted ?? 0}</Text>
          </View>
          <View style={styles.templateStatRow}>
            <Text style={styles.templateStatLabel}>Delivered</Text>
            <Text style={[styles.templateStatVal, { color: "#059669" }]}>{templateStats.totalDelivered ?? templateStats.delivered ?? 0}</Text>
          </View>
          <View style={styles.templateStatRow}>
            <Text style={styles.templateStatLabel}>Read</Text>
            <Text style={[styles.templateStatVal, { color: "#2563eb" }]}>{templateStats.totalRead ?? templateStats.read ?? 0}</Text>
          </View>
          <View style={styles.templateStatRow}>
            <Text style={styles.templateStatLabel}>Failed</Text>
            <Text style={[styles.templateStatVal, { color: "#e11d48" }]}>{templateStats.totalFailed ?? templateStats.failed ?? 0}</Text>
          </View>
          
          <View style={styles.templateRatesContainer}>
            <View style={styles.templateRateCol}>
              <Text style={styles.templateRateLabel}>Delivery Rate</Text>
              <Text style={styles.templateRateVal}>{templateStats.deliveryRate ?? 0}%</Text>
            </View>
            <View style={[styles.templateRateCol, { alignItems: "flex-end" }]}>
              <Text style={styles.templateRateLabel}>Read Rate</Text>
              <Text style={styles.templateRateVal}>{templateStats.readRate ?? 0}%</Text>
            </View>
          </View>
        </View>
      ) : (
        <Text style={styles.noDataText}>No data available</Text>
      )}
    </View>
  );

  return (
    <ScreenWrapper layoutType="admin" scrollEnabled>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.pageHeader}>
          <View style={styles.pageHeaderTitleRow}>
            <MessageSquare color="#16a34a" size={24} />
            <Text style={styles.pageTitle}>WhatsApp Dashboard</Text>
          </View>
          <Text style={styles.pageSubtitle}>Monitor WhatsApp messaging performance, logs, and manage failed messages.</Text>
        </View>

        {/* Stats Summary Grid */}
        {isStatsLoading ? (
          <ActivityIndicator size="large" color="#16a34a" style={{ marginVertical: 40 }} />
        ) : stats ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.overallStatsScroll}>
            {renderOverallStat("Total Sent", stats.totalMessagesSent, <Inbox color="#475569" size={16} />, "#ffffff", "#64748b", "#f1f5f9")}
            {renderOverallStat("Queued", stats.totalQueued ?? stats.totalAccepted ?? 0, <RefreshCw color="#d97706" size={16} />, "#fffbeb", "#d97706", "#fde68a")}
            {renderOverallStat("Delivered", stats.totalDelivered, <CheckSquare color="#059669" size={16} />, "#ecfdf5", "#059669", "#a7f3d0")}
            {renderOverallStat("Read", stats.totalRead, <CheckCircle2 color="#2563eb" size={16} />, "#eff6ff", "#2563eb", "#bfdbfe")}
            {renderOverallStat("Failed", stats.totalFailed, <XCircle color="#e11d48" size={16} />, "#fff1f2", "#e11d48", "#fecdd3")}
            {renderOverallStat("Delivery Rate", `${stats.overallDeliveryRate?.toFixed(1)}%`, <Activity color="#4f46e5" size={16} />, "#eef2ff", "#4f46e5", "#c7d2fe")}
            {renderOverallStat("Read Rate", `${stats.overallReadRate?.toFixed(1)}%`, <Activity color="#9333ea" size={16} />, "#faf5ff", "#9333ea", "#e9d5ff")}
          </ScrollView>
        ) : (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>Unable to load dashboard stats.</Text>
          </View>
        )}

        {/* Template Breakdown */}
        <View style={styles.templatesContainer}>
          {renderTemplateStat("Leads Template", <Inbox color="#6366f1" size={20} />, leadStats, isLeadLoading)}
          {renderTemplateStat("Offers Template", <Gift color="#f43f5e" size={20} />, offerStats, isOfferLoading)}
          {renderTemplateStat("Vehicles Template", <CarFront color="#f59e0b" size={20} />, vehicleStats, isVehicleLoading)}
          {renderTemplateStat("Birthday Wishes", <Cake color="#ec4899" size={20} />, birthdayStats, isBirthdayLoading)}
        </View>

        {/* Messages & Logs Management */}
        <View style={styles.logsManagementCard}>
          <View style={styles.logsManagementHeader}>
            <View>
              <View style={styles.logsManagementTitleRow}>
                <FileText color="#2563eb" size={20} />
                <Text style={styles.logsManagementTitle}>Messages & Logs Management</Text>
              </View>
              <Text style={styles.logsManagementSubtitle}>Switch between Failed Messages and Template Activity Logs.</Text>
            </View>
          </View>

          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.mainTabBtn, activeTab === "failed" && styles.mainTabBtnActive]}
              onPress={() => setActiveTab("failed")}
            >
              <AlertCircle size={16} color={activeTab === "failed" ? "#e11d48" : "#64748b"} />
              <Text style={[styles.mainTabText, activeTab === "failed" && styles.mainTabTextActive]}>Failed Messages ({failedMessages.length})</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.mainTabBtn, activeTab === "logs" && styles.mainTabBtnActive]}
              onPress={() => setActiveTab("logs")}
            >
              <FileText size={16} color={activeTab === "logs" ? "#2563eb" : "#64748b"} />
              <Text style={[styles.mainTabText, activeTab === "logs" && styles.mainTabTextActive]}>Activity Logs</Text>
            </TouchableOpacity>
          </View>

          {activeTab === "failed" && (
            <View style={styles.tabContentPanel}>
              {isMessagesLoading ? (
                <ActivityIndicator size="small" color="#94a3b8" style={{ marginVertical: 30 }} />
              ) : failedMessages.length === 0 ? (
                <View style={styles.emptyState}>
                  <CheckCircle2 color="#86efac" size={48} style={{ marginBottom: 12 }} />
                  <Text style={styles.emptyStateTitle}>No Failed Messages</Text>
                  <Text style={styles.emptyStateSub}>All your WhatsApp messages are being delivered successfully.</Text>
                </View>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.tableScroll}>
                  <View style={styles.table}>
                    <View style={styles.tableHeader}>
                      <Text style={[styles.th, { width: 140 }]}>Type & Template</Text>
                      <Text style={[styles.th, { width: 160 }]}>Dealer</Text>
                      <Text style={[styles.th, { width: 180 }]}>Status & Error</Text>
                      <Text style={[styles.th, { width: 100 }]}>Retry Count</Text>
                      <Text style={[styles.th, { width: 150 }]}>Dates</Text>
                      <Text style={[styles.th, { width: 100, textAlign: "right" }]}>Action</Text>
                    </View>
                    {failedMessages.map((msg) => (
                      <View key={msg.logId} style={styles.tableRow}>
                        <View style={[styles.td, { width: 140 }]}>
                          <Text style={styles.tdBold}>{msg.logType}</Text>
                          <Text style={styles.tdMuted}>{msg.templateName}</Text>
                        </View>
                        <View style={[styles.td, { width: 160 }]}>
                          <Text style={styles.tdMedium}>{msg.dealerName}</Text>
                          <Text style={styles.tdMuted}>+{msg.mobileNumber}</Text>
                        </View>
                        <View style={[styles.td, { width: 180 }]}>
                          <View style={styles.badgeError}>
                            <Text style={styles.badgeErrorText}>{msg.deliveryStatus}</Text>
                          </View>
                          <Text style={styles.errorReasonText} numberOfLines={2}>{msg.errorMessage || msg.apiStatus}</Text>
                        </View>
                        <View style={[styles.td, { width: 100 }]}>
                          <Text style={styles.tdMedium}>{msg.retryCount} / 3</Text>
                        </View>
                        <View style={[styles.td, { width: 150 }]}>
                          <Text style={styles.dateLabel}>Created: <Text style={styles.dateVal}>{new Date(msg.createdAt).toLocaleDateString()}</Text></Text>
                          {msg.lastRetryAt && (
                            <Text style={styles.dateLabel}>Retry: <Text style={styles.dateVal}>{new Date(msg.lastRetryAt).toLocaleDateString()}</Text></Text>
                          )}
                        </View>
                        <View style={[styles.td, { width: 100, alignItems: "flex-end" }]}>
                          <TouchableOpacity
                            style={[styles.retryBtn, (!msg.canRetry || retryMutation.isPending) && styles.retryBtnDisabled]}
                            onPress={() => handleRetry(msg.logType, msg.logId)}
                            disabled={!msg.canRetry || retryMutation.isPending}
                          >
                            {retryingId === msg.logId ? (
                              <ActivityIndicator size="small" color="#16a34a" />
                            ) : (
                              <>
                                <RefreshCw size={14} color="#16a34a" />
                                <Text style={styles.retryBtnText}>Retry</Text>
                              </>
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              )}
            </View>
          )}

          {activeTab === "logs" && (
            <View style={styles.tabContentPanel}>
              <View style={styles.subTabsContainer}>
                {(["leads", "offers", "vehicles", "birthdays"] as const).map((tab) => {
                  let Icon = Inbox;
                  let color = "#6366f1";
                  let count = leadLogs.length;
                  if (tab === "offers") { Icon = Gift; color = "#f43f5e"; count = offerLogs.length; }
                  if (tab === "vehicles") { Icon = CarFront; color = "#f59e0b"; count = vehicleLogs.length; }
                  if (tab === "birthdays") { Icon = Cake; color = "#ec4899"; count = birthdayLogs.length; }
                  
                  const isActive = activeLogTab === tab;

                  return (
                    <TouchableOpacity
                      key={tab}
                      style={[styles.subTabBtn, isActive && styles.subTabBtnActive]}
                      onPress={() => setActiveLogTab(tab)}
                    >
                      <Icon size={14} color={color} />
                      <Text style={[styles.subTabText, isActive && styles.subTabTextActive]}>
                        {tab.charAt(0).toUpperCase() + tab.slice(1)} Logs ({count})
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.logListWrapper}>
                {activeLogTab === "leads" && <LogTable logs={leadLogs} loading={isLeadLogsLoading} />}
                {activeLogTab === "offers" && <LogTable logs={offerLogs} loading={isOfferLogsLoading} />}
                {activeLogTab === "vehicles" && <LogTable logs={vehicleLogs} loading={isVehicleLogsLoading} />}
                {activeLogTab === "birthdays" && <LogTable logs={birthdayLogs} loading={isBirthdayLogsLoading} />}
              </View>
            </View>
          )}
        </View>

      </View>
    </ScreenWrapper>
  );
}

function LogTable({ logs, loading }: { logs: WhatsappLogItem[]; loading: boolean }) {
  if (loading) return <ActivityIndicator size="small" color="#94a3b8" style={{ marginVertical: 30 }} />;
  
  if (logs.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Inbox color="#cbd5e1" size={40} style={{ marginBottom: 12 }} />
        <Text style={styles.emptyStateSub}>No log records found for this template.</Text>
      </View>
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.tableScroll}>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.th, { width: 80 }]}>ID</Text>
          <Text style={[styles.th, { width: 160 }]}>Dealer / Recipient</Text>
          <Text style={[styles.th, { width: 120 }]}>Mobile Number</Text>
          <Text style={[styles.th, { width: 100 }]}>Status</Text>
          <Text style={[styles.th, { width: 180 }]}>Error Message</Text>
          <Text style={[styles.th, { width: 140 }]}>Created At</Text>
        </View>
        {logs.map((log) => {
          const status = log.deliveryStatus || log.apiStatus || log.status || "SENT";
          const isFailed = status === "FAILED" || status === "ERROR";
          const isDelivered = status === "DELIVERED" || status === "READ";

          return (
            <View key={log.id} style={styles.tableRow}>
              <View style={[styles.td, { width: 80 }]}>
                <Text style={styles.tdMono}>#{log.id}</Text>
              </View>
              <View style={[styles.td, { width: 160 }]}>
                <Text style={styles.tdMedium}>{log.dealerName || log.dealer?.businessName || log.dealer?.ownerName || log.recipientName || "—"}</Text>
                {log.templateName && <Text style={styles.tdSmall}>{log.templateName}</Text>}
              </View>
              <View style={[styles.td, { width: 120 }]}>
                <Text style={styles.tdMuted}>{log.mobileNumber || log.recipientMobile || log.phone ? `+${log.mobileNumber || log.recipientMobile || log.phone}` : "—"}</Text>
              </View>
              <View style={[styles.td, { width: 100 }]}>
                <View style={[
                  styles.badge, 
                  isFailed ? styles.badgeError : isDelivered ? styles.badgeSuccess : styles.badgeDefault
                ]}>
                  <Text style={[
                    styles.badgeText,
                    isFailed ? styles.badgeErrorText : isDelivered ? styles.badgeSuccessText : styles.badgeDefaultText
                  ]}>{status}</Text>
                </View>
              </View>
              <View style={[styles.td, { width: 180 }]}>
                <Text style={styles.tdMuted} numberOfLines={2}>{log.errorMessage || "—"}</Text>
              </View>
              <View style={[styles.td, { width: 140 }]}>
                <Text style={styles.tdMuted}>{log.createdAt ? new Date(log.createdAt).toLocaleString() : "—"}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: "#f8fafc",
  },
  pageHeader: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  pageHeaderTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#020617",
  },
  pageSubtitle: {
    fontSize: 14,
    color: "#64748b",
  },
  overallStatsScroll: {
    gap: 12,
    paddingRight: 20,
    paddingBottom: 20,
  },
  overallStatCard: {
    width: 140,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  overallStatIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  overallStatLabel: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    marginBottom: 6,
    textAlign: "center",
  },
  overallStatValue: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0f172a",
  },
  errorCard: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    alignItems: "center",
    marginBottom: 20,
  },
  errorText: {
    color: "#64748b",
  },
  templatesContainer: {
    gap: 16,
    marginBottom: 24,
  },
  templateCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  templateHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingBottom: 12,
    marginBottom: 16,
  },
  templateTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
  },
  templateStatsGrid: {
    gap: 12,
  },
  templateStatRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  templateStatLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#64748b",
  },
  templateStatVal: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#334155",
  },
  templateRatesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    marginHorizontal: -20,
    marginBottom: -20,
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  templateRateCol: {
    flex: 1,
  },
  templateRateLabel: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    color: "#94a3b8",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  templateRateVal: {
    fontSize: 15,
    fontWeight: "900",
    color: "#1e293b",
  },
  noDataText: {
    textAlign: "center",
    color: "#94a3b8",
    paddingVertical: 20,
  },
  logsManagementCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  logsManagementHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  logsManagementTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  logsManagementTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
  },
  logsManagementSubtitle: {
    fontSize: 12,
    color: "#64748b",
  },
  tabsContainer: {
    flexDirection: "row",
    padding: 12,
    paddingBottom: 0,
    gap: 8,
    backgroundColor: "#f8fafc",
  },
  mainTabBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "transparent",
  },
  mainTabBtnActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  mainTabText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
  },
  mainTabTextActive: {
    color: "#0f172a",
  },
  tabContentPanel: {
    padding: 0,
  },
  subTabsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
    paddingBottom: 8,
    gap: 8,
    backgroundColor: "#f8fafc",
  },
  subTabBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
  },
  subTabBtnActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  subTabText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
  },
  subTabTextActive: {
    color: "#0f172a",
  },
  logListWrapper: {
    paddingBottom: 16,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  emptyStateSub: {
    fontSize: 13,
    color: "#64748b",
  },
  tableScroll: {
    width: "100%",
  },
  table: {
    minWidth: 800,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  th: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  td: {
    justifyContent: "center",
    paddingRight: 16,
  },
  tdBold: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0f172a",
  },
  tdMedium: {
    fontSize: 13,
    fontWeight: "500",
    color: "#1e293b",
  },
  tdMuted: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  tdSmall: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 2,
  },
  tdMono: {
    fontSize: 12,
    fontFamily: "monospace",
    color: "#64748b",
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeDefault: {
    backgroundColor: "#f1f5f9",
  },
  badgeDefaultText: {
    color: "#475569",
    fontSize: 10,
    fontWeight: "600",
  },
  badgeSuccess: {
    backgroundColor: "#dcfce7",
  },
  badgeSuccessText: {
    color: "#166534",
    fontSize: 10,
    fontWeight: "600",
  },
  badgeError: {
    alignSelf: "flex-start",
    backgroundColor: "#ffe4e6",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginBottom: 4,
  },
  badgeErrorText: {
    color: "#be123c",
    fontSize: 10,
    fontWeight: "600",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "600",
  },
  errorReasonText: {
    fontSize: 12,
    color: "#e11d48",
  },
  dateLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: "#475569",
    marginBottom: 2,
  },
  dateVal: {
    fontWeight: "400",
    color: "#64748b",
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 6,
  },
  retryBtnDisabled: {
    opacity: 0.5,
  },
  retryBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0f172a",
  },
});
