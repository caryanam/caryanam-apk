import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Linking,
  ActivityIndicator,
  Dimensions,
  DeviceEventEmitter,
  Modal,
} from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../../navigation/AppNavigator";
import ScreenWrapper from "../../components/shared/ScreenWrapper";
import { usePublicVehicleDetails } from "../../hooks/public/usePublicVehicleDetails";
import { useGenerateLead, useGenerateView } from "../../hooks/public/useLeads";
import { useCustomer } from "../../contexts/CustomerAuthContext";
import { useWishlist } from "../../hooks/public/useWishlist";
import { formatINR, formatKM } from "../../utils/helpers";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Skeleton from "../../components/ui/Skeleton";
import {
  Heart as HeartIcon,
  Phone as PhoneIcon,
  MessageCircle as MessageCircleIcon,
  MapPin as MapPinIcon,
  Fuel as FuelIcon,
  Settings2 as Settings2Icon,
  Gauge as GaugeIcon,
  Calendar as CalendarIcon,
  Shield as ShieldIcon,
  FileText as FileTextIcon,
  Check as CheckIcon,
  X as XIcon,
  Star as StarIcon,
  Camera as CameraIcon,
  DollarSign as DollarSignIcon,
  Car as CarIcon,
  BadgeCheck as BadgeCheckIcon,
  Play as PlayIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
} from "lucide-react-native";

const Heart = HeartIcon as any;
const Phone = PhoneIcon as any;
const MessageCircle = MessageCircleIcon as any;
const MapPin = MapPinIcon as any;
const Fuel = FuelIcon as any;
const Settings2 = Settings2Icon as any;
const Gauge = GaugeIcon as any;
const Calendar = CalendarIcon as any;
const Shield = ShieldIcon as any;
const FileText = FileTextIcon as any;
const Check = CheckIcon as any;
const X = XIcon as any;
const Star = StarIcon as any;
const Camera = CameraIcon as any;
const DollarSign = DollarSignIcon as any;
const Car = CarIcon as any;
const BadgeCheck = BadgeCheckIcon as any;
const Play = PlayIcon as any;

const { width } = Dimensions.get("window");
const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200&h=800&fit=crop";

type CarDetailsRouteProp = RouteProp<RootStackParamList, "CarDetails">;

