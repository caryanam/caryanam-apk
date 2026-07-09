import React from "react";
import { View, Text, StyleSheet, ScrollView, Linking, TouchableOpacity } from "react-native";
import ScreenWrapper from "../../components/shared/ScreenWrapper";
import { ShieldAlert, FileX, RefreshCw, Mail } from "lucide-react-native";

const SECTIONS = [
  {
    icon: ShieldAlert,
    title: "All Payments Are Final",
    text: "All payments made to Caryanam are final and non-refundable.",
  },
  {
    icon: FileX,
    title: "Non-Refundable Services",
    text: "Once a payment has been successfully processed for any service, including vehicle booking, inspection, documentation, finance assistance, insurance assistance, or any other service, no refunds will be issued under any circumstances.",
  },
  {
    icon: RefreshCw,
    title: "Technical Errors & Duplicate Payments",
    text: "In the event of a duplicate payment or an incorrect deduction due to a technical error, the matter will be reviewed, and any eligible amount may be refunded at Caryanam's sole discretion.",
  },
  {
    icon: Mail,
    title: "Questions & Support",
    text: "If you have any questions regarding this policy, please contact our support team:",
    email: "support@caryanam.com",
  },
];

export default function RefundPolicy() {
  return (
    <ScreenWrapper layoutType="public" scrollEnabled={true}>
      <View style={styles.container}>
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Refund Policy</Text>
        </View>
        <Text style={styles.introText}>
          Please read our refund policy details below regarding payments made for any of our services.
        </Text>

        {SECTIONS.map((section, idx) => {
          const Icon = section.icon as any;
          return (
            <View key={idx} style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.iconSquare}>
                  <Icon size={20} color="#fff" />
                </View>
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>

              <Text style={styles.sectionText}>{section.text}</Text>

              {section.email && (
                <View style={styles.emailContainer}>
                  <TouchableOpacity
                    style={styles.emailButton}
                    onPress={() => Linking.openURL(`mailto:${section.email}`)}
                  >
                    <Mail size={16} color="#881337" style={{ marginRight: 6 }} />
                    <Text style={styles.emailText}>{section.email}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}
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
    marginBottom: 12,
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
  sectionText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#475569",
  },
  emailContainer: {
    marginTop: 16,
  },
  emailButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  emailText: {
    color: "#881337",
    fontSize: 14,
    fontWeight: "700",
  },
});
