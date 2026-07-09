import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  Linking,
  DeviceEventEmitter,
  Animated,
  Easing,
} from "react-native";
import Video from "react-native-video";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../../navigation/AppNavigator";
import ScreenWrapper from "../../components/shared/ScreenWrapper";
import { VehicleCard } from "../../components/cards/VehicleCard";
import { FeaturedVehicleCard } from "../../components/cards/FeaturedVehicleCard";
import { useLatestVehicles, useFeaturedVehicles } from "../../hooks/public/useHomeVehicles";
import { QUICK_BRANDS, CITIES, BUDGET_BANDS } from "../../utils/constants";
import { getCustomerModels } from "../../data/customerCarDatabase";
import Button from "../../components/ui/Button";
import SearchableDropdown from "../../components/shared/SearchableDropdown";

import {
  BadgeCheck as BadgeCheckIcon,
  ShieldCheck as ShieldCheckIcon,
  MessageSquare as MessageSquareIcon,
  Zap as ZapIcon,
  Search as SearchIcon,
  ArrowRight as ArrowRightIcon,
  Coins as CoinsIcon,
  Phone as PhoneIcon,
  Headphones as HeadphonesIcon,
} from "lucide-react-native";

const BadgeCheck = BadgeCheckIcon as any;
const ShieldCheck = ShieldCheckIcon as any;
const MessageSquare = MessageSquareIcon as any;
const Zap = ZapIcon as any;
const Search = SearchIcon as any;
const ArrowRight = ArrowRightIcon as any;
const Coins = CoinsIcon as any;
const Phone = PhoneIcon as any;
const Headphones = HeadphonesIcon as any;

const { width } = Dimensions.get("window");

const BRAND_LOGOS: Record<string, any> = {
  Hyundai: require("../../assets/BrandLogo/hyundai.png"),
  "Maruti Suzuki": require("../../assets/BrandLogo/maruti-suzuki.png"),
  Tata: require("../../assets/BrandLogo/Tata.png"),
  Mahindra: require("../../assets/BrandLogo/mahindra.webp"),
  Toyota: require("../../assets/BrandLogo/Toyota.jpg"),
  Honda: require("../../assets/BrandLogo/honda.png"),
  Kia: require("../../assets/BrandLogo/kia.jpg"),
  MG: require("../../assets/BrandLogo/mg.png"),
  Ford: require("../../assets/BrandLogo/ford.png"),
};

const STATS = [
  { label: "Verified Dealers", value: "500+" },
  { label: "Vehicles Listed", value: "25,000+" },
  { label: "Happy Customers", value: "1000+" },
  { label: "Monthly Visitors", value: "50,000+" },
];

const WHY = [
  {
    icon: BadgeCheck,
    title: "Verified Dealers",
    text: "Every dealer is KYC-verified and inspected before going live.",
  },
  {
    icon: ShieldCheck,
    title: "Trusted Listings",
    text: "Inventory checked for authenticity, ownership and condition.",
  },
  {
    icon: MessageSquare,
    title: "Direct Dealer Contact",
    text: "No middlemen. Talk to dealers directly via call or WhatsApp.",
  },
  {
    icon: Zap,
    title: "Fast Lead Delivery",
    text: "Dealers receive your enquiry in real-time for faster response.",
  },
];

const YEARS = Array.from({ length: new Date().getFullYear() - 1999 }, (_, i) => ({
  label: String(2000 + i),
  value: String(2000 + i),
})).reverse();

const SLIDES = [
  {
    subtitle: "Finance • Auto Loans",
    title: "VahanFinserv",
    description: "Get the best auto loan rates for your next car purchase. Fast approval and zero hidden fees. Partnered with VahanFinserv.",
    buttonText: "USE CAR LOAN VISIT VAHANFINSERV",
    hudLabel1: "LIVE STATUS",
    hudValue1: "50,000+ Cars Online",
    hudLabel2: "100% CERTIFIED",
    hudValue2: "Verified Dealers",
  },
  {
    subtitle: "KYC Verified Sellers • Direct Chat",
    title: "Connection",
    description: "Talk directly to verified dealers on WhatsApp or call them instantly with zero hidden commissions.",
    buttonText: "",
    hudLabel1: "DIRECT CHAT",
    hudValue1: "Connect on WhatsApp",
    hudLabel2: "ZERO COMMISSION",
    hudValue2: "Direct-to-Dealer Deals",
  },
  {
    subtitle: "Inspected Quality • History Checked",
    title: "Verification",
    description: "Every vehicle listed undergoes a registration papers check, history verification, and detailed inspection.",
    buttonText: "",
    hudLabel1: "HISTORY",
    hudValue1: "RTO Checked",
    hudLabel2: "INSPECTION",
    hudValue2: "150+ Point Check",
  }
];

