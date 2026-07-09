import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../../navigation/AppNavigator";
import ScreenWrapper from "../../components/shared/ScreenWrapper";
import { Shield, Star, Award, TrendingUp, ArrowRight } from "lucide-react-native";

const VALUES = [
  {
    icon: Shield,
    title: "Trust & Transparency",
    desc: "Every vehicle listing goes through a rigorous verification process. No hidden costs, no surprises — just honest deals.",
    color: "#e11d48", // Rose 600
  },
  {
    icon: Star,
    title: "Customer First",
    desc: "We put buyers and sellers at the center of everything we do. Our platform is built to make your journey smooth and stress-free.",
    color: "#d97706", // Amber 600
  },
  {
    icon: Award,
    title: "Quality Dealers",
    desc: "We partner only with certified dealerships who maintain high standards of service, ensuring you get the best experience every time.",
    color: "#059669", // Emerald 600
  },
  {
    icon: TrendingUp,
    title: "Innovation",
    desc: "We constantly improve our platform with cutting-edge technology to give you the fastest, smartest car-buying experience in India.",
    color: "#7c3aed", // Violet 600
  },
];

export default function About() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <ScreenWrapper layoutType="public" scrollEnabled={true}>
      <View style={styles.container}>
        
        {/* Intro Section */}
        <View style={styles.introSection}>
          <Text style={styles.pageLabel}>ABOUT US</Text>
          <Text style={styles.title}>India's Trusted Marketplace</Text>
          <Text style={styles.introText}>
            Welcome to Caryanam, your trusted destination for buying, selling, and exchanging cars. We are committed to making the car buying and selling experience simple, transparent, and hassle-free.
          </Text>
          <Text style={styles.introText}>
            Whether you're looking for a new or pre-owned vehicle, vehicle inspection, finance assistance, or insurance support, Caryanam offers reliable services to meet your automotive needs.
          </Text>
        </View>

        {/* Core Values Section */}
        <View style={styles.valuesSection}>
          <Text style={styles.valuesLabel}>CORE VALUES</Text>
          <Text style={styles.valuesTitle}>What Drives Caryanam</Text>
          <Text style={styles.valuesSubtitle}>
            The principles that guide every decision we make at Caryanam.
          </Text>

          <View style={styles.valuesGrid}>
            {VALUES.map((val, idx) => {
              const Icon = val.icon as any;
              return (
                <View key={idx} style={styles.valueCard}>
                  <View style={[styles.iconSquare, { backgroundColor: val.color }]}>
                    <Icon size={22} color="#fff" />
                  </View>
                  <Text style={styles.valueCardTitle}>{val.title}</Text>
                  <Text style={styles.valueCardDesc}>{val.desc}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Call to Action Section */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Ready to Find Your Next Car?</Text>
          <Text style={styles.ctaDesc}>
            Browse thousands of verified listings from trusted dealerships across India. Direct connections, honest transactions.
          </Text>
          
          <TouchableOpacity 
            style={styles.primaryBtn}
            onPress={() => navigation.navigate("Cars")}
          >
            <Text style={styles.primaryBtnText}>Browse Cars</Text>
            <ArrowRight size={16} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryBtn}
            onPress={() => navigation.navigate("PremiumCars")}
          >
            <Text style={styles.secondaryBtnText}>Premium Collection</Text>
            <Star size={14} color="#d97706" fill="#d97706" />
          </TouchableOpacity>
        </View>

      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
  },
  introSection: {
    padding: 24,
    paddingTop: 40,
    alignItems: "center",
  },
  pageLabel: {
    fontSize: 14,
    fontWeight: "900",
    color: "#881337", // Rose 900
    letterSpacing: 2,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: "#881337", // Rose 900
    marginBottom: 16,
    textAlign: "center",
  },
  introText: {
    fontSize: 15,
    lineHeight: 24,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 16,
  },
  valuesSection: {
    backgroundColor: "#0f172a", // Slate 900
    padding: 24,
    paddingVertical: 40,
  },
  valuesLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: "#f43f5e",
    letterSpacing: 2,
    marginBottom: 8,
  },
  valuesTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#ffffff",
    marginBottom: 12,
  },
  valuesSubtitle: {
    fontSize: 14,
    color: "#94a3b8",
    marginBottom: 32,
  },
  valuesGrid: {
    gap: 16,
  },
  valueCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 20,
  },
  iconSquare: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  valueCardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 8,
  },
  valueCardDesc: {
    fontSize: 14,
    lineHeight: 22,
    color: "#94a3b8",
  },
  ctaSection: {
    padding: 24,
    paddingVertical: 40,
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  ctaTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0f172a",
    textAlign: "center",
    marginBottom: 12,
  },
  ctaDesc: {
    fontSize: 15,
    lineHeight: 24,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 24,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#881337", // Rose 900
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: "100%",
    marginBottom: 12,
    gap: 8,
  },
  primaryBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: "100%",
    gap: 8,
  },
  secondaryBtnText: {
    color: "#0f172a",
    fontSize: 15,
    fontWeight: "700",
  },
});
