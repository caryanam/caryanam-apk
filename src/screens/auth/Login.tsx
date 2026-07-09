import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../../navigation/AppNavigator";
import { useLogin } from "../../hooks/auth/login";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import { useDealerAuth } from "../../contexts/DealerAuthContext";
import { useCustomerAuth } from "../../contexts/CustomerAuthContext";
import {
  User as UserIcon,
  Lock as LockIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  ArrowRight as ArrowRightIcon,
  Mail as MailIcon,
  KeyRound as KeyRoundIcon,
  ArrowLeft as ArrowLeftIcon,
} from "lucide-react-native";
import {
  useCustomerSendOtp,
  useCustomerVerifyOtp,
  useCustomerResetPassword,
} from "../../hooks/auth/resetPassword";

const User = UserIcon as any;
const Lock = LockIcon as any;
const Eye = EyeIcon as any;
const EyeOff = EyeOffIcon as any;
const ArrowRight = ArrowRightIcon as any;
const Mail = MailIcon as any;
const KeyRound = KeyRoundIcon as any;
const ArrowLeft = ArrowLeftIcon as any;

export default function Login() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login: unifiedLogin } = useLogin();
  const { setUserFromToken: setAdmin } = useAdminAuth();
  const { setUserFromToken: setDealer } = useDealerAuth();
  const { setUserFromToken: setCustomer } = useCustomerAuth();

  // Forgot Password State
  const [forgotPasswordStep, setForgotPasswordStep] = useState<"none" | "send" | "verify" | "reset">("none");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  
  const { isPending: sendingOtp, sendOtp } = useCustomerSendOtp();
  const { isPending: verifyingOtp, verifyOtp } = useCustomerVerifyOtp();
  const { isPending: resettingPassword, resetPassword } = useCustomerResetPassword();

  const handleLogin = async () => {
    const trimmed = username.trim();
    if (!trimmed || !password.trim()) {
      Alert.alert("Input Error", "Please fill in all details.");
      return;
    }

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    const isMobile = /^[6-9][0-9]{9}$/.test(trimmed);

    if (!isEmail) {
      if (/^\d+$/.test(trimmed)) {
        if (!/^[6-9]/.test(trimmed)) {
          Alert.alert("Validation", "Mobile number must start with 6, 7, 8, or 9");
          return;
        }
        if (trimmed.length < 10) {
          Alert.alert("Validation", "Mobile number must be at least 10 digits");
          return;
        }
      }
      if (!isMobile) {
        Alert.alert("Validation", "Please enter a valid email address or 10-digit mobile number");
        return;
      }
    }

    setLoading(true);
    try {
      const res = await unifiedLogin({ username: trimmed, password });
      
      if (res.role === "admin") {
        await setAdmin(res.data);
        Alert.alert("Success", "Welcome, Admin!");
        navigation.navigate("AdminDashboard");
      } else if (res.role === "dealer") {
        await setDealer(res.data);
        const dealerName = String(
          res.data.businessName ?? res.data.ownerName ?? res.data.name ?? "Dealer"
        );
        Alert.alert("Success", `Welcome back, ${dealerName}!`);
        navigation.navigate("DealerDashboard");
      } else if (res.role === "customer") {
        await setCustomer(res.token, res.data);
        Alert.alert("Success", "Welcome to Caryanam!");
        navigation.navigate("Home");
      }
    } catch (err: any) {
      Alert.alert("Login Failed", err.message || "Please check your credentials and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSendOtp = async () => {
    if (!forgotEmail) return Alert.alert("Error", "Please enter email/mobile");
    try {
      const res = await sendOtp(forgotEmail);
      Alert.alert("Success", typeof res === "string" ? res : (res?.message || res?.data?.message || "OTP sent successfully"));
      setForgotPasswordStep("verify");
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to send OTP");
    }
  };

  const handleForgotVerifyOtp = async () => {
    if (!forgotOtp) return Alert.alert("Error", "Please enter OTP");
    try {
      const res = await verifyOtp({ email: forgotEmail, otp: forgotOtp });
      Alert.alert("Success", typeof res === "string" ? res : (res?.message || res?.data?.message || "OTP verified"));
      setForgotPasswordStep("reset");
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to verify OTP");
    }
  };

  const handleForgotResetPassword = async () => {
    if (forgotNewPassword !== forgotConfirmPassword) {
      return Alert.alert("Error", "Passwords do not match");
    }
    try {
      const res = await resetPassword({ email: forgotEmail, otp: forgotOtp, newPassword: forgotNewPassword });
      Alert.alert("Success", typeof res === "string" ? res : (res?.message || res?.data?.message || "Password reset successfully"));
      setForgotPasswordStep("none");
      setForgotEmail("");
      setForgotOtp("");
      setForgotNewPassword("");
      setForgotConfirmPassword("");
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to reset password");
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/download.jpg")}
      style={styles.background}
    >
      <View style={styles.overlay} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          <View style={styles.card}>
            
            <View style={styles.brandRow}>
              <Image source={require("../../assets/logo.png")} style={styles.logo} />
              <Text style={styles.logoText}>CARY<Text style={{ color: "#facc15" }}>A</Text>NAM</Text>
            </View>

            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Enter your credentials to access your account.</Text>
            <View style={styles.divider} />

            {forgotPasswordStep === "none" ? (
            <>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email / Mobile Number</Text>
              <View style={styles.inputWrapper}>
                <User size={18} color="#94a3b8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter email or 10-digit mobile"
                  placeholderTextColor="#64748b"
                  value={username}
                  onChangeText={(val) => {
                    if (/^\d+$/.test(val)) {
                      if (/^[6-9]/.test(val)) {
                        setUsername(val.slice(0, 10));
                      } else {
                        setUsername("");
                        Alert.alert("Validation", "Mobile number must start with 6, 7, 8, or 9");
                      }
                      return;
                    }
                    setUsername(val);
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <Text style={[styles.label, { marginBottom: 0 }]}>Password</Text>
                <TouchableOpacity onPress={() => setForgotPasswordStep("send")}>
                  <Text style={{ fontSize: 11, color: "#cbd5e1", fontWeight: "600", textDecorationLine: "underline" }}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputWrapper}>
                <Lock size={18} color="#94a3b8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Your password"
                  placeholderTextColor="#64748b"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  {showPassword ? <Eye size={18} color="#94a3b8" /> : <EyeOff size={18} color="#94a3b8" />}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleLogin} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Text style={styles.submitBtnText}>Sign In</Text>
                  <ArrowRight size={18} color="#fff" />
                </>
              )}
            </TouchableOpacity>

            <View style={styles.signupRow}>
              <Text style={styles.signupLabel}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text style={styles.signupLink}>Register</Text>
              </TouchableOpacity>
            </View>
            </>
            ) : forgotPasswordStep === "send" ? (
              <View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Address</Text>
                  <View style={styles.inputWrapper}>
                    <Mail size={18} color="#94a3b8" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter registered email"
                      placeholderTextColor="#64748b"
                      value={forgotEmail}
                      onChangeText={setForgotEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>
                <TouchableOpacity style={styles.submitBtn} onPress={handleForgotSendOtp} disabled={sendingOtp}>
                  {sendingOtp ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.submitBtnText}>Send OTP</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.backBtn} onPress={() => setForgotPasswordStep("none")}>
                  <ArrowLeft size={16} color="#94a3b8" />
                  <Text style={styles.backBtnText}>Back to Login</Text>
                </TouchableOpacity>
              </View>
            ) : forgotPasswordStep === "verify" ? (
              <View>
                <Text style={{ textAlign: "center", color: "#f1f5f9", fontSize: 13, marginBottom: 15 }}>
                  Enter OTP sent to {forgotEmail}
                </Text>
                <View style={styles.inputGroup}>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={[styles.input, { textAlign: "center", letterSpacing: 8, fontSize: 20, paddingLeft: 10 }]}
                      placeholder="------"
                      placeholderTextColor="#64748b"
                      value={forgotOtp}
                      onChangeText={setForgotOtp}
                      keyboardType="numeric"
                      maxLength={6}
                    />
                  </View>
                </View>
                <TouchableOpacity style={styles.submitBtn} onPress={handleForgotVerifyOtp} disabled={verifyingOtp}>
                  {verifyingOtp ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.submitBtnText}>Verify OTP</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.backBtn} onPress={() => setForgotPasswordStep("send")}>
                  <ArrowLeft size={16} color="#94a3b8" />
                  <Text style={styles.backBtnText}>Back</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>New Password</Text>
                  <View style={styles.inputWrapper}>
                    <KeyRound size={18} color="#94a3b8" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter new password"
                      placeholderTextColor="#64748b"
                      value={forgotNewPassword}
                      onChangeText={setForgotNewPassword}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                      {showPassword ? <Eye size={18} color="#94a3b8" /> : <EyeOff size={18} color="#94a3b8" />}
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Confirm Password</Text>
                  <View style={styles.inputWrapper}>
                    <KeyRound size={18} color="#94a3b8" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Confirm new password"
                      placeholderTextColor="#64748b"
                      value={forgotConfirmPassword}
                      onChangeText={setForgotConfirmPassword}
                      secureTextEntry={!showPassword}
                    />
                  </View>
                </View>
                <TouchableOpacity style={styles.submitBtn} onPress={handleForgotResetPassword} disabled={resettingPassword}>
                  {resettingPassword ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.submitBtnText}>Reset Password</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.backBtn} onPress={() => setForgotPasswordStep("none")}>
                  <Text style={styles.backBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.65)", 
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 16,
  },
  card: {
    backgroundColor: "rgba(15, 23, 42, 0.55)", 
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderRadius: 32,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 6,
  },
  logoText: {
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 2,
    color: "#ffffff",
    transform: [{ scaleY: 1.4 }],
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    color: "#ffffff",
  },
  subtitle: {
    fontSize: 13,
    color: "#cbd5e1",
    marginTop: 6,
  },
  divider: {
    width: 36,
    height: 3,
    backgroundColor: "#f43f5e", 
    borderRadius: 2,
    marginTop: 12,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: "#cbd5e1",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputWrapper: {
    position: "relative",
    justifyContent: "center",
  },
  inputIcon: {
    position: "absolute",
    left: 14,
    zIndex: 1,
  },
  eyeIcon: {
    position: "absolute",
    right: 14,
    padding: 4,
    zIndex: 1,
  },
  input: {
    height: 48,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    paddingLeft: 44,
    paddingRight: 44,
    color: "#ffffff",
    fontSize: 14,
  },
  submitBtn: {
    height: 52,
    backgroundColor: "#9f1239", 
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    gap: 8,
    shadowColor: "#9f1239",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  backBtn: {
    marginTop: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  backBtnText: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 6,
  },
  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  signupLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#cbd5e1",
  },
  signupLink: {
    fontSize: 13,
    fontWeight: "800",
    color: "#fb7185",
  },
});