export default function Home() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const { vehicles: latest, loading: latestLoading } = useLatestVehicles();
  const { vehicles: featured, loading: featuredLoading } = useFeaturedVehicles();

  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [city, setCity] = useState("");
  const [budget, setBudget] = useState("");

  const [currentSlide, setCurrentSlide] = useState(0);

  const slideAnim = React.useRef(new Animated.Value(0)).current;
  const fadeAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setInterval(() => {
      // 1. Animate out (slide left and fade out)
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 400,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // 2. Change state
        setCurrentSlide((prev) => (prev + 1) % SLIDES.length);

        // 3. Reset position to the right (invisible)
        slideAnim.setValue(100);

        // 4. Animate in (slide center and fade in)
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }, 4000); // 4 seconds per slide to allow reading

    return () => clearInterval(timer);
  }, [slideAnim, fadeAnim]);

  const models = brand ? getCustomerModels(brand) : [];

  const handleSearch = () => {
    navigation.navigate("Cars", {
      brand: brand || undefined,
      model: model || undefined,
      city: city || undefined,
    });
  };

  const handleBrandSelect = (brandName: string) => {
    navigation.navigate("Cars", { brand: brandName });
  };

  return (
    <ScreenWrapper layoutType="public" scrollEnabled={true}>
      {/* 1. Hero Section */}
      <View style={styles.heroBackground}>
        <Video
          source={require("../../assets/videos/car-video.mp4")}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          repeat={true}
          muted={true}
          allowsExternalPlayback={false}
        />
        <View style={styles.overlay} />
        <View style={styles.heroContent}>
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateX: slideAnim }] }}>
            <Text style={styles.heroSubtitle}>{SLIDES[currentSlide].subtitle}</Text>
            <Text style={styles.heroTitle}>{SLIDES[currentSlide].title}</Text>

            <View style={styles.hudContainer}>
              <View style={styles.hudWidget}>
                <View style={styles.hudDot} />
                <View>
                  <Text style={styles.hudLabelRed}>{SLIDES[currentSlide].hudLabel1}</Text>
                  <Text style={styles.hudValue}>{SLIDES[currentSlide].hudValue1}</Text>
                </View>
              </View>

              <View style={styles.hudWidget}>
                <View style={styles.hudBadgeIcon}>
                  <ShieldCheck color="#34d399" size={14} strokeWidth={3} />
                </View>
                <View>
                  <Text style={styles.hudLabelGreen}>{SLIDES[currentSlide].hudLabel2}</Text>
                  <Text style={styles.hudValue}>{SLIDES[currentSlide].hudValue2}</Text>
                </View>
              </View>
            </View>

            <Text style={styles.heroDesc}>
              {SLIDES[currentSlide].description}
            </Text>

            <View style={styles.heroActionBtnsContainer}>
              {SLIDES[currentSlide].buttonText ? (
                <TouchableOpacity
                  style={styles.heroCustomerLoginBtn}
                  onPress={() => Linking.openURL("https://vahanfinserv.com/")}
                >
                  <Text style={styles.heroCustomerLoginText}>{SLIDES[currentSlide].buttonText}</Text>
                </TouchableOpacity>
              ) : null}

              <View style={styles.heroActionBtns}>
                <TouchableOpacity
                  style={styles.heroDealerLoginBtn}
                  onPress={() => DeviceEventEmitter.emit("show-auth-modal")}
                >
                  <Text style={styles.heroDealerLoginText}>Join as Buyer</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.heroRegisterBtn}
                  onPress={() => navigation.navigate("Register")}
                >
                  <Text style={styles.heroRegisterText}>Join as Dealer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </View>
      </View>

      {/* 2. Featured Vehicles Carousel (Horizontal List) */}
      <View style={[styles.section, { marginTop: 40, backgroundColor: "#ffffff", paddingVertical: 48 }]}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Featured Collections</Text>
            <Text style={styles.sectionSubtitle}>Handpicked premium inventory</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate("Cars")}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {featuredLoading ? (
          <ActivityIndicator size="small" color="#f43f5e" style={styles.loader} />
        ) : featured.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>No featured vehicles available.</Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {featured.slice(0, 8).map((vehicle: any) => (
              <View key={vehicle.id} style={styles.carouselItem}>
                <FeaturedVehicleCard vehicle={vehicle} />
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* 3. Quick Brand Search Grid */}
      <View style={[styles.section, { marginTop: 40, backgroundColor: "#f8fafc", paddingVertical: 48 }]}>
        <Text style={[styles.sectionTitle, { textAlign: "center" }]}>Browse by Top Brands</Text>
        <Text style={[styles.sectionSubtitle, { textAlign: "center", marginBottom: 16 }]}>Find your favourite make from India's leading manufacturers</Text>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.brandMarquee}
        >
          {QUICK_BRANDS.map((brandName) => {
            const logo = BRAND_LOGOS[brandName];
            return (
              <TouchableOpacity
                key={brandName}
                activeOpacity={0.8}
                onPress={() => handleBrandSelect(brandName)}
                style={styles.brandCard}
              >
                {logo ? (
                  <Image source={logo} style={styles.brandLogo} resizeMode="contain" />
                ) : (
                  <Text style={styles.brandTextFallback}>{brandName}</Text>
                )}
                <Text style={styles.brandNameText} numberOfLines={1}>
                  {brandName}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 3.5. Latest Listings (Vertical Stacked Cards) */}
      <View style={[styles.section, { marginTop: 40, backgroundColor: "#ffffff", paddingVertical: 48 }]}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Latest Listings</Text>
            <Text style={styles.sectionSubtitle}>Fresh inventory updated daily</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate("Cars")}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {latestLoading ? (
          <ActivityIndicator size="small" color="#f43f5e" style={styles.loader} />
        ) : latest.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>No vehicles available at the moment.</Text>
          </View>
        ) : (
          <View style={styles.verticalList}>
            {latest.slice(0, 10).map((vehicle: any) => (
              <View key={vehicle.id} style={styles.verticalItem}>
                <VehicleCard vehicle={vehicle} />
              </View>
            ))}
          </View>
        )}
      </View>

      {/* 4. Browse by Budget */}
      <View style={[styles.section, { marginTop: 40, backgroundColor: "#f8fafc", paddingVertical: 48 }]}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Browse by Budget</Text>
            <Text style={styles.sectionSubtitle}>Pick a price range that fits you</Text>
          </View>
        </View>

        <View style={styles.budgetGrid}>
          {BUDGET_BANDS.map((b, idx) => (
            <TouchableOpacity
              key={b.label}
              style={styles.budgetCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate("Cars", { budget: b.label })}
            >
              <Text style={styles.budgetRangeLabel}>BUDGET RANGE</Text>
              <Text style={styles.budgetValue}>{b.label}</Text>
              <View style={styles.budgetExploreRow}>
                <Text style={styles.budgetExploreText}>Explore</Text>
                <ArrowRight size={14} color="#be185d" style={{ marginLeft: 4 }} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 5. Get Started with Caryanam (Buy vs Sell dual cards) */}
      <View style={[styles.section, { marginTop: 40, backgroundColor: "#ffffff", paddingVertical: 48 }]}>
        <Text style={[styles.sectionTitle, { textAlign: "center" }]}>Get Started with Caryanam</Text>
        <Text style={[styles.sectionSubtitle, { textAlign: "center", marginBottom: 24 }]}>Choose the car that's true to you & luxury at every mile</Text>
        
        <View style={styles.actionCardContainer}>
          {/* For Buyers */}
          <View style={styles.actionCard}>
            <ImageBackground 
              source={{ uri: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=800' }}
              style={styles.actionCardBg}
              imageStyle={{ borderRadius: 24 }}
            >
              <View style={styles.actionCardOverlay} />
              <View style={styles.actionCardContent}>
                <View style={styles.badgeWrapper}>
                  <Text style={styles.badgeText}>FOR BUYERS</Text>
                </View>
                <Text style={styles.actionCardTitle}>Are You Looking for a Car?</Text>
                <Text style={styles.actionCardDesc}>Find the perfect car that matches your style and budget.</Text>
                <TouchableOpacity 
                  style={styles.actionCardBtn}
                  onPress={() => navigation.navigate("Cars")}
                >
                  <Text style={styles.actionCardBtnText}>Get Started</Text>
                </TouchableOpacity>
              </View>
            </ImageBackground>
          </View>

          {/* For Sellers */}
          <View style={[styles.actionCard, { marginTop: 16 }]}>
            <ImageBackground 
              source={{ uri: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800' }}
              style={styles.actionCardBg}
              imageStyle={{ borderRadius: 24 }}
            >
              <View style={styles.actionCardOverlay} />
              <View style={styles.actionCardContent}>
                <View style={styles.badgeWrapper}>
                  <Text style={styles.badgeText}>FOR SELLERS</Text>
                </View>
                <Text style={styles.actionCardTitle}>Do You Want to Sell a Car?</Text>
                <Text style={styles.actionCardDesc}>List your car for free and connect with genuine buyers.</Text>
                <TouchableOpacity 
                  style={styles.actionCardBtn}
                  onPress={() => navigation.navigate("Login")}
                >
                  <Text style={styles.actionCardBtnText}>Get Started</Text>
                </TouchableOpacity>
              </View>
            </ImageBackground>
          </View>
        </View>

        {/* Bottom Trust/Benefit row */}
        <View style={styles.trustGrid}>
          {[
            {
              title: "100% Verified Listings",
              description: "Trusted & verified sellers",
              icon: ShieldCheck,
            },
            {
              title: "Best Price Guarantee",
              description: "Get the best deal always",
              icon: Coins,
            },
            {
              title: "Easy Dealer Contact",
              description: "Connect with verified dealers",
              icon: Phone,
            },
            {
              title: "24/7 Customer Support",
              description: "We're here to help",
              icon: Headphones,
            },
          ].map((item, idx) => {
            const IconComp = item.icon;
            return (
              <View key={idx} style={styles.trustItem}>
                <View style={styles.trustIconWrapper}>
                  <IconComp size={18} color="#be185d" strokeWidth={2} />
                </View>
                <View style={styles.trustTextWrapper}>
                  <Text style={styles.trustTitle}>{item.title}</Text>
                  <Text style={styles.trustDesc}>{item.description}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* 5. Why Choose Caryanam Section */}
      <View style={styles.whySection}>
        <Text style={styles.whySubtitle}>Our Promise</Text>
        <Text style={styles.whyTitle}>Why Choose Caryanam</Text>
        <Text style={styles.whyDesc}>Built for buyers. Loved by dealers. Trusted across India.</Text>

        <View style={styles.whyGrid}>
          {WHY.map((w, idx) => {
            const IconComp = w.icon;
            return (
              <View key={idx} style={styles.whyCard}>
                <View style={styles.whyIconWrapper}>
                  <IconComp size={22} color="#ffffff" strokeWidth={2.5} />
                </View>
                <Text style={styles.whyCardTitle}>{w.title}</Text>
                <Text style={styles.whyCardText}>{w.text}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* 6. Website Promo Section */}
      <View style={styles.promoSection}>
        <View style={styles.promoBadge}>
          <Text style={styles.promoBadgeText}>🌐 Visit Our Website</Text>
        </View>
        
        <Text style={styles.promoTitle}>
          Explore The Full Experience{"\n"}On Our Web Platform
        </Text>
        
        <Text style={styles.promoDesc}>
          Visit caryanam.com to access advanced dealer tools, comprehensive market reports, and our full suite of premium services on the big screen.
        </Text>

        <View style={styles.promoBenefits}>
          {[
            "Advanced Search Filters",
            "Detailed Vehicle Reports",
            "Full Dealer Dashboard",
          ].map((benefit, index) => (
            <View key={index} style={styles.promoBenefitRow}>
              <View style={styles.promoCheckCircle}>
                <Text style={styles.promoCheckText}>✓</Text>
              </View>
              <Text style={styles.promoBenefitText}>{benefit}</Text>
            </View>
          ))}
        </View>

        <View style={styles.promoButtonsContainer}>
          <TouchableOpacity 
            style={styles.promoBtnAndroid}
            onPress={() => Linking.openURL("https://caryanam.com/")}
          >
            <Text style={styles.promoBtnAndroidText}>VISIT CARYANAM.COM</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  heroBackground: {
    width: width,
    minHeight: 750,
    paddingTop: 80,
    paddingBottom: 100,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
  },
  heroContent: {
    alignItems: "flex-start",
    zIndex: 1,
  },
  heroSubtitle: {
    color: "#f43f5e",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 4,
    marginBottom: 8,
  },
  heroTitle: {
    color: "#fff",
    fontSize: 48,
    fontWeight: "900",
    textAlign: "left",
    lineHeight: 56,
  },
  heroDesc: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    lineHeight: 22,
    marginTop: 40,
    fontWeight: "400",
  },
  hudContainer: {
    marginTop: 48,
    flexDirection: "column",
    gap: 12,
  },
  hudWidget: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
  },
  hudDot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: "#f43f5e",
    marginRight: 12,
  },
  hudBadgeIcon: {
    height: 24,
    width: 24,
    borderRadius: 6,
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  hudLabelRed: {
    fontSize: 10,
    fontWeight: "900",
    color: "#f43f5e",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  hudLabelGreen: {
    fontSize: 10,
    fontWeight: "900",
    color: "#34d399",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  hudValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
    marginTop: 2,
  },
  heroDesc: {
    fontSize: 14,
    color: "#e2e8f0",
    lineHeight: 24,
    opacity: 0.85,
    marginTop: 20,
  },
  heroActionBtnsContainer: {
    marginTop: 36,
    width: "100%",
  },
  heroCustomerLoginBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 12,
  },
  heroCustomerLoginText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  heroActionBtns: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  heroDealerLoginBtn: {
    backgroundColor: "#e11d48", // Primary Brand Color
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#e11d48",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  heroDealerLoginText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  heroRegisterBtn: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.5)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  heroRegisterText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  searchSection: {
    paddingHorizontal: 16,
    marginTop: -40, // overlap with hero
    zIndex: 10,
    marginBottom: 24,
  },
  searchCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  searchCardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 20,
    textAlign: "center",
  },
  searchButton: {
    backgroundColor: "#be185d", // Rose 700 gradient effect approx
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 12,
    shadowColor: "#be185d",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  searchButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0f172a", // Slate 900
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
  },
  viewAllText: {
    color: "#f43f5e",
    fontSize: 13,
    fontWeight: "700",
  },
  loader: {
    marginVertical: 24,
  },
  horizontalScroll: {
    paddingRight: 16,
  },
  carouselItem: {
    width: width * 0.75,
    marginRight: 16,
  },
  verticalList: {
    marginTop: 4,
  },
  verticalItem: {
    marginBottom: 16,
  },
  whySection: {
    backgroundColor: "#000000",
    marginTop: 40,
    paddingVertical: 64,
    paddingHorizontal: 20,
  },
  whySubtitle: {
    color: "#f43f5e",
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 3,
    marginBottom: 8,
  },
  whyTitle: {
    color: "#ffffff",
    fontSize: 32,
    fontWeight: "900",
    marginBottom: 12,
  },
  whyDesc: {
    color: "rgba(255, 255, 255, 0.45)",
    fontSize: 14,
    fontWeight: "300",
    marginBottom: 40,
  },
  whyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  whyCard: {
    width: "48%",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.07)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  whyIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#f43f5e",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#f43f5e",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  whyCardTitle: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
  },
  whyCardText: {
    color: "rgba(255, 255, 255, 0.45)",
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "300",
  },
  brandMarquee: {
    paddingRight: 16,
    marginTop: 20,
    paddingBottom: 8,
  },
  brandCard: {
    width: 100,
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  brandLogo: {
    width: "100%",
    height: 40,
    marginBottom: 8,
  },
  brandTextFallback: {
    fontSize: 14,
    fontWeight: "800",
    color: "#f43f5e",
    height: 40,
    textAlignVertical: "center",
    textAlign: "center",
  },
  brandNameText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#334155",
    textAlign: "center",
  },
  actionCardContainer: {
    paddingHorizontal: 8,
  },
  actionCard: {
    height: 240,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  actionCardBg: {
    flex: 1,
    justifyContent: "flex-end",
  },
  actionCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    borderRadius: 24,
  },
  actionCardContent: {
    padding: 24,
    zIndex: 1,
  },
  badgeWrapper: {
    backgroundColor: "#be185d",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  actionCardTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 8,
  },
  actionCardDesc: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  actionCardBtn: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    alignSelf: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  actionCardBtnText: {
    color: "#be185d",
    fontSize: 14,
    fontWeight: "900",
  },
  emptyStateContainer: {
    paddingVertical: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText: {
    color: "#64748b",
    fontSize: 14,
    fontWeight: "500",
  },
  budgetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 8,
  },
  budgetCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  budgetRangeLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  budgetValue: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0f172a",
    marginTop: 6,
  },
  budgetExploreRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  budgetExploreText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#be185d",
  },
  trustGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  trustItem: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  trustIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "rgba(190, 24, 93, 0.1)",
    shadowColor: "rgba(190, 24, 93, 0.05)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  trustTextWrapper: {
    flex: 1,
  },
  trustTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: "#0f172a",
    lineHeight: 16,
  },
  trustDesc: {
    fontSize: 10,
    color: "#94a3b8",
    marginTop: 2,
  },
  promoSection: {
    backgroundColor: "#ffffff",
    paddingVertical: 64,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  promoBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff1f2", 
    borderWidth: 1,
    borderColor: "#ffe4e6", 
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "flex-start",
    marginBottom: 24,
  },
  promoBadgeText: {
    color: "#e11d48", 
    fontSize: 14,
    fontWeight: "700",
  },
  promoTitle: {
    color: "#0f172a", 
    fontSize: 32,
    fontWeight: "900",
    lineHeight: 38,
    marginBottom: 24,
  },
  promoDesc: {
    color: "#0f172a",
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 32,
    fontWeight: "400",
  },
  promoBenefits: {
    marginBottom: 32,
  },
  promoBenefitRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  promoCheckCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fff1f2",
    borderWidth: 1,
    borderColor: "#ffe4e6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  promoCheckText: {
    color: "#e11d48",
    fontSize: 12,
    fontWeight: "900",
  },
  promoBenefitText: {
    color: "#1e293b",
    fontSize: 14,
    fontWeight: "700",
  },
  promoButtonsContainer: {
    flexDirection: "column",
    gap: 16,
  },
  promoBtnAndroid: {
    backgroundColor: "#000000",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  promoBtnAndroidText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
  },
  mockupContainer: {
    width: 280,
    height: 560,
    backgroundColor: "#0f172a",
    borderRadius: 44,
    padding: 12,
    borderWidth: 4,
    borderColor: "#0f172a",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 10,
    alignSelf: "center",
    marginTop: 48,
  },
  mockupScreen: {
    flex: 1,
    backgroundColor: "#fbf7f4",
    borderRadius: 32,
    overflow: "hidden",
    padding: 16,
    justifyContent: "space-between",
    position: "relative",
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.1)",
  },
  mockupNotch: {
    position: "absolute",
    top: 0,
    left: "50%",
    marginLeft: -40,
    width: 80,
    height: 24,
    backgroundColor: "#0f172a",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    zIndex: 10,
  },
  mockupHeaderCard: {
    backgroundColor: "#be185d",
    padding: 16,
    borderRadius: 16,
    marginTop: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  mockupHeaderSubtitle: {
    color: "#fda4af",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
    marginBottom: 4,
  },
  mockupHeaderTitle: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 4,
  },
  mockupHeaderFooter: {
    color: "#cbd5e1",
    fontSize: 10,
    fontWeight: "600",
  },
  mockupCarCard: {
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  mockupCarImage: {
    width: "100%",
    height: 120,
    borderRadius: 12,
    backgroundColor: "#fff1f2",
  },
  mockupCarTextContainer: {
    marginTop: 12,
    marginBottom: 8,
  },
  mockupCarTitle: {
    color: "#1e293b",
    fontSize: 14,
    fontWeight: "700",
  },
  mockupCarLoc: {
    color: "#94a3b8",
    fontSize: 10,
    marginTop: 2,
  },
  mockupCarFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#f8fafc",
    paddingTop: 8,
  },
  mockupCarPrice: {
    color: "#1e293b",
    fontSize: 12,
    fontWeight: "900",
  },
  mockupCarBtn: {
    backgroundColor: "#e11d48",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  mockupCarBtnText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "900",
  },
  mockupStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    marginBottom: 8,
  },
  mockupStatBox: {
    width: "48%",
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(241, 245, 249, 0.5)",
    alignItems: "center",
  },
  mockupStatLabel: {
    color: "#94a3b8",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
  mockupStatValue: {
    color: "#1e293b",
    fontSize: 16,
    fontWeight: "900",
    marginTop: 4,
  },
});
