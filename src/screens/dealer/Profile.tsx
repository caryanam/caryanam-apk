import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Modal,
  Alert,
} from "react-native";
import ScreenWrapper from "../../components/shared/ScreenWrapper";
import { useDealerAuth } from "../../contexts/DealerAuthContext";
import {
  useGetDealerProfile,
} from "../../hooks/dealer/useGetDealerProfile";
import {
  useUpdateDealerProfile,
  UpdateProfileError,
} from "../../hooks/dealer/useUpdateDealerProfile";
import {
  useCustomerSendOtp,
  useCustomerVerifyOtp,
  useCustomerResetPassword,
} from "../../hooks/auth/resetPassword";
import Skeleton from "../../components/ui/Skeleton";
import { Building2, MapPin, Phone, Lock, User, Mail, ShieldAlert } from "lucide-react-native";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function DealerProfile() {
  const { user, updateUserFields } = useDealerAuth();
  const dealerId = user?.id?.toString() || "";

  const { data: profile, isLoading } = useGetDealerProfile(dealerId);
  const updateMutation = useUpdateDealerProfile(dealerId);

  // Profile form state
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [dealerMobile, setDealerMobile] = useState("");
  const [executiveMobile, setExecutiveMobile] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [yearsInBusiness, setYearsInBusiness] = useState<string>("");

  useEffect(() => {
    if (profile) {
      setBusinessName(profile.businessName || "");
      setOwnerName(profile.ownerName || "");
      setDealerMobile(profile.dealerMobile || profile.mobile || "");
      setExecutiveMobile(profile.executiveMobile || "");
      setWhatsapp(profile.whatsapp || "");
      setAddress(profile.address || "");
      setCity(profile.city || "");
      setState(profile.state || "");
      setPinCode(profile.pinCode || "");
      setGstNumber(profile.gstNumber || "");
      setYearsInBusiness(
        profile.yearsInBusiness !== undefined && profile.yearsInBusiness !== null
          ? String(profile.yearsInBusiness)
          : ""
      );
    }
  }, [profile]);

  const handleProfileSubmit = async () => {
    try {
      await updateMutation.mutateAsync({
        businessName,
        executiveMobile: executiveMobile || null,
        whatsapp,
        address,
        city,
        state,
        pinCode,
      });
      updateUserFields({ businessName });
      Alert.alert("Success", "Profile updated successfully");
    } catch (err: any) {
      if (err instanceof UpdateProfileError && err.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
        const errorMessages = Object.values(err.fieldErrors).join("\n");
        Alert.alert("Validation Error", errorMessages);
      } else {
        Alert.alert("Error", err instanceof Error ? err.message : "Failed to update profile");
      }
    }
  };

  // Change password flow
  const [pwModal, setPwModal] = useState(false);
  const [step, setStep] = useState<"send" | "verify" | "reset">("send");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const otpInputs = useRef<Array<TextInput | null>>([]);

  const { isPending: sendingOtp, sendOtp } = useCustomerSendOtp();
  const { isPending: verifyingOtp, verifyOtp } = useCustomerVerifyOtp();
  const { isPending: resettingPassword, resetPassword } = useCustomerResetPassword();

  const openPasswordModal = () => {
    setStep("send");
    setEmail(profile?.email || "");
    setOtp(["", "", "", "", "", ""]);
    setNewPassword("");
    setConfirmPassword("");
    setPwModal(true);
  };

  const handleSendOtp = async () => {
    if (!email) return;
    try {
      const res = await sendOtp(email);
      Alert.alert("Success", typeof res === "string" ? res : (res?.message || res?.data?.message || "OTP sent to your email"));
      setStep("verify");
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to send OTP");
    }
  };

  const handleVerifyOtp = async () => {
    const fullOtp = otp.join("");
    if (fullOtp.length !== 6) return Alert.alert("Error", "Please enter 6-digit OTP");
    try {
      const res = await verifyOtp({ email, otp: fullOtp });
      Alert.alert("Success", typeof res === "string" ? res : (res?.message || res?.data?.message || "OTP verified"));
      setStep("reset");
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to verify OTP");
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      return Alert.alert("Error", "Passwords do not match");
    }
    if (newPassword.length < 6) {
      return Alert.alert("Error", "Password must be at least 6 characters long");
    }
    const fullOtp = otp.join("");
    try {
      const res = await resetPassword({ email, otp: fullOtp, newPassword });
      Alert.alert("Success", typeof res === "string" ? res : (res?.message || res?.data?.message || "Password changed successfully"));
      setPwModal(false);
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to reset password");
    }
  };

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text.replace(/[^0-9]/g, "");
    setOtp(newOtp);
    if (text && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  if (isLoading) {
    return (
      <ScreenWrapper layoutType="dealer" scrollEnabled={true}>
        <View style={styles.content}>
          <Skeleton style={{ height: 200, width: "100%", borderRadius: 24, marginBottom: 24 }} />
          <Skeleton style={{ height: 400, width: "100%", borderRadius: 24 }} />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper layoutType="dealer" scrollEnabled={true}>
      <View style={styles.content}>
        <Text style={styles.pageTitle}>Profile</Text>
        <Text style={styles.pageSubtitle}>Manage your business information and security.</Text>

        {/* Top Card */}
        <View style={styles.card}>
          <View style={styles.showroomBanner}>
            {profile?.showroomImage ? (
              <Image source={{ uri: profile.showroomImage.trim() }} style={styles.showroomImg} />
            ) : (
              <View style={styles.showroomFallback}>
                <Building2 size={48} color="#e2e8f0" />
              </View>
            )}
            <View style={styles.bannerOverlay} />
          </View>

          <View style={styles.cardBody}>
            <View style={styles.profileHeader}>
              <View style={styles.profileHeaderLeft}>
                {profile?.dealerLogo ? (
                  <Image source={{ uri: profile.dealerLogo.trim() }} style={styles.avatarImg} />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={styles.avatarFallbackText}>
                      {businessName?.charAt(0)?.toUpperCase()}
                    </Text>
                  </View>
                )}
                <View style={styles.profileTitles}>
                  <Text style={styles.businessNameTxt}>{businessName}</Text>
                  <Text style={styles.ownerNameTxt}>Owner: {ownerName}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.pwdBtn} onPress={openPasswordModal}>
                <Lock size={14} color="#fff" />
                <Text style={styles.pwdBtnText}>Change Password</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.infoGrid}>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue} numberOfLines={1}>
                  {profile?.email}
                </Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>GST Number</Text>
                <Text style={styles.infoValue}>{profile?.gstNumber || "—"}</Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Years in Business</Text>
                <Text style={styles.infoValue}>{profile?.yearsInBusiness ?? "—"} years</Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Registered On</Text>
                <Text style={styles.infoValue}>
                  {profile?.createdAt ? formatDate(profile.createdAt) : "—"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>Edit Profile</Text>
            <Text style={styles.formSubtitle}>Update your company profile and showroom details.</Text>
          </View>

          <View style={styles.formSection}>
            <View style={styles.sectionTitleRow}>
              <Building2 size={16} color="#1e3a8a" />
              <Text style={styles.sectionTitle}>BUSINESS INFORMATION</Text>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Business Name</Text>
              <TextInput
                style={styles.input}
                value={businessName}
                onChangeText={setBusinessName}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Owner Name</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={ownerName}
                editable={false}
              />
            </View>
          </View>

          <View style={styles.formSection}>
            <View style={styles.sectionTitleRow}>
              <Phone size={16} color="#1e3a8a" />
              <Text style={styles.sectionTitle}>CONTACT DETAILS</Text>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Dealer Mobile</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={dealerMobile}
                editable={false}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Executive Mobile (optional)</Text>
              <TextInput
                style={styles.input}
                value={executiveMobile}
                keyboardType="numeric"
                maxLength={10}
                onChangeText={(t) => setExecutiveMobile(t.replace(/[^0-9]/g, ""))}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>WhatsApp Number</Text>
              <TextInput
                style={styles.input}
                value={whatsapp}
                keyboardType="numeric"
                maxLength={10}
                onChangeText={(t) => setWhatsapp(t.replace(/[^0-9]/g, ""))}
              />
            </View>
          </View>

          <View style={styles.formSection}>
            <View style={styles.sectionTitleRow}>
              <MapPin size={16} color="#1e3a8a" />
              <Text style={styles.sectionTitle}>LOCATION DETAILS</Text>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Office / Showroom Address</Text>
              <TextInput style={styles.input} value={address} onChangeText={setAddress} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>City</Text>
              <TextInput style={styles.input} value={city} onChangeText={setCity} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>State</Text>
              <TextInput style={styles.input} value={state} onChangeText={setState} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>PIN Code</Text>
              <TextInput
                style={styles.input}
                value={pinCode}
                keyboardType="numeric"
                maxLength={6}
                onChangeText={(t) => setPinCode(t.replace(/[^0-9]/g, ""))}
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.saveBtn}
            disabled={updateMutation.isPending}
            onPress={handleProfileSubmit}
          >
            {updateMutation.isPending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.saveBtnText}>Save Profile Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Password Reset Modal */}
      <Modal visible={pwModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {step === "send" && "Change Password"}
                {step === "verify" && "Verify OTP"}
                {step === "reset" && "Set New Password"}
              </Text>
              <Text style={styles.modalDesc}>
                {step === "send"
                  ? "Enter your email address to receive a verification OTP code."
                  : step === "verify"
                  ? "Enter the 6-digit OTP code sent to your email."
                  : "Enter your current password and set a secure new password."}
              </Text>
            </View>

            <View style={styles.stepIndicator}>
              {(["send", "verify", "reset"] as const).map((s, i) => (
                <View key={s} style={{ flexDirection: "row", alignItems: "center" }}>
                  <View
                    style={[
                      styles.stepCircle,
                      step === s ? styles.stepCircleActive : (i < (step === "verify" ? 1 : step === "reset" ? 2 : 0) ? styles.stepCircleDone : styles.stepCirclePending),
                    ]}
                  >
                    <Text
                      style={[
                        styles.stepNum,
                        step === s ? styles.stepNumActive : (i < (step === "verify" ? 1 : step === "reset" ? 2 : 0) ? styles.stepNumDone : styles.stepNumPending),
                      ]}
                    >
                      {i + 1}
                    </Text>
                  </View>
                  {i < 2 && <View style={styles.stepLine} />}
                </View>
              ))}
            </View>

            <View style={styles.modalBody}>
              {step === "send" && (
                <View style={styles.modalForm}>
                  <Text style={styles.label}>Email Address</Text>
                  <View style={styles.inputWrapper}>
                    <Mail size={18} color="#94a3b8" style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, styles.pl10]}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                  <TouchableOpacity style={styles.primaryBtn} onPress={handleSendOtp} disabled={sendingOtp}>
                    {sendingOtp ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.primaryBtnText}>Send OTP</Text>}
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setPwModal(false)}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}

              {step === "verify" && (
                <View style={styles.modalForm}>
                  <Text style={styles.otpSentText}>
                    OTP sent to <Text style={{ fontWeight: "bold" }}>{email}</Text>
                  </Text>
                  <View style={styles.otpContainer}>
                    {otp.map((digit, i) => (
                      <TextInput
                        key={i}
                        ref={(ref) => (otpInputs.current[i] = ref)}
                        style={styles.otpInput}
                        keyboardType="numeric"
                        maxLength={1}
                        value={digit}
                        onChangeText={(t) => handleOtpChange(t, i)}
                      />
                    ))}
                  </View>
                  <View style={styles.btnRow}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => setStep("send")}>
                      <Text style={styles.backBtnText}>Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.primaryBtn, { flex: 1.5, marginTop: 0 }]} onPress={handleVerifyOtp} disabled={verifyingOtp}>
                      {verifyingOtp ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.primaryBtnText}>Verify OTP</Text>}
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {step === "reset" && (
                <View style={styles.modalForm}>
                  <Text style={styles.label}>New Password</Text>
                  <View style={styles.inputWrapper}>
                    <Lock size={18} color="#94a3b8" style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, styles.pl10]}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry
                    />
                  </View>
                  <Text style={styles.label}>Confirm New Password</Text>
                  <View style={styles.inputWrapper}>
                    <Lock size={18} color="#94a3b8" style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, styles.pl10]}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry
                    />
                  </View>
                  <TouchableOpacity style={styles.primaryBtn} onPress={handleResetPassword} disabled={resettingPassword}>
                    {resettingPassword ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.primaryBtnText}>Change Password</Text>}
                  </TouchableOpacity>
                </View>
              )}
            </View>
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
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 24,
    overflow: "hidden",
  },
  showroomBanner: {
    height: 160,
    backgroundColor: "#f1f5f9",
    position: "relative",
  },
  showroomImg: {
    width: "100%",
    height: "100%",
  },
  showroomFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
  },
  bannerOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  cardBody: {
    padding: 24,
    paddingTop: 0,
  },
  profileHeader: {
    flexDirection: "column",
    alignItems: "center",
    marginTop: -48,
    marginBottom: 24,
  },
  profileHeaderLeft: {
    flexDirection: "column",
    alignItems: "center",
  },
  avatarImg: {
    width: 96,
    height: 96,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: "#fff",
    backgroundColor: "#fff",
  },
  avatarFallback: {
    width: 96,
    height: 96,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: "#fff",
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarFallbackText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
  },
  profileTitles: {
    marginTop: 12,
    marginBottom: 16,
    alignItems: "center",
  },
  businessNameTxt: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0f172a",
    textTransform: "capitalize",
    textAlign: "center",
  },
  ownerNameTxt: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
    textTransform: "capitalize",
  },
  pwdBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e11d48",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 4,
  },
  pwdBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 6,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 20,
  },
  infoBox: {
    width: "50%",
    marginBottom: 16,
    paddingRight: 10,
  },
  infoLabel: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "600",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
  },
  formHeader: {
    padding: 24,
    paddingBottom: 0,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  formSubtitle: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  formSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingBottom: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#1e3a8a",
    marginLeft: 6,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 14,
    color: "#0f172a",
  },
  inputDisabled: {
    backgroundColor: "#f8fafc",
    color: "#94a3b8",
  },
  saveBtn: {
    backgroundColor: "#e11d48",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginHorizontal: 24,
    marginBottom: 24,
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#fff",
    borderRadius: 24,
    overflow: "hidden",
  },
  modalHeader: {
    padding: 24,
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: 8,
  },
  modalDesc: {
    fontSize: 12,
    color: "#64748b",
    lineHeight: 18,
  },
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  stepCircleActive: {
    backgroundColor: "#0f172a",
  },
  stepCircleDone: {
    backgroundColor: "#dcfce7",
  },
  stepCirclePending: {
    backgroundColor: "#f1f5f9",
  },
  stepNum: {
    fontSize: 10,
    fontWeight: "800",
  },
  stepNumActive: {
    color: "#fff",
  },
  stepNumDone: {
    color: "#166534",
  },
  stepNumPending: {
    color: "#94a3b8",
  },
  stepLine: {
    width: 24,
    height: 1,
    backgroundColor: "#e2e8f0",
    marginHorizontal: 4,
  },
  modalBody: {
    padding: 24,
    paddingTop: 0,
  },
  modalForm: {
    marginTop: 8,
  },
  inputWrapper: {
    position: "relative",
    justifyContent: "center",
    marginBottom: 16,
  },
  inputIcon: {
    position: "absolute",
    left: 14,
    zIndex: 1,
  },
  pl10: {
    paddingLeft: 42,
  },
  primaryBtn: {
    backgroundColor: "#e11d48",
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  cancelBtn: {
    marginTop: 12,
    alignItems: "center",
  },
  cancelBtnText: {
    color: "#64748b",
    fontSize: 14,
    fontWeight: "600",
  },
  otpSentText: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 16,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  otpInput: {
    width: 44,
    height: 48,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  btnRow: {
    flexDirection: "row",
    gap: 12,
  },
  backBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  backBtnText: {
    color: "#334155",
    fontSize: 14,
    fontWeight: "700",
  },
});