export default function CarDetails() {
  const route = useRoute<CarDetailsRouteProp>();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const vehicleId = route.params?.id;

  const { data: vehicle, isLoading, isPending, isError, error, refetch } = usePublicVehicleDetails(vehicleId);
  const { generateView } = useGenerateView();
  const { isSubmitting, generateLead } = useGenerateLead();
  const customer = useCustomer();

  const { wishlistIds, toggleWishlist } = useWishlist();
  const wishlisted = vehicleId ? wishlistIds.includes(vehicleId) : false;

  const [activeImg, setActiveImg] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);
  const [revealed, setRevealed] = useState(false);

  // Form states
  const [leadName, setLeadName] = useState("");
  const [leadMobile, setLeadMobile] = useState("");
  const [leadCity, setLeadCity] = useState("");
  const [formError, setFormError] = useState("");

  // Record view on mount if user is customer
  useEffect(() => {
    if (vehicleId && customer) {
      generateView(vehicleId);
    }
  }, [vehicleId, customer, generateView]);

  // Autofill form fields from context
  useEffect(() => {
    if (customer) {
      setLeadName(customer.customerName || "");
      setLeadMobile(customer.mobile || "");
      setLeadCity(customer.customerCity || "");
    }
  }, [customer]);

  const handleWishlist = async () => {
    if (!customer) {
      DeviceEventEmitter.emit("show-auth-modal");
      return;
    }
    try {
      const msg = await toggleWishlist(vehicleId!);
      Alert.alert("Wishlist Update", msg);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to update wishlist");
    }
  };

  const handleEnquirePress = () => {
    if (!customer) {
      DeviceEventEmitter.emit("show-auth-modal");
      return;
    }
    setShowContactModal(true);
  };

  const handleLeadSubmit = async () => {
    setFormError("");
    if (!leadName.trim() || !leadMobile.trim() || !leadCity.trim()) {
      setFormError("All fields are required.");
      return;
    }
    try {
      await generateLead(vehicleId!, {
        customerName: leadName,
        customerMobile: leadMobile,
        customerCity: leadCity,
      });
      setRevealed(true);
      setShowContactModal(false);
      Alert.alert("Success", "Dealer contact details are now unlocked and visible!");
    } catch (err: any) {
      setFormError(err.message || "Failed to generate lead");
    }
  };

  const handleCall = () => {
    const num = vehicle?.dealerContactNumber;
    if (num) {
      Linking.openURL(`tel:${num}`).catch(() => {
        Alert.alert("Error", "Unable to place call on this device.");
      });
    }
  };

  const handleWhatsApp = () => {
    const num = vehicle?.dealerWhatsappNumber || vehicle?.dealerContactNumber;
    if (num) {
      const formattedNum = num.replace(/\D/g, "");
      const text = `Hello, I'm interested in your ${vehicle?.brand} ${vehicle?.model} listed on Caryanam.`;
      const url = `whatsapp://send?phone=${formattedNum}&text=${encodeURIComponent(text)}`;
      Linking.openURL(url).catch(() => {
        // Fallback to web link if WhatsApp client is not installed
        Linking.openURL(`https://wa.me/${formattedNum}?text=${encodeURIComponent(text)}`);
      });
    }
  };

  if (isLoading || isPending || !vehicle) {
    if (isError) {
      return (
        <ScreenWrapper layoutType="public" showBackButton={true} scrollEnabled={false}>
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>{error?.message || "Failed to load vehicle details."}</Text>
            <Button title="Retry" onPress={refetch} style={styles.retryBtn} />
          </View>
        </ScreenWrapper>
      );
    }
    return (
      <ScreenWrapper layoutType="public" showBackButton={true} scrollEnabled={false}>
        <ScrollView style={{ backgroundColor: "#f8fafc", flex: 1 }}>
          <View style={styles.content}>
            {/* Gallery Skeleton */}
            <View style={{ gap: 12, marginBottom: 24 }}>
              <Skeleton style={{ width: "100%", height: width * (10 / 16), borderRadius: 16 }} />
              <View style={{ flexDirection: "row", gap: 8, overflow: "hidden" }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} style={{ width: 80, height: 60, borderRadius: 8 }} />
                ))}
              </View>
            </View>

            {/* Header Skeleton */}
            <View style={{ gap: 8, marginBottom: 24 }}>
              <Skeleton style={{ width: 160, height: 12, borderRadius: 4 }} />
              <Skeleton style={{ width: "75%", height: 28, borderRadius: 6 }} />
              <Skeleton style={{ width: "33%", height: 16, borderRadius: 4 }} />
              <Skeleton style={{ width: "50%", height: 36, borderRadius: 6, marginTop: 4 }} />
            </View>

            {/* Key Specs Card Skeleton */}
            <View style={[styles.card, { padding: 24, marginBottom: 16 }]}>
              <Skeleton style={{ width: 112, height: 20, borderRadius: 4, marginBottom: 16 }} />
              <View style={styles.specsGrid}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <View key={i} style={[styles.gridItem, { backgroundColor: "transparent", padding: 0 }]}>
                    <View style={{ gap: 6, alignItems: "flex-start", width: "100%", paddingHorizontal: 8 }}>
                      <Skeleton style={{ width: 64, height: 12, borderRadius: 4 }} />
                      <Skeleton style={{ width: 80, height: 16, borderRadius: 4 }} />
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Dealer Card Skeleton */}
            <View style={[styles.card, { padding: 24 }]}>
              <Skeleton style={{ width: 144, height: 20, borderRadius: 4, marginBottom: 16 }} />
              <Skeleton style={{ width: 112, height: 12, borderRadius: 4, marginBottom: 16 }} />
              <Skeleton style={{ width: "100%", height: 40, borderRadius: 8 }} />
            </View>
          </View>
        </ScrollView>
      </ScreenWrapper>
    );
  }

  const images = vehicle.images && vehicle.images.length > 0 ? vehicle.images : [FALLBACK_IMG];
  const videos = vehicle.videos || [];

  return (
    <ScreenWrapper layoutType="public" showBackButton={true} scrollEnabled={true}>
      <View style={{ backgroundColor: "#f8fafc", paddingBottom: 60 }}>
        {/* Image Gallery Horizontal Swiper */}
        <View style={styles.galleryContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setActiveImg(index);
            }}
            scrollEventThrottle={16}
          >
            {images.map((imgUrl: string, idx: number) => (
              <Image
                key={idx}
                source={{ uri: imgUrl }}
                style={styles.galleryImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>

          {/* Absolute Overlays matching Web */}
          <View style={styles.galleryTopLeft}>
            {vehicle.vehicleStatus === "FEATURED" && (
              <View style={[styles.badge, styles.badgeFeatured]}>
                <Star size={12} color="#fff" fill="#fff" style={styles.badgeIcon} />
                <Text style={styles.badgeText}>Featured</Text>
              </View>
            )}
            {vehicle.vehicleType === "PREMIUM" && (
              <View style={[styles.badge, styles.badgePremium]}>
                <Text style={[styles.badgeText, { color: "#fff", fontWeight: "800" }]}>Premium</Text>
              </View>
            )}
          </View>

          {/* Camera Counter overlay */}
          {images.length > 1 && (
            <View style={styles.galleryCounter}>
              <Camera size={14} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.galleryCounterText}>
                {activeImg + 1} / {images.length}
              </Text>
            </View>
          )}

          {/* Indicators Overlay */}
          <View style={styles.indicators}>
            {images.map((_: any, idx: number) => (
              <View
                key={idx}
                style={[styles.indicatorDot, idx === activeImg ? styles.indicatorDotActive : null]}
              />
            ))}
          </View>
        </View>

        <View style={styles.content}>
          {/* Header Block */}
          <View style={styles.headerBlock}>
            <View style={styles.metaRow}>
              <MapPin size={14} color="#64748b" />
              <Text style={styles.metaText}>{vehicle.city}</Text>
              <Text style={styles.metaDot}>·</Text>
              <Text style={styles.metaText}>
                Posted {new Date(vehicle.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </Text>
            </View>

            <View style={styles.titleRow}>
              <Text style={styles.brandTitle} numberOfLines={2}>
                {vehicle.registrationYear} {vehicle.brand} {vehicle.model}
              </Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleWishlist}
                style={[styles.wishlistButton, wishlisted ? styles.wishlistButtonActive : null]}
              >
                <Heart size={20} color={wishlisted ? "#f43f5e" : "#64748b"} fill={wishlisted ? "#f43f5e" : "transparent"} />
              </TouchableOpacity>
            </View>
            <Text style={styles.variantSubtitle}>{vehicle.variant || "Standard Edition"}</Text>
            
            <Text style={styles.priceTag}>{formatINR(vehicle.askingPrice)}</Text>
          </View>

          {/* Key Specs Card */}
          <View style={styles.card}>
            <Text style={styles.cardHeader}>Key Specs</Text>
            <View style={styles.specsGrid}>
              <View style={styles.gridItem}>
                <Calendar size={16} color="#64748b" style={styles.gridIcon} />
                <View>
                  <Text style={styles.gridLabel}>Reg. Year</Text>
                  <Text style={styles.gridValue}>{vehicle.registrationYear}</Text>
                </View>
              </View>

              <View style={styles.gridItem}>
                <Gauge size={16} color="#64748b" style={styles.gridIcon} />
                <View>
                  <Text style={styles.gridLabel}>KM Driven</Text>
                  <Text style={styles.gridValue}>{formatKM(vehicle.kilometerDriven)}</Text>
                </View>
              </View>

              <View style={styles.gridItem}>
                <Fuel size={16} color="#64748b" style={styles.gridIcon} />
                <View>
                  <Text style={styles.gridLabel}>Fuel</Text>
                  <Text style={styles.gridValue}>{vehicle.fuelType}</Text>
                </View>
              </View>

              <View style={styles.gridItem}>
                <BadgeCheck size={16} color="#64748b" style={styles.gridIcon} />
                <View>
                  <Text style={styles.gridLabel}>Ownership</Text>
                  <Text style={styles.gridValue}>
                    {`${vehicle.ownershipDetails}${
                      vehicle.ownershipDetails === 1 ? "st" :
                      vehicle.ownershipDetails === 2 ? "nd" :
                      vehicle.ownershipDetails === 3 ? "rd" : "th"
                    } Owner`}
                  </Text>
                </View>
              </View>

              {vehicle.vehicleType && (
                <View style={styles.gridItem}>
                  <Car size={16} color="#64748b" style={styles.gridIcon} />
                  <View>
                    <Text style={styles.gridLabel}>Vehicle Type</Text>
                    <Text style={styles.gridValue}>{vehicle.vehicleType}</Text>
                  </View>
                </View>
              )}

              <View style={styles.gridItem}>
                <DollarSign size={16} color="#64748b" style={styles.gridIcon} />
                <View>
                  <Text style={styles.gridLabel}>Finance</Text>
                  <Text style={styles.gridValue}>
                    {vehicle.financeAvailability ? "Available" : "Not Available"}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Description Card */}
          {vehicle.vehicleDescription ? (
            <View style={styles.card}>
              <Text style={styles.cardHeader}>Description</Text>
              <Text style={styles.descriptionText}>
                {vehicle.vehicleDescription}
              </Text>
            </View>
          ) : null}

          {/* Walkaround Video Card */}
          {videos.length > 0 && (
            <View style={styles.card}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
                <Play size={20} color="#e11d48" style={{ marginRight: 8 }} />
                <Text style={[styles.cardHeader, { marginBottom: 0 }]}>Walkaround Video</Text>
              </View>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                {videos.map((vidUrl: string, idx: number) => (
                  <TouchableOpacity
                    key={idx}
                    activeOpacity={0.8}
                    onPress={() => Linking.openURL(vidUrl)}
                    style={styles.videoThumbnailContainer}
                  >
                    <Image
                      source={{ uri: images[0] }}
                      style={styles.videoThumbnailImage}
                      blurRadius={10}
                    />
                    <View style={styles.videoPlayOverlay}>
                      <View style={styles.playButtonCircle}>
                        <Play size={24} color="#0f172a" fill="#0f172a" style={{ marginLeft: 3 }} />
                      </View>
                      <Text style={styles.videoCountText}>Video {idx + 1}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Dealer Sticky Card Equivalent */}
          <View style={styles.dealerCard}>
            <View style={styles.dealerCardHeader}>
              <Text style={styles.dealerCardTitle}>{vehicle.registrationYear} {vehicle.brand} {vehicle.model}</Text>
              <Text style={styles.dealerCardSubtitle}>{vehicle.variant}</Text>
              <Text style={styles.dealerCardPrice}>{formatINR(vehicle.askingPrice)}</Text>
            </View>
            
            <View style={styles.dealerMiniSpecs}>
              <View style={styles.miniSpecItem}>
                <Fuel size={14} color="#64748b" />
                <Text style={styles.miniSpecText}>{vehicle.fuelType}</Text>
              </View>
              <View style={[styles.miniSpecItem, styles.miniSpecBorder]}>
                <Calendar size={14} color="#64748b" />
                <Text style={styles.miniSpecText}>{vehicle.registrationYear}</Text>
              </View>
              <View style={styles.miniSpecItem}>
                <Gauge size={14} color="#64748b" />
                <Text style={styles.miniSpecText}>{formatKM(vehicle.kilometerDriven)}</Text>
              </View>
            </View>

            {vehicle.dealerShowroomImage && (
              <View style={styles.showroomBanner}>
                <Image
                  source={{ uri: vehicle.dealerShowroomImage }}
                  style={styles.showroomBannerImage}
                  resizeMode="cover"
                />
                <View style={styles.showroomOverlay} />
              </View>
            )}

            <View style={styles.dealerInfoBlock}>
              <View style={styles.dealerHeaderRow}>
                {vehicle.dealerLogo ? (
                  <Image source={{ uri: vehicle.dealerLogo }} style={styles.dealerLogoImg} />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={styles.avatarFallbackText}>
                      {vehicle.dealerContactName?.charAt(0) || "D"}
                    </Text>
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.dealerBusinessName}>
                    {vehicle.dealerBusinessName || "Verified Partner Dealer"}
                  </Text>
                  <Text style={styles.dealerContactName}>
                    Contact: {vehicle.dealerContactName || "Dealer Representative"}
                  </Text>
                </View>
              </View>

              {revealed ? (
                <View>
                  <View style={styles.revealedActions}>
                    <TouchableOpacity onPress={handleCall} style={[styles.contactBtn, styles.callBtn]}>
                      <Phone size={16} color="#fff" />
                      <Text style={styles.contactBtnText}>Call</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleWhatsApp} style={[styles.contactBtn, styles.whatsappBtn]}>
                      <MessageCircle size={16} color="#fff" />
                      <Text style={styles.contactBtnText}>WhatsApp</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.revealedNumbers}>
                    {vehicle.dealerContactNumber ? (
                      <Text style={styles.revealedNumberText}>
                        Dealer: +91 {vehicle.dealerContactNumber.replace(/\D/g, "").replace(/^91/, "")}
                      </Text>
                    ) : null}
                    {vehicle.executiveMobile ? (
                      <Text style={styles.revealedNumberText}>
                        Executive: +91 {vehicle.executiveMobile.replace(/\D/g, "").replace(/^91/, "")}
                      </Text>
                    ) : null}
                  </View>
                </View>
              ) : (
                <Button
                  title="Contact Seller"
                  onPress={handleEnquirePress}
                  style={styles.unlockBtn}
                />
              )}
            </View>
          </View>
        </View>

        {/* Enquiry Form Modal */}
        <Modal
          visible={showContactModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowContactModal(false)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={{ flex: 1 }}
              activeOpacity={1}
              onPress={() => setShowContactModal(false)}
            />
            <SafeAreaView style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Dealer Enquiry Form</Text>
                <TouchableOpacity onPress={() => setShowContactModal(false)} style={styles.closeBtn}>
                  <X size={20} color="#0f172a" />
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={styles.modalBodyScroll}>
                <Text style={styles.formInstructions}>
                  Submit your query details. The system will deliver your lead to the dealer instantly.
                </Text>

                {formError ? <Text style={styles.formErrorText}>{formError}</Text> : null}

                <Input
                  label="Full Name"
                  value={leadName}
                  onChangeText={setLeadName}
                  placeholder="Enter your name"
                />

                <Input
                  label="Mobile Number"
                  value={leadMobile}
                  onChangeText={setLeadMobile}
                  placeholder="Enter mobile number"
                  keyboardType="phone-pad"
                  editable={false}
                />

                <Input
                  label="Your City"
                  value={leadCity}
                  onChangeText={setLeadCity}
                  placeholder="e.g. Pune"
                />

                <Button
                  title="Submit & Unlock Details"
                  loading={isSubmitting}
                  onPress={handleLeadSubmit}
                  style={{ marginTop: 12 }}
                />
              </ScrollView>
            </SafeAreaView>
          </View>
        </Modal>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  errorText: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 16,
  },
  retryBtn: {
    minWidth: 120,
  },
  galleryContainer: {
    position: "relative",
    width: "100%",
    backgroundColor: "#e2e8f0",
  },
  galleryImage: {
    width: width,
    height: width * (10 / 16),
  },
  galleryTopLeft: {
    position: "absolute",
    top: 16,
    left: 16,
    gap: 6,
    zIndex: 10,
  },
  galleryCounter: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "rgba(0,0,0,0.75)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  galleryCounterText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "900",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  badgeFeatured: {
    backgroundColor: "#f43f5e",
  },
  badgePremium: {
    backgroundColor: "#f59e0b",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  badgeIcon: {
    marginRight: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  indicators: {
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  indicatorDotActive: {
    backgroundColor: "#fff",
    width: 16,
  },
  content: {
    padding: 16,
    paddingTop: 24,
    gap: 16,
  },
  headerBlock: {
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    flexWrap: "wrap",
  },
  metaText: {
    fontSize: 12,
    color: "#64748b",
    marginLeft: 4,
  },
  metaDot: {
    color: "#64748b",
    marginHorizontal: 6,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0f172a",
    flex: 1,
    lineHeight: 32,
  },
  wishlistButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  wishlistButtonActive: {
    backgroundColor: "#fff1f2",
    borderColor: "#ffe4e6",
  },
  variantSubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 12,
  },
  priceTag: {
    fontSize: 32,
    fontWeight: "900",
    color: "#e11d48",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  cardHeader: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 16,
  },
  specsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -8,
  },
  gridItem: {
    width: "50%",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  gridIcon: {
    marginRight: 10,
  },
  gridLabel: {
    fontSize: 11,
    color: "#64748b",
    marginBottom: 2,
  },
  gridValue: {
    fontSize: 14,
    color: "#0f172a",
    fontWeight: "600",
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 24,
    color: "#475569",
  },
  videoThumbnailContainer: {
    width: 240,
    height: 135,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#0f172a",
  },
  videoThumbnailImage: {
    width: "100%",
    height: "100%",
    opacity: 0.6,
  },
  videoPlayOverlay: {
    position: "absolute",
    inset: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  playButtonCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  videoCountText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  dealerCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    overflow: "hidden",
    marginTop: 8,
  },
  dealerCardHeader: {
    padding: 20,
  },
  dealerCardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
  },
  dealerCardSubtitle: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  dealerCardPrice: {
    fontSize: 24,
    fontWeight: "900",
    color: "#e11d48",
    marginTop: 12,
  },
  dealerMiniSpecs: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#e2e8f0",
    paddingVertical: 12,
  },
  miniSpecItem: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
  },
  miniSpecBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#e2e8f0",
  },
  miniSpecText: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
  showroomBanner: {
    height: 120,
    width: "100%",
    position: "relative",
  },
  showroomBannerImage: {
    width: "100%",
    height: "100%",
  },
  showroomOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  dealerInfoBlock: {
    padding: 20,
  },
  dealerHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  dealerLogoImg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    marginRight: 12,
  },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarFallbackText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#64748b",
  },
  dealerBusinessName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 2,
  },
  dealerContactName: {
    fontSize: 13,
    color: "#64748b",
  },
  unlockBtn: {
    width: "100%",
    borderRadius: 12,
  },
  revealedActions: {
    flexDirection: "row",
    gap: 12,
  },
  contactBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: 12,
    gap: 8,
  },
  callBtn: {
    backgroundColor: "#0f172a",
  },
  whatsappBtn: {
    backgroundColor: "#25D366",
  },
  contactBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  revealedNumbers: {
    marginTop: 12,
    alignItems: "center",
    gap: 4,
  },
  revealedNumberText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  closeBtn: {
    padding: 4,
  },
  modalBodyScroll: {
    padding: 20,
    paddingBottom: 40,
  },
  formInstructions: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 20,
    lineHeight: 20,
  },
  formErrorText: {
    color: "#ef4444",
    fontSize: 14,
    marginBottom: 16,
    fontWeight: "500",
  },
});
