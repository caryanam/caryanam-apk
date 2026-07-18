import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import ScreenWrapper from "../../components/shared/ScreenWrapper";
import { FileText } from "lucide-react-native";

const TERMS_DATA = [
  {
    title: "1. Finance Facilitation",
    content: "Caryanam India Pvt. Ltd. acts solely as a technology platform and facilitator for vehicle finance services. Loan approval, rejection, interest rate, tenure, processing, and disbursement are decided exclusively by VahanFinserv and/or its partner Banks, NBFCs, or financial institutions. Caryanam India Pvt. Ltd. does not guarantee loan approval under any circumstances."
  },
  {
    title: "2. Collaboration Disclaimer",
    content: "Vehicle finance services available through Caryanam.com are provided in collaboration with our authorized finance partner, VahanFinserv. Caryanam India Pvt. Ltd. is not a Bank, NBFC, or RBI-regulated lending institution unless separately licensed under applicable law."
  },
  {
    title: "3. Customer Consent",
    content: "By submitting an enquiry, loan application, or any personal information through Caryanam.com, the customer expressly authorizes Caryanam India Pvt. Ltd. to collect, verify, process, and share KYC documents, PAN, Aadhaar, income proof, bank statements, vehicle details, contact information, and other necessary documents with VahanFinserv, its partner Banks, NBFCs, financial institutions, verification agencies, and service providers for the purpose of loan processing and verification."
  },
  {
    title: "4. Data Privacy",
    content: "Customer information shall be collected, stored, and processed in accordance with the Privacy Policy of Caryanam India Pvt. Ltd. Personal information will only be shared with authorized financial institutions, lending partners, and verification agencies as required for loan processing and compliance with applicable laws."
  },
  {
    title: "5. Document Verification",
    content: "The customer confirms that all documents and information submitted are true, complete, and genuine. Submission of forged, false, misleading, or fraudulent documents may result in immediate rejection of the application and may attract civil and/or criminal legal action."
  },
  {
    title: "6. Fees & Charges",
    content: "Any applicable processing fee, valuation fee, documentation charges, convenience fee, GST, or other statutory charges shall be clearly communicated before payment. Unless specifically stated otherwise, all fees paid are non-refundable."
  },
  {
    title: "7. No Loan Guarantee",
    content: "Submission of a finance application through Caryanam.com does not guarantee loan approval, loan amount, interest rate, tenure, or disbursement. The final decision shall remain solely with the respective Bank, NBFC, or lending institution."
  },
  {
    title: "8. Vehicle Verification",
    content: "Customers are solely responsible for verifying the ownership, Registration Certificate (RC), insurance validity, hypothecation status, outstanding loan status, accident history, service history, tax dues, and legal status of any vehicle before completing the purchase."
  },
  {
    title: "9. Third-Party Services",
    content: "Caryanam India Pvt. Ltd. shall not be responsible for any delay, rejection, cancellation, technical issues, service deficiency, or decision taken by VahanFinserv, Banks, NBFCs, RTO authorities, Insurance Companies, Credit Information Companies, Verification Agencies, or any other third-party service provider."
  },
  {
    title: "10. Limitation of Liability",
    content: "Caryanam India Pvt. Ltd. shall not be liable for any direct, indirect, incidental, consequential, financial, or business loss arising out of loan rejection, delayed disbursement, incorrect information provided by the customer, or decisions taken by lending partners or third-party service providers."
  },
  {
    title: "11. Cancellation & Refund",
    content: "Refunds shall be processed only in accordance with the applicable Refund & Cancellation Policy published on Caryanam.com. Processing fees, documentation charges, valuation charges, GST, and other statutory charges shall generally be non-refundable unless specifically mentioned otherwise."
  },
  {
    title: "12. Governing Law & Jurisdiction",
    content: "These Terms & Conditions shall be governed and interpreted in accordance with the laws of the Republic of India. Any dispute arising out of or relating to these Terms & Conditions shall be subject to the exclusive jurisdiction of the competent Courts located in Pune, Maharashtra, India."
  },
  {
    title: "13. Eligibility",
    content: "Only individuals who are 18 years of age or older and legally competent to enter into a binding contract under applicable laws of India are permitted to use the Website and its Services."
  },
  {
    title: "14. User Registration & Account",
    content: "Users are responsible for maintaining the confidentiality of their login credentials, passwords, OTPs, and account information. Users shall be solely responsible for all activities conducted through their accounts. Caryanam India Pvt. Ltd. reserves the right to suspend, restrict, or terminate any user account that violates these Terms & Conditions or applicable laws."
  },
  {
    title: "15. Lead Sharing & Communication Consent",
    content: "By submitting an enquiry, vehicle request, finance application, or any other information through Caryanam.com, the user expressly authorizes Caryanam India Pvt. Ltd., its authorized dealers, VahanFinserv, partner Banks, NBFCs, Insurance Companies, and other service providers to contact the user through Phone Calls, SMS, WhatsApp, Email, Push Notifications, or any other electronic communication channels for service updates, promotional offers, verification, and transaction-related communication."
  },
  {
    title: "16. Platform Role",
    content: "Caryanam India Pvt. Ltd. acts solely as a technology platform that connects buyers, sellers, dealers, financial institutions, insurers, and service providers. Caryanam is not a buyer, seller, dealer, lender, insurer, or agent in any transaction unless specifically stated."
  },
  {
    title: "17. Third-Party Content",
    content: "Vehicle details, prices, specifications, images, finance offers, insurance quotations, dealer information, and other content displayed on the Website may be provided by third parties. Caryanam India Pvt. Ltd. does not guarantee the accuracy, completeness, reliability, or availability of such information."
  },
  {
    title: "18. Prohibited Activities",
    content: "Users shall not:\n- Use data scraping, data mining, bots, crawlers, or automated tools to access the Website.\n- Copy, reproduce, distribute, or republish vehicle listings or website content without written permission.\n- Submit fake enquiries, misleading information, or fraudulent documents.\n- Attempt unauthorized access to the Website or its systems.\n- Use the Website for any illegal, unlawful, or fraudulent activity."
  },
  {
    title: "19. Dealer Obligations",
    content: "Dealers are responsible for uploading accurate, genuine, and legally compliant vehicle information. Fake listings, manipulated odometer readings, forged documents, misleading advertisements, or illegal vehicle sales are strictly prohibited. Caryanam reserves the right to remove listings and suspend dealer accounts without prior notice."
  },
  {
    title: "20. User Generated Content",
    content: "Users may post reviews, ratings, comments, photographs, and other content where permitted. By submitting such content, users grant Caryanam India Pvt. Ltd. a non-exclusive, royalty-free, worldwide license to use, display, reproduce, modify, publish, and promote such content for operating and marketing the platform. Caryanam reserves the right to edit or remove any content that violates these Terms."
  },
  {
    title: "21. Inspection Disclaimer",
    content: "Any inspection report, vehicle certification, valuation, verification, or assessment made available through Caryanam is provided solely for informational purposes based on available data and should not be considered a guarantee of the vehicle's present or future condition, quality, performance, or roadworthiness."
  },
  {
    title: "22. Force Majeure",
    content: "Caryanam India Pvt. Ltd. shall not be liable for any delay, interruption, suspension, or failure in providing services caused by events beyond its reasonable control, including but not limited to natural disasters, floods, earthquakes, pandemics, cyber-attacks, internet failures, power outages, government actions, labor disputes, or other force majeure events."
  },
  {
    title: "23. Indemnity",
    content: "Users agree to indemnify, defend, and hold harmless Caryanam India Pvt. Ltd., its directors, employees, affiliates, partners, and service providers from and against any claims, damages, liabilities, losses, penalties, legal proceedings, or expenses arising out of the user's misuse of the Website, violation of these Terms, or breach of applicable laws."
  },
  {
    title: "24. Modification of Terms",
    content: "Caryanam India Pvt. Ltd. reserves the right to modify, update, amend, or replace these Terms & Conditions at any time without prior notice. Continued use of the Website after such modifications shall constitute acceptance of the revised Terms."
  },
  {
    title: "25. Electronic Communication",
    content: "By using the Website, users consent to receive communications electronically through Email, SMS, WhatsApp, Mobile Notifications, or Website Notices. Such electronic communications shall satisfy any legal requirement that communications be made in writing."
  },
  {
    title: "26. Intellectual Property Rights",
    content: "All software, source code, APIs, databases, website design, graphics, logos, trademarks, service marks, content, text, photographs, videos, documents, and other intellectual property displayed on Caryanam.com are the exclusive property of Caryanam India Pvt. Ltd. and are protected under applicable intellectual property laws. Unauthorized copying, reproduction, modification, distribution, or commercial use is strictly prohibited."
  },
  {
    title: "27. Entire Agreement",
    content: "These Terms & Conditions, together with the Privacy Policy, Refund & Cancellation Policy, Disclaimer, Cookie Policy, AML/KYC Policy, and any other legal notices published on Caryanam.com, constitute the complete and entire agreement between Caryanam India Pvt. Ltd. and the User regarding the use of the Website and its Services."
  },
  {
    title: "28. Additional Provisions for Caryanam",
    content: "- AI-powered vehicle valuation is an estimated value only and does not guarantee the market value or selling price.\n- Vehicle finance services are facilitated through authorized partner VahanFinserv and partner Banks/NBFCs. Loan approval remains solely at their discretion.\n- Users consent to Digital Signature, e-KYC verification, Aadhaar authentication (where applicable), and electronic document processing.\n- RC verification, ownership verification, insurance verification, and RTO records are based on available official data and are subject to change.\n- Caryanam shall not be liable for payment gateway failures, banking delays, or third-party payment processing errors.\n- The buyer and seller are solely responsible for RC Transfer, vehicle delivery, ownership transfer, tax liabilities, and compliance with applicable motor vehicle laws.\n- Caryanam reserves the right to verify dealers, suspend suspicious accounts, investigate fraudulent activities, and cooperate with law enforcement authorities whenever required.\n- The Website operates in accordance with applicable Indian laws, including the Information Technology Act, 2000, the Digital Personal Data Protection Act, 2023 (where applicable), and other relevant laws and regulations."
  }
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
            {TERMS_DATA.map((section, i) => (
              <View key={i} style={styles.sectionItem}>
                <Text style={styles.sectionItemTitle}>{section.title}</Text>
                {section.content.split('\n').map((paragraph, idx) => (
                  <Text key={idx} style={styles.sectionItemText}>
                    {paragraph}
                  </Text>
                ))}
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
  sectionItem: {
    marginBottom: 20,
  },
  sectionItemTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 6,
  },
  sectionItemText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#475569",
    marginBottom: 4,
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
