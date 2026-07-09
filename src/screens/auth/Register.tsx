import React, { useState } from "react";
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
import { launchImageLibrary, ImagePickerResponse } from "react-native-image-picker";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../../navigation/AppNavigator";
import { useCustomerAuth } from "../../contexts/CustomerAuthContext";
import { useDealerRegister, ApiError } from "../../hooks/auth/register";
import {
  User as UserIcon,
  Phone as PhoneIcon,
  MapPin as MapPinIcon,
  Mail as MailIcon,
  Lock as LockIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  ArrowRight as ArrowRightIcon,
  ArrowLeft as ArrowLeftIcon,
  Building as BuildingIcon,
} from "lucide-react-native";

const User = UserIcon as any;
const Phone = PhoneIcon as any;
const MapPin = MapPinIcon as any;
const Mail = MailIcon as any;
const Lock = LockIcon as any;
const Eye = EyeIcon as any;
const EyeOff = EyeOffIcon as any;
const ArrowRight = ArrowRightIcon as any;
const ArrowLeft = ArrowLeftIcon as any;
const Building = BuildingIcon as any;

export default function Register() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  // Dealer Form State
  const { registerDealer, isSubmitting: dealerLoading } = useDealerRegister();
  const [dealerStep, setDealerStep] = useState(0);
  const [dealerForm, setDealerForm] = useState({
    businessName: "",
    ownerName: "",
    gstNumber: "",
    yearsInBusiness: "",
    dealerMobile: "",
    executiveMobile: "",
    whatsapp: "",
    email: "",
    password: "",
    address: "",
    city: "",
    state: "",
    pinCode: "",
  });
  const [showDealerPassword, setShowDealerPassword] = useState(false);
  const [showroomImage, setShowroomImage] = useState<string | null>(null);
  const [dealerLogo, setDealerLogo] = useState<string | null>(null);

  const handleDealerRegister = async () => {
    try {
      const payload = {
        ...dealerForm,
        yearsInBusiness: Number(dealerForm.yearsInBusiness),
      };
      await registerDealer(payload, showroomImage, dealerLogo); 
      Alert.alert("Success", "Dealer Registered Successfully!", [
        { text: "OK", onPress: () => navigation.navigate("Login", { defaultRole: "dealer" }) }
      ]);
    } catch (err: any) {
      if (err instanceof ApiError && err.fieldErrors) {
        const msgs = Object.values(err.fieldErrors).map(m => `• ${m}`).join("\n");
        Alert.alert("Registration Failed", msgs);
      } else {
        Alert.alert("Registration Failed", err.message || "Failed to sign up.");
      }
    }
  };

  const handleNextStep = () => {
    if (dealerStep === 0) {
      if (!dealerForm.businessName || !dealerForm.ownerName || !dealerForm.yearsInBusiness) {
        Alert.alert("Error", "Please fill all required business details.");
        return;
      }
    } else if (dealerStep === 1) {
      if (!dealerForm.dealerMobile || !dealerForm.whatsapp || !dealerForm.password) {
        Alert.alert("Error", "Please fill all required contact details.");
        return;
      }
      if (dealerForm.dealerMobile.length !== 10) {
        Alert.alert("Error", "Dealer Mobile must be exactly 10 digits.");
        return;
      }
      if (dealerForm.whatsapp.length !== 10) {
        Alert.alert("Error", "WhatsApp number must be exactly 10 digits.");
        return;
      }
      if (dealerForm.executiveMobile && dealerForm.executiveMobile.length !== 10) {
        Alert.alert("Error", "Executive Mobile must be exactly 10 digits.");
        return;
      }
    } else if (dealerStep === 2) {
      if (!dealerForm.address || !dealerForm.city || !dealerForm.state || !dealerForm.pinCode) {
        Alert.alert("Error", "Please fill all required location details.");
        return;
      }
    }

    if (dealerStep < 3) {
      setDealerStep(dealerStep + 1);
    } else {
      handleDealerRegister();
    }
  };

  const handleMobileInput = (text: string, field: "dealerMobile" | "executiveMobile" | "whatsapp") => {
    const val = text.replace(/\D/g, "");
    if (val.length > 0 && !["6", "7", "8", "9"].includes(val[0])) {
      Alert.alert("Validation", "Mobile number must start with 6, 7, 8, or 9");
      return;
    }
    const truncated = val.slice(0, 10);
    setDealerForm({ ...dealerForm, [field]: truncated });
  };

  const selectImage = (type: "logo" | "showroom") => {
    launchImageLibrary({ mediaType: "photo", quality: 0.8 }, (response: ImagePickerResponse) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert("Error", response.errorMessage || "Image picker error");
        return;
      }
      if (response.assets && response.assets.length > 0) {
        const uri = response.assets[0].uri;
        if (uri) {
          if (type === "logo") setDealerLogo(uri);
          else setShowroomImage(uri);
        }
      }
    });
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

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.title}>Dealer Registration</Text>
              <Text style={styles.subtitle}>Join our network of premium buyers and dealers.</Text>
            </View>

            <View style={styles.stepperHeader}>
              <Text style={styles.stepTitle}>
                {dealerStep === 0 && "Business Details"}
                {dealerStep === 1 && "Contact Info"}
                {dealerStep === 2 && "Location Details"}
                {dealerStep === 3 && "Brand Visuals"}
              </Text>
              <Text style={styles.stepCount}>Step {dealerStep + 1} of 4</Text>
            </View>
            
            <View style={styles.stepDots}>
              {[0, 1, 2, 3].map((s) => (
                <View key={s} style={[styles.dot, dealerStep === s && styles.dotActive, dealerStep > s && styles.dotCompleted]} />
              ))}
            </View>

            {dealerStep === 0 && (
              <View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Business Name *</Text>
                  <TextInput
                    style={styles.inputNoIcon}
                    placeholder="e.g. Mumbai Premium Motors"
                    placeholderTextColor="#64748b"
                    value={dealerForm.businessName}
                    onChangeText={(t) => setDealerForm({ ...dealerForm, businessName: t })}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Owner Name *</Text>
                  <TextInput
                    style={styles.inputNoIcon}
                    placeholder="Owner's full name"
                    placeholderTextColor="#64748b"
                    value={dealerForm.ownerName}
                    onChangeText={(t) => setDealerForm({ ...dealerForm, ownerName: t })}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>GST Number (optional)</Text>
                  <TextInput
                    style={styles.inputNoIcon}
                    placeholder="22AAAAA0000A1Z5"
                    placeholderTextColor="#64748b"
                    autoCapitalize="characters"
                    value={dealerForm.gstNumber}
                    onChangeText={(t) => setDealerForm({ ...dealerForm, gstNumber: t })}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Years in Business *</Text>
                  <TextInput
                    style={styles.inputNoIcon}
                    placeholder="5"
                    placeholderTextColor="#64748b"
                    keyboardType="numeric"
                    value={dealerForm.yearsInBusiness}
                    onChangeText={(t) => setDealerForm({ ...dealerForm, yearsInBusiness: t.replace(/\D/g, "") })}
                  />
                </View>
              </View>
            )}

            {dealerStep === 1 && (
              <View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Dealer Mobile *</Text>
                  <TextInput
                    style={styles.inputNoIcon}
                    placeholder="9579******"
                    placeholderTextColor="#64748b"
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={dealerForm.dealerMobile}
                    onChangeText={(t) => handleMobileInput(t, "dealerMobile")}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Executive Mobile (optional)</Text>
                  <TextInput
                    style={styles.inputNoIcon}
                    placeholder="9823******"
                    placeholderTextColor="#64748b"
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={dealerForm.executiveMobile}
                    onChangeText={(t) => handleMobileInput(t, "executiveMobile")}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>WhatsApp Number *</Text>
                  <TextInput
                    style={styles.inputNoIcon}
                    placeholder="9579******"
                    placeholderTextColor="#64748b"
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={dealerForm.whatsapp}
                    onChangeText={(t) => handleMobileInput(t, "whatsapp")}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Address (optional)</Text>
                  <TextInput
                    style={styles.inputNoIcon}
                    placeholder="you@example.com"
                    placeholderTextColor="#64748b"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={dealerForm.email}
                    onChangeText={(t) => setDealerForm({ ...dealerForm, email: t })}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password *</Text>
                  <TextInput
                    style={styles.inputNoIcon}
                    placeholder="Min. 6 characters"
                    placeholderTextColor="#64748b"
                    secureTextEntry={!showDealerPassword}
                    value={dealerForm.password}
                    onChangeText={(t) => setDealerForm({ ...dealerForm, password: t })}
                  />
                </View>
              </View>
            )}

            {dealerStep === 2 && (
              <View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Full Address *</Text>
                  <TextInput
                    style={[styles.inputNoIcon, { height: 80, textAlignVertical: "top", paddingTop: 12 }]}
                    placeholder="Enter complete showroom address"
                    placeholderTextColor="#64748b"
                    multiline
                    numberOfLines={3}
                    value={dealerForm.address}
                    onChangeText={(t) => setDealerForm({ ...dealerForm, address: t })}
                  />
                </View>
                <View style={styles.rowInputs}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>City *</Text>
                    <TextInput
                      style={styles.inputNoIcon}
                      placeholder="e.g. Mumbai"
                      placeholderTextColor="#64748b"
                      value={dealerForm.city}
                      onChangeText={(t) => setDealerForm({ ...dealerForm, city: t })}
                    />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>State *</Text>
                    <TextInput
                      style={styles.inputNoIcon}
                      placeholder="Maharashtra"
                      placeholderTextColor="#64748b"
                      value={dealerForm.state}
                      onChangeText={(t) => setDealerForm({ ...dealerForm, state: t })}
                    />
                  </View>
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Pin Code *</Text>
                  <TextInput
                    style={styles.inputNoIcon}
                    placeholder="400001"
                    placeholderTextColor="#64748b"
                    keyboardType="numeric"
                    maxLength={6}
                    value={dealerForm.pinCode}
                    onChangeText={(t) => setDealerForm({ ...dealerForm, pinCode: t.replace(/\D/g, "") })}
                  />
                </View>
              </View>
            )}

            {dealerStep === 3 && (
              <View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Dealer Logo (optional)</Text>
                  <TouchableOpacity 
                    style={styles.imageUploadBox}
                    onPress={() => selectImage("logo")}
                  >
                    {dealerLogo ? (
                      <Image source={{ uri: dealerLogo }} style={styles.previewImage} />
                    ) : (
                      <>
                        <Building size={24} color="#94a3b8" style={{ marginBottom: 8 }} />
                        <Text style={styles.uploadBoxText}>Tap to select logo</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Showroom Image (optional)</Text>
                  <TouchableOpacity 
                    style={styles.imageUploadBox}
                    onPress={() => selectImage("showroom")}
                  >
                    {showroomImage ? (
                      <Image source={{ uri: showroomImage }} style={styles.previewImage} />
                    ) : (
                      <>
                        <Building size={24} color="#94a3b8" style={{ marginBottom: 8 }} />
                        <Text style={styles.uploadBoxText}>Tap to select showroom image</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={styles.stepperNav}>
              <TouchableOpacity
                style={[styles.stepperBtn, dealerStep === 0 && styles.stepperBtnDisabled]}
                disabled={dealerStep === 0}
                onPress={() => setDealerStep(dealerStep - 1)}
              >
                <ArrowLeft size={16} color={dealerStep === 0 ? "#64748b" : "#cbd5e1"} />
                <Text style={[styles.stepperBtnText, dealerStep === 0 && { color: "#64748b" }]}>Back</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.stepperBtnPrimary} onPress={handleNextStep} disabled={dealerLoading}>
                {dealerLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Text style={styles.stepperBtnPrimaryText}>
                      {dealerStep === 3 ? "Register Now" : "Continue"}
                    </Text>
                    <ArrowRight size={16} color="#fff" />
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.loginRow}>
              <Text style={styles.loginLabel}>Already registered? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login", { defaultRole: "dealer" })}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>

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
    paddingVertical: 32,
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
    fontSize: 24,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: "#cbd5e1",
    marginTop: 6,
  },
  inputGroup: {
    marginBottom: 16,
  },
  rowInputs: {
    flexDirection: "row",
    gap: 12,
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
  inputNoIcon: {
    height: 48,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    paddingHorizontal: 16,
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
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  loginLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#cbd5e1",
  },
  loginLink: {
    fontSize: 13,
    fontWeight: "800",
    color: "#fb7185",
  },
  stepperHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 8,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#ffffff",
  },
  stepCount: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94a3b8",
    textTransform: "uppercase",
  },
  stepDots: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 20,
    justifyContent: "flex-end",
  },
  dot: {
    height: 4,
    width: 8,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 2,
  },
  dotActive: {
    width: 24,
    backgroundColor: "#fb7185",
  },
  dotCompleted: {
    backgroundColor: "#10b981", 
  },
  stepperNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 16,
  },
  stepperBtn: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  stepperBtnDisabled: {
    borderColor: "rgba(255, 255, 255, 0.05)",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  stepperBtnText: {
    color: "#cbd5e1",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  stepperBtnPrimary: {
    flex: 2,
    height: 48,
    backgroundColor: "#9f1239",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  stepperBtnPrimaryText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  imageUploadBox: {
    height: 100,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderStyle: "dashed",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    overflow: "hidden",
  },
  uploadBoxText: {
    fontSize: 13, 
    fontWeight: "600", 
    color: "#94a3b8",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
});
