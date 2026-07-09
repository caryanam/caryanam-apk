import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Image,
  Alert,
  Platform,
} from "react-native";
import ScreenWrapper from "../../../components/shared/ScreenWrapper";
import { useDealerAuth } from "../../../contexts/DealerAuthContext";
import {
  useGetSubscriptionPlans,
  useGetCurrentPlan,
  usePurchaseSubscription,
} from "../../../hooks/dealer/useSubscription";
import { Star, Clock, Check, Loader2, Copy } from "lucide-react-native";
import Skeleton from "../../../components/ui/Skeleton";

const UPI_ID = "9579078460-2@ybl";

function getQrUrl(amount: number) {
  const upiString = `upi://pay?pa=${UPI_ID}&pn=Caryanam&am=${amount}&cu=INR`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=10&data=${encodeURIComponent(
    upiString
  )}`;
}

const PLAN_ORDER = ["BASIC", "STANDARD", "PREMIUM"];

export default function DealerSubscription() {
  const { user } = useDealerAuth();
  const dealerId = user?.id?.toString() || "";

  const { data: plans = [], isLoading: plansLoading } = useGetSubscriptionPlans();
  const { data: currentPlan, isLoading: currentLoading } = useGetCurrentPlan(dealerId);
  const purchaseMutation = usePurchaseSubscription(dealerId);

  const activePlan = currentPlan?.plan;
  const currentMessage = currentPlan?.message ?? "";

  const [qrDialog, setQrDialog] = useState<{ planName: string; amount: number } | null>(null);

  const handleCopy = () => {
    // Basic fallback for React Native without clipboard module
    Alert.alert("UPI ID", UPI_ID);
  };

  const handleOpenQr = (planName: string, amount: number) => {
    setQrDialog({ planName, amount });
  };

  const handlePurchase = async () => {
    if (!qrDialog) return;
    try {
      const res = await purchaseMutation.mutateAsync(qrDialog.planName);
      Alert.alert(
        "Success",
        `${res.data?.subscriptionPlan ?? qrDialog.planName} plan purchased!\nTxn ID: ${
          res.data?.transactionId ?? ""
        }`
      );
      setQrDialog(null);
    } catch (err: any) {
      Alert.alert(
        "Error",
        err?.response?.data?.message ?? (err instanceof Error ? err.message : "Purchase failed")
      );
    }
  };

  const sortedPlans = [...plans].sort(
    (a, b) => PLAN_ORDER.indexOf(a.planName) - PLAN_ORDER.indexOf(b.planName)
  );

  const isLoading = plansLoading || currentLoading;

  const renderSkeleton = () => (
    <View style={styles.content}>
      <Skeleton style={{ height: 28, width: 150, marginBottom: 8, borderRadius: 4 }} />
      <Skeleton style={{ height: 16, width: 200, marginBottom: 24, borderRadius: 4 }} />
      <Skeleton style={{ height: 180, width: "100%", borderRadius: 16, marginBottom: 24 }} />
      <Skeleton style={{ height: 250, width: "100%", borderRadius: 16, marginBottom: 16 }} />
      <Skeleton style={{ height: 250, width: "100%", borderRadius: 16, marginBottom: 16 }} />
    </View>
  );

  return (
    <ScreenWrapper layoutType="dealer" scrollEnabled={true}>
      {isLoading ? (
        renderSkeleton()
      ) : (
        <View style={styles.content}>
          <Text style={styles.pageTitle}>Subscription</Text>
          <Text style={styles.pageSubtitle}>Manage your subscription plan</Text>

          {/* Active Subscription */}
          {activePlan ? (
            <View style={styles.activePlanCard}>
              <View style={styles.activePlanHeader}>
                <View style={styles.starIconWrapper}>
                  <Star size={24} color="#f43f5e" fill="#f43f5e" />
                </View>
                <View style={styles.activePlanInfo}>
                  <View style={styles.planNameRow}>
                    <Text style={styles.activePlanName}>{activePlan.subscriptionPlan}</Text>
                    <View style={styles.activeBadge}>
                      <Text style={styles.activeBadgeText}>Active</Text>
                    </View>
                  </View>
                  <Text style={styles.activePlanPrice}>
                    ₹{activePlan.amount.toLocaleString("en-IN")}/month
                  </Text>
                </View>
              </View>

              <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Vehicle Limit</Text>
                  <Text style={styles.statValue}>{activePlan.vehicleLimit}</Text>
                </View>
                <View style={[styles.statBox, styles.statBorder]}>
                  <Text style={styles.statLabel}>Remaining</Text>
                  <Text
                    style={[
                      styles.statValue,
                      activePlan.remainingDays <= 7 ? { color: "#dc2626" } : { color: "#16a34a" },
                    ]}
                  >
                    {activePlan.remainingDays}
                  </Text>
                  <Text style={styles.statUnit}>Days</Text>
                </View>
                <View style={[styles.statBox, styles.statBorder]}>
                  <Text style={styles.statLabel}>Expires On</Text>
                  <Text style={styles.statDate}>
                    {new Date(activePlan.subscriptionEndDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </Text>
                </View>
              </View>

              {activePlan.remainingDays <= 7 && (
                <View style={styles.warningBox}>
                  <Text style={styles.warningText}>
                    Subscription expires in {activePlan.remainingDays} days. Please renew your plan.
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.noPlanCard}>
              <View style={styles.noPlanIconWrapper}>
                <Clock size={20} color="#d97706" />
              </View>
              <Text style={styles.noPlanText}>{currentMessage}</Text>
            </View>
          )}

          {/* Plans Grid */}
          <View style={styles.plansContainer}>
            {sortedPlans.map((plan) => {
              const isPopular = plan.planName === "STANDARD";
              const isCurrent = activePlan?.subscriptionPlan === plan.planName;
              const isPending =
                purchaseMutation.isPending && purchaseMutation.variables === plan.planName;

              return (
                <View
                  key={plan.planName}
                  style={[
                    styles.planCard,
                    isCurrent && styles.planCardCurrent,
                    isPopular && !isCurrent && styles.planCardPopular,
                  ]}
                >
                  {isPopular && !isCurrent && (
                    <View style={styles.popularBadge}>
                      <Star size={12} color="#fff" fill="#fff" />
                      <Text style={styles.popularBadgeText}>Most Popular</Text>
                    </View>
                  )}

                  {isCurrent && (
                    <View style={styles.currentBadge}>
                      <Text style={styles.currentBadgeText}>Current Plan</Text>
                    </View>
                  )}

                  <Text style={styles.planName}>{plan.planName}</Text>
                  <View style={styles.planPriceRow}>
                    <Text style={styles.planPrice}>₹{plan.amount.toLocaleString("en-IN")}</Text>
                    <Text style={styles.planPriceSuffix}>/month</Text>
                  </View>

                  <View style={styles.planFeatures}>
                    <View style={styles.featureRow}>
                      <Check size={16} color="#16a34a" style={styles.featureIcon} />
                      <Text style={styles.featureText}>Up to {plan.vehicleLimit} vehicle listings</Text>
                    </View>
                    <View style={styles.featureRow}>
                      <Check size={16} color="#16a34a" style={styles.featureIcon} />
                      <Text style={styles.featureText}>{plan.validityMonths} month validity</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.planBtn,
                      isCurrent && styles.planBtnCurrent,
                      isPopular && !isCurrent && styles.planBtnPopular,
                    ]}
                    disabled={isCurrent || purchaseMutation.isPending}
                    onPress={() => handleOpenQr(plan.planName, plan.amount)}
                  >
                    {isPending ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : isCurrent ? (
                      <>
                        <Check size={16} color="#fff" style={{ marginRight: 6 }} />
                        <Text style={styles.planBtnText}>Active Plan</Text>
                      </>
                    ) : (
                      <Text
                        style={[
                          styles.planBtnText,
                          (!isPopular || isCurrent) && { color: "#1e293b" },
                        ]}
                      >
                        Get {plan.planName}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* QR Code Modal */}
      <Modal visible={!!qrDialog} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setQrDialog(null)} />
          
          <View style={styles.modalContent}>
            {qrDialog && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Complete Payment</Text>
                  <View style={styles.modalHeaderRow}>
                    <Text style={styles.modalPlanName}>{qrDialog.planName} PLAN</Text>
                    <Text style={styles.modalPlanAmount}>₹{qrDialog.amount.toLocaleString("en-IN")}</Text>
                  </View>
                </View>

                <View style={styles.modalBody}>
                  <View style={styles.qrContainer}>
                    <Image
                      source={{ uri: getQrUrl(qrDialog.amount) }}
                      style={styles.qrImage}
                      resizeMode="cover"
                    />
                    <View style={styles.qrLogoWrapper}>
                      <Image source={require("../../../assets/logo.png")} style={styles.qrLogo} />
                    </View>
                  </View>

                  <View style={styles.upiRow}>
                    <View style={styles.upiInfo}>
                      <Text style={styles.upiLabel}>UPI ID</Text>
                      <Text style={styles.upiText} numberOfLines={1}>
                        {UPI_ID}
                      </Text>
                    </View>
                    <TouchableOpacity style={styles.copyBtn} onPress={handleCopy}>
                      <Copy size={16} color="#64748b" />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.instructionText}>
                    Scan QR or note UPI ID, then click Confirm Purchase.
                  </Text>

                  <TouchableOpacity
                    style={styles.confirmBtn}
                    disabled={purchaseMutation.isPending}
                    onPress={handlePurchase}
                  >
                    {purchaseMutation.isPending ? (
                      <>
                        <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.confirmBtnText}>Processing...</Text>
                      </>
                    ) : (
                      <Text style={styles.confirmBtnText}>Confirm Purchase</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 80,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 24,
  },
  activePlanCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 32,
    overflow: "hidden",
  },
  activePlanHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  starIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#ffe4e6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  activePlanInfo: {
    flex: 1,
  },
  planNameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  activePlanName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0f172a",
    marginRight: 10,
  },
  activeBadge: {
    backgroundColor: "#16a34a",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  activeBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  activePlanPrice: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  statsGrid: {
    flexDirection: "row",
  },
  statBox: {
    flex: 1,
    padding: 20,
    alignItems: "center",
  },
  statBorder: {
    borderLeftWidth: 1,
    borderLeftColor: "#f1f5f9",
  },
  statLabel: {
    fontSize: 10,
    textTransform: "uppercase",
    color: "#94a3b8",
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0f172a",
  },
  statUnit: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 2,
  },
  statDate: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
    textAlign: "center",
  },
  warningBox: {
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    backgroundColor: "#fef2f2",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  warningText: {
    color: "#dc2626",
    fontSize: 13,
    fontWeight: "600",
  },
  noPlanCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    marginBottom: 32,
  },
  noPlanIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fef3c7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  noPlanText: {
    fontSize: 14,
    color: "#64748b",
    flex: 1,
  },
  plansContainer: {
    gap: 20,
  },
  planCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    position: "relative",
  },
  planCardCurrent: {
    borderColor: "#22c55e",
    borderWidth: 2,
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  planCardPopular: {
    borderColor: "#f43f5e",
    borderWidth: 2,
    shadowColor: "#f43f5e",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    marginTop: 10, // make space for absolute badge
  },
  popularBadge: {
    position: "absolute",
    top: -14,
    alignSelf: "center",
    backgroundColor: "#f43f5e",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    zIndex: 2,
  },
  popularBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    marginLeft: 4,
  },
  currentBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "#16a34a",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  planName: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: 8,
  },
  planPriceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 24,
  },
  planPrice: {
    fontSize: 32,
    fontWeight: "900",
    color: "#0f172a",
  },
  planPriceSuffix: {
    fontSize: 14,
    color: "#64748b",
    marginLeft: 4,
  },
  planFeatures: {
    gap: 12,
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  featureIcon: {
    marginRight: 8,
  },
  featureText: {
    fontSize: 14,
    color: "#334155",
  },
  planBtn: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  planBtnCurrent: {
    backgroundColor: "#16a34a",
    borderColor: "#16a34a",
  },
  planBtnPopular: {
    backgroundColor: "#f43f5e",
    borderColor: "#f43f5e",
  },
  planBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#fff",
    borderRadius: 24,
    overflow: "hidden",
  },
  modalHeader: {
    backgroundColor: "#f43f5e",
    padding: 20,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 8,
  },
  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalPlanName: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  modalPlanAmount: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "900",
  },
  modalBody: {
    padding: 20,
    alignItems: "center",
  },
  qrContainer: {
    width: 180,
    height: 180,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#f1f5f9",
    overflow: "hidden",
    position: "relative",
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  qrImage: {
    width: "100%",
    height: "100%",
  },
  qrLogoWrapper: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 36,
    height: 36,
    marginTop: -18,
    marginLeft: -18,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
  },
  qrLogo: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  upiRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    width: "100%",
    marginBottom: 16,
  },
  upiInfo: {
    flex: 1,
  },
  upiLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 2,
  },
  upiText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  copyBtn: {
    padding: 6,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
  },
  instructionText: {
    fontSize: 10,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 20,
  },
  confirmBtn: {
    width: "100%",
    height: 48,
    backgroundColor: "#f43f5e",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  confirmBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});
