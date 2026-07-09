import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  DeviceEventEmitter,
  ImageBackground,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../../navigation/AppNavigator";
import { X, Eye, EyeOff } from "lucide-react-native";
import { useCustomerAuth } from "../../contexts/CustomerAuthContext";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import { useDealerAuth } from "../../contexts/DealerAuthContext";
import { useLogin } from "../../hooks/auth/login";
import {
  useCustomerSendOtp,
  useCustomerVerifyOtp,
  useCustomerResetPassword,
} from "../../hooks/auth/resetPassword";
import Input from "../ui/Input";
import Button from "../ui/Button";

export function AuthModal() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [tab, setTab] = useState<"login" | "register" | "forgot">("login");
  const [forgotStep, setForgotStep] = useState<"send" | "verify" | "reset">("send");

  // Auth states
  const [authUsername, setAuthUsername] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [showAuthPassword, setShowAuthPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const [customerForm, setCustomerForm] = useState({
    customerName: "",
    mobile: "",
    customerCity: "",
    email: "",
    password: "",
  });
  const [showCustPassword, setShowCustPassword] = useState(false);
  const [custLoading, setCustLoading] = useState(false);
  const [custError, setCustError] = useState("");

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  
  const { isPending: sendingOtp, sendOtp } = useCustomerSendOtp();
  const { isPending: verifyingOtp, verifyOtp } = useCustomerVerifyOtp();
  const { isPending: resettingPassword, resetPassword } = useCustomerResetPassword();

  const { setUserFromToken: setCustomer, register: customerRegister } = useCustomerAuth();
  const { setUserFromToken: setAdmin } = useAdminAuth();
  const { setUserFromToken: setDealer } = useDealerAuth();
  const { login: unifiedLogin } = useLogin();

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener("show-auth-modal", () => {
      setAuthModalOpen(true);
    });
    return () => {
      subscription.remove();
    };
  }, []);

  const handleLoginSubmit = async () => {
    if (tab === "register") {
      handleCustomerRegister();
      return;
    }
    setAuthError("");
    const trimmed = authUsername.trim();
    if (!trimmed || !authPassword.trim()) {
      setAuthError("Please enter email/mobile and password.");
      return;
    }

    setAuthLoading(true);
    try {
      const res = await unifiedLogin({ username: trimmed, password: authPassword });

      if (res.role !== "customer") {
        setAuthError(`This login is for customers only. You are registered as a ${res.role}.`);
        return;
      }

      await setCustomer(res.token, res.data);
      handleCloseModal();
    } catch (err: any) {
      setAuthError(err.message || "Invalid credentials.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleCustomerRegister = async () => {
    const { customerName, mobile, customerCity, email, password } = customerForm;
    if (!customerName.trim() || !mobile.trim() || !customerCity.trim() || !email.trim() || !password.trim()) {
      setCustError("Please fill in all fields.");
      return;
    }

    if (mobile.trim().length !== 10) {
      setCustError("Mobile number must be exactly 10 digits.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setCustError("Please enter a valid email address.");
      return;
    }

    setCustLoading(true);
    setCustError("");
    try {
      await customerRegister({ customerName, mobile, customerCity, email, password });
      setTab("login"); // Switch back to login after successful registration
      setAuthError("Registration successful! Please sign in.");
      setCustomerForm({ customerName: "", mobile: "", customerCity: "", email: "", password: "" });
    } catch (err: any) {
      if (err.fieldErrors) {
        setCustError(Object.values(err.fieldErrors).map(m => `• ${m}`).join("\n"));
      } else {
        setCustError(err.message || "Failed to sign up.");
      }
    } finally {
      setCustLoading(false);
    }
  };

  const handleMobileInput = (text: string) => {
    const val = text.replace(/\D/g, "");
    if (val.length > 0 && !["6", "7", "8", "9"].includes(val[0])) {
      setCustError("Mobile number must start with 6, 7, 8, or 9");
      return;
    }
    setCustError("");
    setCustomerForm({ ...customerForm, mobile: val.slice(0, 10) });
  };

  const handleForgotSendOtp = async () => {
    if (!forgotEmail) {
      setAuthError("Please enter email/mobile");
      return;
    }
    setAuthError("");
    try {
      const res = await sendOtp(forgotEmail);
      setForgotStep("verify");
    } catch (err: any) {
      setAuthError(err?.message || "Failed to send OTP");
    }
  };

  const handleForgotVerifyOtp = async () => {
    if (!forgotOtp) {
      setAuthError("Please enter OTP");
      return;
    }
    setAuthError("");
    try {
      const res = await verifyOtp({ email: forgotEmail, otp: forgotOtp });
      setForgotStep("reset");
    } catch (err: any) {
      setAuthError(err?.message || "Failed to verify OTP");
    }
  };

  const handleForgotResetPassword = async () => {
    if (forgotNewPassword !== forgotConfirmPassword) {
      setAuthError("Passwords do not match");
      return;
    }
    setAuthError("");
    try {
      const res = await resetPassword({ email: forgotEmail, otp: forgotOtp, newPassword: forgotNewPassword });
      setTab("login");
      setForgotStep("send");
      setForgotEmail("");
      setForgotOtp("");
      setForgotNewPassword("");
      setForgotConfirmPassword("");
    } catch (err: any) {
      setAuthError(err?.message || "Failed to reset password");
    }
  };

  const handleCloseModal = () => {
    setAuthModalOpen(false);
    setTab("login");
    setAuthUsername("");
    setAuthPassword("");
    setShowAuthPassword(false);
    setAuthError("");
    setCustomerForm({
      customerName: "",
      mobile: "",
      customerCity: "",
      email: "",
      password: "",
    });
    setShowCustPassword(false);
    setCustError("");
  };

  return (
    <Modal
      visible={authModalOpen}
      animationType="fade"
      transparent={true}
      onRequestClose={handleCloseModal}
    >
      <ImageBackground
        source={require("../../assets/download.jpg")}
        style={styles.modalOverlay}
        blurRadius={10}
      >
        <View style={styles.darkOverlay} />
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={handleCloseModal}
        />
        <SafeAreaView style={[styles.modalContent, { minHeight: "auto", maxHeight: "80%" }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {tab === "login" ? "Login to Continue" : "Create Account"}
            </Text>
            <TouchableOpacity onPress={handleCloseModal} style={styles.closeBtn}>
              <X size={20} color="#0f172a" />
            </TouchableOpacity>
          </View>

          <View style={styles.tabsContainer}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setTab("login")}
              style={[styles.tab, tab === "login" ? styles.tabActive : null]}
            >
              <Text style={[styles.tabText, tab === "login" ? styles.tabTextActive : null]}>
                Sign In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setTab("register")}
              style={[styles.tab, tab === "register" ? styles.tabActive : null]}
            >
              <Text style={[styles.tabText, tab === "register" ? styles.tabTextActive : null]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalBodyScroll}>
            {tab === "login" && (
              <>
                <Text style={styles.formInstructions}>
                  Please login or register to buy or inquire about cars.
                </Text>

                {authError ? <Text style={styles.formErrorText}>{authError}</Text> : null}

                <Input
                  label="Email or Mobile"
                  value={authUsername}
                  onChangeText={setAuthUsername}
                  placeholder="Enter your email or mobile"
                  autoCapitalize="none"
                />

                <View style={{ position: "relative" }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={{ fontSize: 13, fontWeight: "600", color: "#334155", marginBottom: 6 }}>Password</Text>
                    <TouchableOpacity onPress={() => setTab("forgot")}>
                      <Text style={{ fontSize: 12, color: "#0ea5e9", fontWeight: "600", marginBottom: 6 }}>Forgot Password?</Text>
                    </TouchableOpacity>
                  </View>
                  <Input
                    value={authPassword}
                    onChangeText={setAuthPassword}
                    placeholder="Enter your password"
                    secureTextEntry={!showAuthPassword}
                  />
                  <TouchableOpacity
                    style={{ position: "absolute", right: 12, top: 40, padding: 4 }}
                    onPress={() => setShowAuthPassword(!showAuthPassword)}
                  >
                    {showAuthPassword ? (
                      <EyeOff size={20} color="#94a3b8" />
                    ) : (
                      <Eye size={20} color="#94a3b8" />
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}

            {tab === "register" && (
              <>
                <Text style={styles.formInstructions}>
                  Please login or register to buy or inquire about cars.
                </Text>

                {custError ? <Text style={styles.formErrorText}>{custError}</Text> : null}

                <Input
                  label="Full Name *"
                  value={customerForm.customerName}
                  onChangeText={(t) => setCustomerForm({ ...customerForm, customerName: t })}
                  placeholder="e.g. John Doe"
                />

                <Input
                  label="Mobile Number *"
                  value={customerForm.mobile}
                  onChangeText={handleMobileInput}
                  placeholder="9579******"
                  keyboardType="phone-pad"
                  maxLength={10}
                />

                <Input
                  label="City *"
                  value={customerForm.customerCity}
                  onChangeText={(t) => setCustomerForm({ ...customerForm, customerCity: t })}
                  placeholder="e.g. Pune"
                />

                <Input
                  label="Email Address *"
                  value={customerForm.email}
                  onChangeText={(t) => setCustomerForm({ ...customerForm, email: t })}
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <View style={{ position: "relative" }}>
                  <Input
                    label="Password *"
                    value={customerForm.password}
                    onChangeText={(t) => setCustomerForm({ ...customerForm, password: t })}
                    placeholder="Min. 6 characters"
                    secureTextEntry={!showCustPassword}
                  />
                  <TouchableOpacity
                    style={{ position: "absolute", right: 12, top: 40, padding: 4 }}
                    onPress={() => setShowCustPassword(!showCustPassword)}
                  >
                    {showCustPassword ? (
                      <EyeOff size={20} color="#94a3b8" />
                    ) : (
                      <Eye size={20} color="#94a3b8" />
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}

            {tab === "forgot" && (
              <>
                <Text style={styles.formInstructions}>
                  Reset your password to regain access to your account.
                </Text>

                {authError ? <Text style={styles.formErrorText}>{authError}</Text> : null}

                {forgotStep === "send" && (
                  <>
                    <Input
                      label="Email Address"
                      value={forgotEmail}
                      onChangeText={setForgotEmail}
                      placeholder="Enter registered email"
                      autoCapitalize="none"
                    />
                    <Button
                      title="Send OTP"
                      loading={sendingOtp}
                      onPress={handleForgotSendOtp}
                      style={{ marginTop: 16 }}
                    />
                    <TouchableOpacity onPress={() => setTab("login")}>
                      <Text style={{ textAlign: "center", color: "#64748b", marginTop: 16, fontSize: 14 }}>
                        Back to Login
                      </Text>
                    </TouchableOpacity>
                  </>
                )}

                {forgotStep === "verify" && (
                  <>
                    <Input
                      label={`Enter OTP sent to ${forgotEmail}`}
                      value={forgotOtp}
                      onChangeText={setForgotOtp}
                      placeholder="------"
                      keyboardType="numeric"
                      maxLength={6}
                    />
                    <Button
                      title="Verify OTP"
                      loading={verifyingOtp}
                      onPress={handleForgotVerifyOtp}
                      style={{ marginTop: 16 }}
                    />
                    <TouchableOpacity onPress={() => setForgotStep("send")}>
                      <Text style={{ textAlign: "center", color: "#64748b", marginTop: 16, fontSize: 14 }}>
                        Back
                      </Text>
                    </TouchableOpacity>
                  </>
                )}

                {forgotStep === "reset" && (
                  <>
                    <View style={{ position: "relative" }}>
                      <Input
                        label="New Password"
                        value={forgotNewPassword}
                        onChangeText={setForgotNewPassword}
                        placeholder="Enter new password"
                        secureTextEntry={!showAuthPassword}
                      />
                      <TouchableOpacity
                        style={{ position: "absolute", right: 12, top: 40, padding: 4 }}
                        onPress={() => setShowAuthPassword(!showAuthPassword)}
                      >
                        {showAuthPassword ? (
                          <EyeOff size={20} color="#94a3b8" />
                        ) : (
                          <Eye size={20} color="#94a3b8" />
                        )}
                      </TouchableOpacity>
                    </View>
                    <Input
                      label="Confirm Password"
                      value={forgotConfirmPassword}
                      onChangeText={setForgotConfirmPassword}
                      placeholder="Confirm new password"
                      secureTextEntry={!showAuthPassword}
                    />
                    <Button
                      title="Reset Password"
                      loading={resettingPassword}
                      onPress={handleForgotResetPassword}
                      style={{ marginTop: 16 }}
                    />
                    <TouchableOpacity onPress={() => setTab("login")}>
                      <Text style={{ textAlign: "center", color: "#64748b", marginTop: 16, fontSize: 14 }}>
                        Cancel
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </>
            )}

            {tab !== "forgot" && (
            <Button
              title={tab === "login" ? "Sign In" : "Create Account"}
              loading={tab === "login" ? authLoading : custLoading}
              onPress={handleLoginSubmit}
              style={{ marginTop: 16 }}
            />
            )}

            {tab !== "forgot" && (
            <TouchableOpacity
              onPress={() => {
                if (tab === "login") {
                  setTab("register");
                } else {
                  handleCloseModal();
                  navigation.navigate("Register");
                }
              }}
            >
              <Text style={{ textAlign: "center", color: "#64748b", marginTop: 24, fontSize: 14 }}>
                {tab === "login" ? "Don't have an account? " : "Want to register as a dealer? "}
                <Text style={{ color: "#e11d48", fontWeight: "700" }}>{tab === "login" ? "Register" : "Dealer Registration"}</Text>
              </Text>
            </TouchableOpacity>
            )}
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: "65%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  closeBtn: {
    padding: 8,
    marginRight: -8,
  },
  modalBodyScroll: {
    padding: 24,
    paddingBottom: 40,
  },
  formInstructions: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 20,
    lineHeight: 20,
  },
  formErrorText: {
    color: "#e11d48",
    fontSize: 14,
    marginBottom: 16,
    textAlign: "center",
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    marginHorizontal: 24,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
  tabTextActive: {
    color: "#0f172a",
  },
});
