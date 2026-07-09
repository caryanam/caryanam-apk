import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import ScreenWrapper from "../../components/shared/ScreenWrapper";
import { Shield, Eye, UserCheck, Scale, Users, Globe, Info, ShieldAlert, AlertTriangle, FolderOpen, Lock, RefreshCw, Key, Mail } from "lucide-react-native";

const SECTIONS = [
  {
    icon: Shield,
    title: "Information Collection and Use",
    text: "The Application collects information when you download and use it. This information may include information such as:",
    points: [
      "Your device's Internet Protocol (IP) address",
      "The pages of the Application that you visit, the time and date of your visit, the time spent on those pages",
      "The time spent on the Application",
      "The operating system you use"
    ]
  },
  {
    icon: Eye,
    title: "Cookies and Tracking Technologies",
    text: "The Application or its third-party SDKs may use cookies, SDKs, pixels, and similar technologies to support functionality, analytics, or service delivery. Where required by applicable law, the Service Provider will obtain consent before using non-essential tracking technologies."
  },
  {
    icon: UserCheck,
    title: "Your Rights",
    text: "You may request access to, correction of, or deletion of your personal data held by the Service Provider. To exercise these rights, or to withdraw consent where processing is based on consent, contact the Service Provider at support@caryanam.com."
  },
  {
    icon: Scale,
    title: "Your California Privacy Rights (CCPA/CPRA)",
    text: "If you are a California resident, you have the right to know what personal information is collected, the right to delete personal information, the right to opt out of the sale or sharing of personal information, and the right to non-discrimination for exercising these rights. To exercise your CCPA/CPRA rights, contact the Service Provider at support@caryanam.com.",
    extra: "The Service Provider may use the information you provide to send important information, required notices, and, where permitted by law, marketing communications. For a better experience while using the Application, the Service Provider may require you to provide certain personally identifiable information, including but not limited to support@caryanam.com. The information requested will be retained and used as described in this privacy policy."
  },
  {
    icon: Users,
    title: "Third Party Access",
    text: "Only aggregated, anonymized data is periodically transmitted to external services to aid the Service Provider in improving the Application and their service. The Service Provider may share your information with third parties in the ways that are described in this privacy statement."
  },
  {
    icon: Globe,
    title: "International Data Transfers",
    text: "The Service Provider or its third-party service providers may transfer personal data to countries outside your country of residence, including outside the European Economic Area (EEA). Where applicable law requires safeguards for international transfers, the Service Provider will use appropriate mechanisms such as standard contractual clauses (SCCs) approved by the European Commission, adequacy decisions, or other legally recognized transfer mechanisms. Data protection laws in other countries may differ from those in your jurisdiction."
  },
  {
    icon: Info,
    title: "Third-Party Services",
    text: "Please note that the Application utilizes third-party services that have their own Privacy Policy about handling data. (e.g. Google Play Services, Facebook)."
  },
  {
    icon: ShieldAlert,
    title: "Disclosure of Information",
    text: "The Service Provider may disclose User Provided and Automatically Collected Information:",
    points: [
      "As required by law, such as to comply with a subpoena, or similar legal process;",
      "When they believe in good faith that disclosure is necessary to protect their rights, protect your safety or the safety of others, investigate fraud, or respond to a government request;",
      "With their trusted service providers who work on their behalf, do not have an independent use of the information the Service Provider discloses to them, and have agreed to adhere to the rules set forth in this privacy statement."
    ]
  },
  {
    icon: AlertTriangle,
    title: "Opt-Out Rights",
    text: "You can stop further collection of information from your device by ceasing to use the application. Ceasing to use will stop the application from collecting data from your device, but it does not automatically delete information that has already been transmitted to the Service Provider or to third parties. To request deletion of your personal data, to withdraw consent, or to exercise any of your rights, contact the Service Provider at support@caryanam.com."
  },
  {
    icon: FolderOpen,
    title: "Data Retention Policy",
    text: "The Service Provider retains personal data based on its necessity for the stated purposes:",
    points: [
      "User Provided Data: Retained for the duration of your use of the Application plus 12 months thereafter, unless longer retention is required by law",
      "Automatically Collected Data: Retained for up to 24 months from collection, unless longer retention is required for legal compliance",
      "Aggregated and Anonymized Data: Retained indefinitely as it no longer identifies you",
      "Data required for legal compliance: Retained as long as required by applicable law"
    ],
    extra: "You may request deletion of your personal data, subject to any legal obligation to retain it. If you want the Service Provider to delete User Provided Data submitted through the Application, please contact them at support@caryanam.com. Please note that some User Provided Data may be required for the Application to function properly."
  },
  {
    icon: Users,
    title: "Children's Privacy Protection",
    text: "The Application is not intended for children under 16 years of age, or such higher age as required by applicable law. The Service Provider does not knowingly solicit data from children or market the Application to them. In the event the Service Provider discovers that a child has provided personal information, the Service Provider will immediately delete this from their servers. If you are a parent or guardian and you are aware that your child has provided the Service Provider with personal information, please contact the Service Provider (support@caryanam.com) so that they will be able to take the necessary actions."
  },
  {
    icon: Lock,
    title: "Data Security Safeguards",
    text: "The Service Provider is concerned about safeguarding the confidentiality of your information. The Service Provider provides physical, electronic, and procedural safeguards to protect information the Service Provider processes and maintains."
  },
  {
    icon: ShieldAlert,
    title: "Data Breach Notification",
    text: "If a data breach occurs that affects your personal data, the Service Provider will notify you in accordance with applicable legal requirements, including, where required, providing information about the nature of the breach and the steps being taken to address it."
  },
  {
    icon: RefreshCw,
    title: "Policy Changes & Revisions",
    text: "The Service Provider may update this Privacy Policy from time to time. The Service Provider will notify you of material changes by posting the updated Privacy Policy with an effective date. Where required by law, the Service Provider will seek your consent to material changes before they take effect. Previous versions of this Privacy Policy will be maintained and made available upon request by contacting the Service Provider at support@caryanam.com.",
    extra: "This privacy policy is effective as of 2026-07-02"
  },
  {
    icon: Key,
    title: "Your Consent & Affiliation",
    text: "Where processing is based on consent, you provide that consent by affirmatively opting in to the relevant feature or action. You may withdraw consent at any time without affecting processing carried out before withdrawal. Processing based on other lawful bases is carried out as described above."
  },
  {
    icon: Mail,
    title: "Contact Information",
    text: "If you have any questions regarding privacy while using the Application, or have questions about the practices, please contact the Service Provider via email at support@caryanam.com."
  }
];

export default function PrivacyPolicy() {
  return (
    <ScreenWrapper layoutType="public" scrollEnabled={true}>
      <View style={styles.container}>
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Privacy Policy</Text>
        </View>
        <Text style={styles.introText}>
          This privacy policy applies to the Caryanam mobile app and related services operated by Caryanamindia pvt ltd (collectively, the "Application"). Caryanamindia pvt ltd is hereby referred to as the "Service Provider".
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

              {section.text && <Text style={styles.sectionText}>{section.text}</Text>}

              {section.points && (
                <View style={styles.pointsContainer}>
                  {section.points.map((point, i) => (
                    <View key={i} style={styles.pointRow}>
                      <View style={styles.bullet} />
                      <Text style={styles.pointText}>{point}</Text>
                    </View>
                  ))}
                </View>
              )}

              {section.extra && (
                <View style={styles.extraContainer}>
                  <Text style={styles.extraText}>{section.extra}</Text>
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
    marginBottom: 12,
  },
  pointsContainer: {
    marginTop: 4,
  },
  pointRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#f43f5e",
    marginTop: 8,
    marginRight: 8,
  },
  pointText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: "#475569",
  },
  extraContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  extraText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#475569",
  },
});
