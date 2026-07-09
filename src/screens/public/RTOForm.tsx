import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking, Image, ScrollView, Platform, Alert, ToastAndroid, PermissionsAndroid } from "react-native";
import ScreenWrapper from "../../components/shared/ScreenWrapper";
import { FileText, Download } from "lucide-react-native";
import ReactNativeBlobUtil from 'react-native-blob-util';

export default function RTOForm() {
  const handleDownload = async () => {
    const fileUrl = "https://caryanam.com/TTO_Set_29-30.pdf";

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
        
        ToastAndroid.show("Download started...", ToastAndroid.SHORT);
        
        const { dirs } = ReactNativeBlobUtil.fs;
        ReactNativeBlobUtil.config({
          fileCache: true,
          addAndroidDownloads: {
            useDownloadManager: true,
            notification: true,
            path: dirs.DownloadDir + '/TTO_Set_29-30.pdf',
            description: 'Downloading RTO Form',
            title: 'TTO_Set_29-30.pdf',
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
    <ScreenWrapper layoutType="public" title="RTO Form" showBackButton>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>RTO Forms & Documents</Text>
          <Text style={styles.introText}>
            Download the official RTO form (TTO Set 29-30) for vehicle registration and transfer procedures.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <FileText size={48} color="#e11d48" />
          </View>
          <Text style={styles.title}>TTO Set 29-30</Text>
          <Text style={styles.description}>
            Download the official RTO form for vehicle registration and transfer procedures. This document contains all the necessary paperwork to ensure a smooth transfer.
          </Text>
          
          <TouchableOpacity 
            style={styles.downloadButton}
            onPress={handleDownload}
            activeOpacity={0.8}
          >
            <Download size={20} color="#fff" />
            <Text style={styles.downloadButtonText}>Download Form</Text>
          </TouchableOpacity>
        </View>
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
