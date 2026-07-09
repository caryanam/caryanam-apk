import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking, ScrollView, Platform, Alert, ToastAndroid, PermissionsAndroid } from "react-native";
import ScreenWrapper from "../../components/shared/ScreenWrapper";
import { FileText, Download } from "lucide-react-native";
import ReactNativeBlobUtil from 'react-native-blob-util';

const DOCUMENTS = [
  {
    id: "tto",
    title: "TTO Set 29-30",
    description: "Official RTO form for vehicle registration and transfer procedures. Contains all necessary paperwork for ownership transfer.",
    file: "TTO_Set_29-30.pdf"
  },
  {
    id: "purchase",
    title: "Professional Vehicle Purchase Form",
    description: "Comprehensive purchase agreement form outlining the terms, conditions, and details of the vehicle sale.",
    file: "Professional_Vehicle_Purchase_Form_A4.pdf"
  },
  {
    id: "delivery",
    title: "Car Delivery Note",
    description: "Official delivery note to acknowledge the handover of the vehicle, keys, and documents to the new owner.",
    file: "Car-Delivery-Note.pdf"
  }
];

export default function RTOForm() {
  const handleDownload = async (fileName: string) => {
    const fileUrl = `https://caryanam.com/${fileName}`;

    if (Platform.OS === 'android') {
      try {
        if (Platform.Version < 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            Alert.alert("Permission Denied", "Storage permission is required to download the file.");
            return;
          }
        }
        
        ToastAndroid.show(`Downloading ${fileName}...`, ToastAndroid.SHORT);
        
        const { dirs } = ReactNativeBlobUtil.fs;
        ReactNativeBlobUtil.config({
          fileCache: true,
          addAndroidDownloads: {
            useDownloadManager: true,
            notification: true,
            path: dirs.DownloadDir + `/${fileName}`,
            description: `Downloading ${fileName}`,
            title: fileName,
            mime: 'application/pdf',
            mediaScannable: true,
          }
        })
        .fetch('GET', fileUrl)
        .then((res) => {
          ToastAndroid.show("Download completed successfully!", ToastAndroid.SHORT);
        })
        .catch((err) => {
          Alert.alert("Download Failed", err.message);
        });
      } catch (err) {
        console.warn(err);
      }
    } else {
      // Fallback for iOS
      Linking.openURL(fileUrl);
    }
  };

  return (
    <ScreenWrapper layoutType="public" title="RTO Forms" showBackButton>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>RTO Forms & Documents</Text>
          <Text style={styles.introText}>
            Download official RTO forms, purchase agreements, and delivery notes for vehicle registration and sales procedures.
          </Text>
        </View>

        {DOCUMENTS.map((doc) => (
          <View key={doc.id} style={styles.card}>
            <View style={styles.iconContainer}>
              <FileText size={48} color="#e11d48" />
            </View>
            <Text style={styles.title}>{doc.title}</Text>
            <Text style={styles.description}>{doc.description}</Text>
            
            <TouchableOpacity 
              style={styles.downloadButton}
              onPress={() => handleDownload(doc.file)}
              activeOpacity={0.8}
            >
              <Download size={20} color="#fff" />
              <Text style={styles.downloadButtonText}>Download Form</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
    marginBottom: 8,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    marginBottom: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fff1f2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 15,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e11d48",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    width: "100%",
  },
  downloadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  }
});
