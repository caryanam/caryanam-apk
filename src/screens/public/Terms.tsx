import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import ScreenWrapper from "../../components/shared/ScreenWrapper";
import { FileText } from "lucide-react-native";

const TERMS = [
  "All information provided on the application must be accurate and complete.",
  "Caryanam reserves the right to modify, suspend, or discontinue any service without prior notice.",
  "Vehicle prices, availability, and specifications are subject to change without notice.",
  "Users are responsible for verifying all vehicle details before making any purchase or booking.",
  "Caryanam acts as a platform connecting buyers, sellers, and service providers and is not responsible for disputes between them.",
  "All payments made through the application are subject to our Refund Policy.",
  "Users must not misuse the application, upload false information, or engage in fraudulent activities.",
  "All application content, including logos, images, text, and trademarks, is the property of Caryanam and may not be copied without written permission.",
  "Caryanam shall not be liable for any direct or indirect loss arising from the use of this application or its services.",
  "These Terms & Conditions are governed by the laws of India, and any disputes shall be subject to the jurisdiction of the competent courts."
];

export default function Terms() {
  return (
    <ScreenWrapper layoutType="public" scrollEnabled={true}>
      <View style={styles.container}>
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Terms & Conditions</Text>
        </View>
        <Text style={styles.introText}>
          Welcome to Caryanam. By accessing or using our application, you agree to the following Terms & Conditions:
        </Text>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconSquare}>
              <FileText size={20} color="#fff" />
            </View>
            <Text style={styles.sectionTitle}>Platform Usage Agreement</Text>
          </View>

          <View style={styles.pointsContainer}>
            {TERMS.map((term, i) => (
              <View key={i} style={styles.pointRow}>
                <View style={styles.bullet} />
                <Text style={styles.pointText}>{term}</Text>
              </View>
            ))}
          </View>

          <View style={styles.footerNoteContainer}>
            <Text style={styles.footerNote}>
              By using this application, you acknowledge that you have read, understood, and agreed to these Terms & Conditions.
            </Text>
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: "#f8fafc",
  },
  pageHeader: {
    alignItems: "center",
    paddingVertical: 24,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#881337", // Rose 900
    textTransform: "uppercase",
    letterSpacing: 2,
    textAlign: "center",
  },
  introText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#64748b",
    marginBottom: 24,
  },
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingBottom: 16,
    marginBottom: 16,
  },
  iconSquare: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#e11d48", // Rose 600
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "800",
    color: "#0f172a",
  },
  pointsContainer: {
    marginTop: 4,
  },
  pointRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#f43f5e",
    marginTop: 8,
    marginRight: 12,
  },
  pointText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: "#475569",
  },
  footerNoteContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  footerNote: {
    fontSize: 13,
    lineHeight: 20,
    color: "#64748b",
    textAlign: "center",
    fontStyle: "italic",
    fontWeight: "600",
  },
});
