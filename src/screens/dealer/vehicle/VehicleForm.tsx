import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Switch,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../../navigation/AppNavigator";
import { Camera, X, UploadCloud, ArrowLeft, Loader2, Search, Download } from "lucide-react-native";
import { launchImageLibrary } from "react-native-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ReactNativeBlobUtil from "react-native-blob-util";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import { useDealerAuth } from "../../../contexts/DealerAuthContext";
import { useGetVehicleDetails } from "../../../hooks/dealer/useGetVehicleDetails";
import { useAddVehicle } from "../../../hooks/dealer/useAddVehicle";
import { useUpdateVehicle } from "../../../hooks/dealer/useUpdateVehicle";
import { CAR_BRANDS, getModels, getVariants } from "../../../data/carDatabase";
import SearchableSelect from "../../../components/shared/SearchableSelect";
import { useAreas } from "../../../hooks/public/useAreas";

const FUELS = ["PETROL", "DIESEL", "CNG", "LPG", "ELECTRIC", "HYBRID"];
const VEHICLE_TYPES = ["NON_PREMIUM", "PREMIUM"];
const OWNERSHIPS = ["1", "2", "3", "4"];

const PHOTO_SLOTS = [
  "Front View",
  "Rear View",
  "Left Side View",
  "Right Side View",
  "Engine Bay",
  "Dashboard / Interior",
  "Front Seats",
  "Rear Seats",
  "Boot / Trunk",
  "Odometer / Console",
];

export default function DealerVehicleForm() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, "DealerVehicleForm">>();
  const vehicleId = route.params?.vehicleId;
  const isEditing = !!vehicleId;

  const { user } = useDealerAuth();
  const dealerId = user?.id || "";

  const { data: vehicleDetails, isLoading: loadingDetails } = useGetVehicleDetails(vehicleId);
  const addMutation = useAddVehicle(dealerId);
  const updateMutation = useUpdateVehicle(dealerId);
  const { data: areas = [] } = useAreas();

  // Form State
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [variant, setVariant] = useState("");
  const [city, setCity] = useState("");
  const [registrationYear, setRegistrationYear] = useState(new Date().getFullYear().toString());
  const [kilometerDriven, setKilometerDriven] = useState("");
  const [askingPrice, setAskingPrice] = useState("");
  const [fuelType, setFuelType] = useState("PETROL");
  const [ownershipDetails, setOwnershipDetails] = useState("1");
  const [vehicleType, setVehicleType] = useState("NON_PREMIUM");
  const [vehicleDescription, setVehicleDescription] = useState("");
  const [financeAvailability, setFinanceAvailability] = useState(true);

  // Images State
  // Array of 10 slots. Each slot is either an existing image URL (string) or a new File object
  const [slotImages, setSlotImages] = useState<any[]>(Array(10).fill(null));
  const [extraSlotsCount, setExtraSlotsCount] = useState(0);
  const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);

  const [videos, setVideos] = useState<any[]>([]);
  const [deletedVideoIds, setDeletedVideoIds] = useState<number[]>([]);

  // RC & Challan State
  const [regNo, setRegNo] = useState("");
  const [isFetchingRc, setIsFetchingRc] = useState(false);
  const [rcData, setRcData] = useState<any>(null);
  const [isRcModalOpen, setIsRcModalOpen] = useState(false);

  const [isFetchingChallan, setIsFetchingChallan] = useState(false);
  const [challanData, setChallanData] = useState<any>(null);
  const [isChallanModalOpen, setIsChallanModalOpen] = useState(false);

  // Load existing data
  useEffect(() => {
    if (isEditing && vehicleDetails) {
      setBrand(vehicleDetails.brand || "");
      setModel(vehicleDetails.model || "");
      setVariant(vehicleDetails.variant || "");
      setCity(vehicleDetails.city || "");
      setRegistrationYear(vehicleDetails.registrationYear?.toString() || "");
      setKilometerDriven(vehicleDetails.kilometerDriven?.toString() || "");
      setAskingPrice(vehicleDetails.askingPrice?.toString() || "");
      setFuelType((vehicleDetails.fuelType || "PETROL").toUpperCase());
      setOwnershipDetails(vehicleDetails.ownershipDetails?.toString() || "1");
      setVehicleType(vehicleDetails.vehicleType || "NON_PREMIUM");
      setVehicleDescription(vehicleDetails.vehicleDescription || "");
      setFinanceAvailability(vehicleDetails.financeAvailability ?? true);

      if (vehicleDetails.images) {
        const extraCount = Math.max(0, vehicleDetails.images.length - 10);
        setExtraSlotsCount(extraCount);
        
        const newSlots = Array(10 + extraCount).fill(null);
        vehicleDetails.images.forEach((img: any, i: number) => {
          newSlots[i] = { id: img.id, uri: img.url, isExisting: true };
        });
        setSlotImages(newSlots);
      }

      if (vehicleDetails.videos) {
        setVideos(
          vehicleDetails.videos.map((vid: any) => ({
            id: vid.id,
            uri: vid.url,
            isExisting: true,
            fileName: "video.mp4",
          }))
        );
      }
    }
  }, [vehicleDetails]);

  const models = brand ? getModels(brand) : [];
  const variants = brand && model ? getVariants(brand, model) : [];

  const handleFetchRc = async () => {
    if (!regNo) {
      Alert.alert("Error", "Please enter a vehicle number.");
      return;
    }
    setIsFetchingRc(true);
    try {
      const token = await AsyncStorage.getItem("dealerToken");
      const res = await fetch("https://c1.caryanam.com/srv2/validation/rc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          api_id: "APID2629",
          api_key: "8cbaecfa-70cc-480d-9e21-0c9b11c81cb2",
          token_id: "K2I4y1qrQVtUme7OKFpIKVYfQfvFZFHm",
          reg_no: regNo,
        }),
      });

      if (!res.ok) throw new Error("Failed to fetch RC details.");

      const data = await res.json();
      const resultData = data.data || data;

      if (resultData) {
        setRcData(resultData);
        if (resultData.vehicle_manufacturer_name) handleBrandChange(resultData.vehicle_manufacturer_name);
        if (resultData.model) handleModelChange(resultData.model);
        if (resultData.type) {
          const typeUpper = resultData.type.toUpperCase();
          if (FUELS.includes(typeUpper)) setFuelType(typeUpper);
          else {
             if (typeUpper.includes('PETROL')) setFuelType('PETROL');
             else if (typeUpper.includes('DIESEL')) setFuelType('DIESEL');
             else if (typeUpper.includes('CNG')) setFuelType('CNG');
             else if (typeUpper.includes('LPG')) setFuelType('LPG');
             else if (typeUpper.includes('ELECTRIC')) setFuelType('ELECTRIC');
             else if (typeUpper.includes('HYBRID')) setFuelType('HYBRID');
          }
        }
        if (resultData.reg_date) {
           const parts = resultData.reg_date.split('-');
           if (parts.length === 3) setRegistrationYear(parts[2].length === 4 ? parts[2] : parts[0]);
           else {
             const parts2 = resultData.reg_date.split('/');
             if (parts2.length === 3) setRegistrationYear(parts2[2].length === 4 ? parts2[2] : parts2[0]);
           }
        }
        Alert.alert("Success", "RC details fetched successfully!");
      } else {
        Alert.alert("Error", "No data found for this vehicle number.");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Something went wrong while fetching RC details.");
    } finally {
      setIsFetchingRc(false);
    }
  };

  const handleCheckChallan = async () => {
    if (!regNo) {
      Alert.alert("Error", "Please enter a vehicle number.");
      return;
    }
    setIsFetchingChallan(true);
    try {
      const token = await AsyncStorage.getItem("dealerToken");
      const res = await fetch("https://c1.caryanam.com/srv2/basic-e-challan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          api_id: "APID2629",
          api_key: "8cbaecfa-70cc-480d-9e21-0c9b11c81cb2",
          token_id: "K2I4y1qrQVtUme7OKFpIKVYfQfvFZFHm",
          vehicle_num: regNo,
        }),
      });

      if (!res.ok) throw new Error("Failed to fetch Challan details.");

      const rawData = await res.json();
      let dataObj = rawData;
      if (Array.isArray(rawData)) dataObj = rawData[0];
      const resultData = dataObj?.data || dataObj;

      if (resultData && resultData.results) {
        setChallanData(resultData);
        setIsChallanModalOpen(true);
      } else {
        Alert.alert("Error", "No challan data found for this vehicle number.");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Something went wrong while fetching Challan details.");
    } finally {
      setIsFetchingChallan(false);
    }
  };

  const downloadRcPDF = async () => {
    if (!rcData) return;
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("RC Verification Report", 14, 20);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
      doc.text(`Vehicle Number: ${regNo}`, 14, 34);

      const tableData: any[][] = [];
      Object.entries(rcData).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          Object.entries(value).forEach(([k, v]) => {
            tableData.push([`${key} - ${k}`.replace(/_/g, ' '), String(v || 'N/A')]);
          });
        } else {
          tableData.push([key.replace(/_/g, ' '), String(value || 'N/A')]);
        }
      });

      autoTable(doc, {
        startY: 40,
        head: [['Field', 'Value']],
        body: tableData,
        theme: 'striped',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [76, 5, 25] },
      });

      const pdfBase64 = doc.output('datauristring').split(',')[1];
      const dir = Platform.OS === 'ios' ? ReactNativeBlobUtil.fs.dirs.DocumentDir : ReactNativeBlobUtil.fs.dirs.DownloadDir;
      const path = `${dir}/RC_Report_${regNo}_${Date.now()}.pdf`;

      await ReactNativeBlobUtil.fs.writeFile(path, pdfBase64, 'base64');
      
      if (Platform.OS === 'android') {
        ReactNativeBlobUtil.android.actionViewIntent(path, 'application/pdf');
      } else {
        ReactNativeBlobUtil.ios.previewDocument(path);
      }
    } catch (err) {
      console.log('PDF Error:', err);
      Alert.alert('Error', 'Failed to generate PDF');
    }
  };

  const downloadChallanPDF = async () => {
    if (!challanData || !challanData.results) return;
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("E-Challan Verification Report", 14, 20);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
      doc.text(`Vehicle Number: ${regNo}`, 14, 34);
      doc.text(`Total Challans: ${challanData.totalChallan || 0}`, 14, 40);

      const tableData: any[][] = [];
      challanData.results.forEach((challan: any) => {
        tableData.push([
          challan.challanNo,
          challan.amount ? `Rs ${challan.amount}` : 'N/A',
          String(challan.status || 'N/A').toUpperCase(),
          challan.dateTime || 'N/A',
          challan.offences?.[0]?.offenceName || 'N/A'
        ]);
      });

      autoTable(doc, {
        startY: 46,
        head: [['Challan No', 'Amount', 'Status', 'Date', 'Offence']],
        body: tableData,
        theme: 'striped',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [76, 5, 25] },
      });

      const pdfBase64 = doc.output('datauristring').split(',')[1];
      const dir = Platform.OS === 'ios' ? ReactNativeBlobUtil.fs.dirs.DocumentDir : ReactNativeBlobUtil.fs.dirs.DownloadDir;
      const path = `${dir}/Challan_Report_${regNo}_${Date.now()}.pdf`;

      await ReactNativeBlobUtil.fs.writeFile(path, pdfBase64, 'base64');
      
      if (Platform.OS === 'android') {
        ReactNativeBlobUtil.android.actionViewIntent(path, 'application/pdf');
      } else {
        ReactNativeBlobUtil.ios.previewDocument(path);
      }
    } catch (err) {
      console.log('PDF Error:', err);
      Alert.alert('Error', 'Failed to generate PDF');
    }
  };

  const handleImagePick = async (index: number) => {
    try {
      const result = await launchImageLibrary({
        mediaType: "photo",
        quality: 0.8,
      });

      if (result.didCancel || !result.assets || result.assets.length === 0) return;

      const asset = result.assets[0];
      const newSlots = [...slotImages];
      
      // If replacing an existing image, add its ID to deletedImageIds
      const current = newSlots[index];
      if (current && current.isExisting && current.id) {
        setDeletedImageIds(prev => [...prev, current.id]);
      }

      newSlots[index] = {
        uri: asset.uri,
        type: asset.type,
        fileName: asset.fileName,
        isExisting: false,
      };
      setSlotImages(newSlots);
    } catch (err) {
      console.log("Image picker error:", err);
      Alert.alert("Error", "Could not pick image");
    }
  };

  const handleRemoveImage = (index: number) => {
    const newSlots = [...slotImages];
    const current = newSlots[index];
    if (current && current.isExisting && current.id) {
      setDeletedImageIds(prev => [...prev, current.id]);
    }
    
    if (index >= 10) {
      newSlots.splice(index, 1);
      setExtraSlotsCount(c => c - 1);
    } else {
      newSlots[index] = null;
    }
    setSlotImages(newSlots);
  };

  const addExtraSlot = () => {
    setExtraSlotsCount(c => c + 1);
    setSlotImages(prev => [...prev, null]);
  };

  const handleVideoPick = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: "video",
      });

      if (result.didCancel || !result.assets || result.assets.length === 0) return;

      const newVideos = result.assets.map(asset => ({
        uri: asset.uri,
        type: asset.type,
        fileName: asset.fileName || "video.mp4",
        isExisting: false,
      }));
      setVideos(prev => [...prev, ...newVideos]);
    } catch (err) {
      console.log("Video picker error:", err);
      Alert.alert("Error", "Could not pick video");
    }
  };

  const handleRemoveVideo = (index: number) => {
    const newVideos = [...videos];
    const current = newVideos[index];
    if (current && current.isExisting && current.id) {
      setDeletedVideoIds(prev => [...prev, current.id]);
    }
    newVideos.splice(index, 1);
    setVideos(newVideos);
  };

  const handleBrandChange = (val: string) => {
    setBrand(val);
    setModel("");
    setVariant("");
  };

  const handleModelChange = (val: string) => {
    setModel(val);
    setVariant("");
  };

  const handleSave = () => {
    if (!brand || !model || !variant || !city || !registrationYear || !kilometerDriven || !askingPrice || !vehicleDescription) {
      Alert.alert("Validation Error", "Please fill out all required fields (Brand, Model, Variant, City, Year, KM, Price, Description)");
      return;
    }

    const payload = {
      brand,
      model,
      variant,
      city,
      registrationYear: parseInt(registrationYear, 10),
      kilometerDriven: parseInt(kilometerDriven, 10),
      askingPrice: parseInt(askingPrice, 10),
      fuelType,
      ownershipDetails: parseInt(ownershipDetails, 10),
      vehicleType,
      vehicleDescription,
      financeAvailability,
    };

    const validImages = slotImages.filter(img => img !== null);

    if (!isEditing) {
      if (validImages.length < 10) {
        Alert.alert("Validation Error", "Please provide all 10 required vehicle photos.");
        return;
      }
      if (videos.length < 1) {
        Alert.alert("Validation Error", "Please provide at least 1 walkaround video.");
        return;
      }
    }

    if (isEditing && vehicleId) {
      updateMutation.mutate(
        { vehicleId, vehicleData: payload },
        {
          onSuccess: () => navigation.goBack(),
        }
      );
    } else {
      addMutation.mutate(
        { vehicleData: payload, images: validImages, videos },
        {
          onSuccess: () => navigation.goBack(),
        }
      );
    }
  };

  if (loadingDetails) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#e11d48" />
      </View>
    );
  }

  const isSaving = addMutation.isPending || updateMutation.isPending;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? "Edit Vehicle" : "Add Vehicle"}</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          
          {!isEditing && (
            <>
              {/* Quick Vehicle Verification */}
              <View style={styles.verificationContainer}>
                <View style={styles.verificationHeader}>
                  <Search size={16} color="#e11d48" />
                  <Text style={styles.verificationTitle}>Quick Vehicle Verification</Text>
                </View>
                <Text style={styles.verificationSubtitle}>Enter vehicle number to automatically fetch details and check pending challans.</Text>
                
                <View style={styles.verificationBody}>
                  <Text style={styles.verificationLabel}>REGISTRATION NUMBER</Text>
                  <Input
                    label=""
                    placeholder="e.g. MH15DC6628"
                    value={regNo}
                    onChangeText={(text) => setRegNo(text.toUpperCase())}
                    autoCapitalize="characters"
                    style={styles.verificationInput}
                  />
                  
                  <View style={styles.verificationActionRow}>
                    <TouchableOpacity style={styles.verificationBtn} onPress={handleFetchRc} disabled={isFetchingRc || !regNo}>
                      {isFetchingRc ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.verificationBtnText}>Check RC</Text>}
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.challanBtn} onPress={handleCheckChallan} disabled={isFetchingChallan || !regNo}>
                      {isFetchingChallan ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.challanBtnText}>Check Challan</Text>}
                    </TouchableOpacity>
                  </View>
                  {rcData && (
                    <TouchableOpacity style={styles.rcDetailsBtn} onPress={() => setIsRcModalOpen(true)}>
                      <Text style={styles.rcDetailsBtnText}>RC Details</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Images Section */}
              <Text style={styles.sectionTitle}>Photos ({slotImages.filter(Boolean).length}/10+)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
                {slotImages.map((img, idx) => {
                  const isRequired = idx < 10;
                  const slotName = isRequired ? PHOTO_SLOTS[idx] : `Extra Photo ${idx - 9}`;
                  return (
                    <View key={idx} style={styles.imageSlotContainer}>
                      <TouchableOpacity
                        style={styles.imageSlot}
                        onPress={() => handleImagePick(idx)}
                        activeOpacity={0.8}
                      >
                        {img ? (
                          <>
                            <Image source={{ uri: img.uri }} style={styles.slotImage} />
                            <TouchableOpacity
                              style={styles.removeImgBtn}
                              onPress={() => handleRemoveImage(idx)}
                            >
                              <X size={14} color="#fff" />
                            </TouchableOpacity>
                          </>
                        ) : (
                          <View style={styles.emptySlot}>
                            <Camera size={24} color="#94a3b8" />
                            <Text style={styles.slotText}>{slotName}</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    </View>
                  );
                })}
                
                {/* Add Extra Photo Slot Button */}
                <View style={styles.imageSlotContainer}>
                  <TouchableOpacity
                    style={styles.imageSlot}
                    onPress={addExtraSlot}
                    activeOpacity={0.8}
                  >
                    <View style={styles.emptySlot}>
                      <Text style={{ fontSize: 32, color: "#94a3b8", marginBottom: 4 }}>+</Text>
                      <Text style={styles.slotText}>Add Extra Photo</Text>
                      <Text style={[styles.slotText, { fontSize: 8, marginTop: 2 }]}>Slot {11 + extraSlotsCount}</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </ScrollView>

              {/* Videos Section */}
              <Text style={styles.sectionTitle}>Videos ({videos.length}/1+)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
                {videos.map((vid, idx) => (
                  <View key={idx} style={styles.imageSlotContainer}>
                    <View style={styles.imageSlot}>
                      <View style={[styles.emptySlot, { backgroundColor: '#f1f5f9' }]}>
                        <Text style={styles.slotText}>{vid.fileName || `Video ${idx + 1}`}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.removeImgBtn}
                        onPress={() => handleRemoveVideo(idx)}
                      >
                        <X size={14} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
                <View style={styles.imageSlotContainer}>
                  <TouchableOpacity
                    style={styles.imageSlot}
                    onPress={handleVideoPick}
                    activeOpacity={0.8}
                  >
                    <View style={styles.emptySlot}>
                      <UploadCloud size={24} color="#94a3b8" />
                      <Text style={styles.slotText}>Add Video</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </>
          )}

          {/* Basic Info */}
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          {/* Brand */}
          <Text style={styles.label}>Brand <Text style={styles.required}>*</Text></Text>
          <SearchableSelect
            value={brand}
            onValueChange={handleBrandChange}
            options={CAR_BRANDS}
            placeholder="Select or Type Brand"
            allowCustom={true}
          />

          {/* Model */}
          <Text style={styles.label}>Model <Text style={styles.required}>*</Text></Text>
          <SearchableSelect
            value={model}
            onValueChange={handleModelChange}
            options={models}
            placeholder="Select or Type Model"
            allowCustom={true}
          />

          {/* Variant */}
          <Text style={styles.label}>Variant <Text style={styles.required}>*</Text></Text>
          <SearchableSelect
            value={variant}
            onValueChange={setVariant}
            options={variants}
            placeholder="Select or Type Variant"
            allowCustom={true}
          />

          {/* City */}
          <Text style={styles.label}>City <Text style={styles.required}>*</Text></Text>
          <SearchableSelect
            value={city}
            onValueChange={setCity}
            options={areas}
            placeholder="Select or Type City"
            allowCustom={true}
          />

          <Input
            label="Registration Year *"
            value={registrationYear}
            onChangeText={setRegistrationYear}
            keyboardType="number-pad"
            maxLength={4}
            style={styles.inputMargin}
          />

          {/* Pricing & Condition */}
          <Text style={styles.sectionTitle}>Pricing & Condition</Text>

          <Input
            label="Asking Price (₹) *"
            value={askingPrice}
            onChangeText={setAskingPrice}
            keyboardType="number-pad"
            placeholder="e.g. 500000"
            style={styles.inputMargin}
          />

          <Input
            label="Kilometers Driven *"
            value={kilometerDriven}
            onChangeText={setKilometerDriven}
            keyboardType="number-pad"
            placeholder="e.g. 45000"
            style={styles.inputMargin}
          />

          <Select
            label="Fuel Type"
            value={fuelType}
            onValueChange={setFuelType}
            options={FUELS}
            style={styles.inputMargin}
          />

          <Select
            label="Ownership"
            value={ownershipDetails}
            onValueChange={setOwnershipDetails}
            options={OWNERSHIPS.map(o => ({ label: `${o} Owner`, value: o }))}
            style={styles.inputMargin}
          />

          <Select
            label="Vehicle Type"
            value={vehicleType}
            onValueChange={setVehicleType}
            options={[
              { label: "NON_PREMIUM", value: "NON_PREMIUM" },
              { label: "PREMIUM", value: "PREMIUM" },
            ]}
            style={styles.inputMargin}
          />

          {/* Description & Finance */}
          <Text style={styles.sectionTitle}>Additional Details</Text>

          <Text style={styles.label}>Vehicle Description <Text style={styles.required}>*</Text></Text>
          <Input
            label="Vehicle Description"
            value={vehicleDescription}
            onChangeText={setVehicleDescription}
            placeholder="Write details about the car's condition, features, etc."
            multiline
            numberOfLines={4}
            style={styles.inputMargin}
            inputStyle={{ height: 100, textAlignVertical: "top" }}
          />

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Finance Available</Text>
            <Switch
              value={financeAvailability}
              onValueChange={setFinanceAvailability}
              trackColor={{ false: "#cbd5e1", true: "#e11d48" }}
              thumbColor="#fff"
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveBtnText}>{isEditing ? "Update Vehicle" : "Add Vehicle"}</Text>
            )}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* RC Details Modal */}
      <Modal visible={isRcModalOpen} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>RC Details</Text>
              <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                <TouchableOpacity onPress={downloadRcPDF} style={styles.downloadPdfBtn}>
                  <Download size={14} color="#0f172a" />
                  <Text style={styles.downloadPdfText}>Download</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsRcModalOpen(false)}>
                  <X size={24} color="#0f172a" />
                </TouchableOpacity>
              </View>
            </View>
            <ScrollView style={styles.modalBody}>
              {rcData && Object.entries(rcData).map(([key, value], idx) => {
                if (typeof value === 'object' && value !== null) {
                  return (
                    <View key={idx} style={{ marginBottom: 12 }}>
                      <Text style={styles.modalSubTitle}>{String(key).replace(/_/g, ' ').toUpperCase()}</Text>
                      {Object.entries(value).map(([k, v], i) => (
                        <View key={i} style={styles.modalDetailRow}>
                          <Text style={styles.modalDetailLabel}>{String(k).replace(/_/g, ' ')}</Text>
                          <Text style={styles.modalDetailValue}>{typeof v === 'object' ? JSON.stringify(v) : String(v || 'N/A')}</Text>
                        </View>
                      ))}
                    </View>
                  );
                }
                return (
                  <View key={idx} style={styles.modalDetailRow}>
                    <Text style={styles.modalDetailLabel}>{String(key).replace(/_/g, ' ')}</Text>
                    <Text style={styles.modalDetailValue}>{String(value || 'N/A')}</Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Challan Details Modal */}
      <Modal visible={isChallanModalOpen} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>E-Challan Details ({challanData?.totalChallan || 0})</Text>
              <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                <TouchableOpacity onPress={downloadChallanPDF} style={styles.downloadPdfBtn}>
                  <Download size={14} color="#0f172a" />
                  <Text style={styles.downloadPdfText}>Download</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsChallanModalOpen(false)}>
                  <X size={24} color="#0f172a" />
                </TouchableOpacity>
              </View>
            </View>
            <ScrollView style={styles.modalBody}>
              {challanData?.results?.map((challan: any, idx: number) => (
                <View key={idx} style={styles.challanCard}>
                  <View style={styles.challanCardHeader}>
                    <Text style={styles.challanNo}>Challan: {challan.challanNo}</Text>
                    <View style={[styles.challanStatusBadge, challan.status?.toLowerCase() === 'pending' ? styles.statusPending : styles.statusPaid]}>
                      <Text style={[styles.challanStatusText, challan.status?.toLowerCase() === 'pending' ? styles.statusTextPending : styles.statusTextPaid]}>
                        {String(challan.status).toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.challanDetailText}><Text style={{fontWeight: 'bold'}}>Amount:</Text> ₹{challan.amount}</Text>
                  <Text style={styles.challanDetailText}><Text style={{fontWeight: 'bold'}}>Date:</Text> {challan.dateTime}</Text>
                  <Text style={styles.challanDetailText}><Text style={{fontWeight: 'bold'}}>Area:</Text> {challan.areaName || 'N/A'}</Text>
                  <Text style={styles.challanDetailText}><Text style={{fontWeight: 'bold'}}>Offence:</Text> {challan.offences?.[0]?.offenceName || 'N/A'}</Text>
                </View>
              ))}
              {(!challanData?.results || challanData.results.length === 0) && (
                <Text style={{ textAlign: 'center', marginVertical: 20, color: '#64748b' }}>No challans found.</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
    marginTop: 24,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
  },
  required: {
    color: "#e11d48",
  },
  inputMargin: {
    marginBottom: 16,
  },
  imageScroll: {
    flexDirection: "row",
    marginBottom: 8,
  },
  imageSlotContainer: {
    marginRight: 12,
  },
  imageSlot: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderStyle: "dashed",
    overflow: "hidden",
  },
  emptySlot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  slotText: {
    fontSize: 10,
    color: "#64748b",
    marginTop: 8,
    textAlign: "center",
    fontWeight: "600",
  },
  slotImage: {
    width: "100%",
    height: "100%",
  },
  removeImgBtn: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.6)",
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 24,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1e293b",
  },
  saveBtn: {
    backgroundColor: "#e11d48",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#e11d48",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  verificationContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 20,
    overflow: "hidden",
  },
  verificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  verificationTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
    marginLeft: 8,
  },
  verificationSubtitle: {
    fontSize: 12,
    color: "#64748b",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  verificationBody: {
    padding: 16,
  },
  verificationLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748b",
    marginBottom: 6,
  },
  verificationInput: {
    marginBottom: 12,
  },
  verificationActionRow: {
    flexDirection: "row",
    gap: 8,
  },
  verificationBtn: {
    flex: 1,
    backgroundColor: "#0f172a",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  verificationBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  challanBtn: {
    flex: 1,
    backgroundColor: "#f97316",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  challanBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  rcDetailsBtn: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    alignItems: "center",
  },
  rcDetailsBtnText: {
    color: "#334155",
    fontWeight: "600",
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "80%",
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  modalBody: {
    marginBottom: 20,
  },
  modalSubTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 8,
  },
  modalDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  modalDetailLabel: {
    fontSize: 12,
    color: "#64748b",
    textTransform: "capitalize",
    flex: 1,
  },
  modalDetailValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1e293b",
    flex: 1,
    textAlign: "right",
  },
  challanCard: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  challanCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 8,
  },
  challanNo: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  challanStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPending: { backgroundColor: "#ffedd5" },
  statusPaid: { backgroundColor: "#dcfce7" },
  statusTextPending: { color: "#c2410c", fontSize: 10, fontWeight: "700" },
  statusTextPaid: { color: "#15803d", fontSize: 10, fontWeight: "700" },
  challanDetailText: {
    fontSize: 13,
    color: "#334155",
    marginBottom: 4,
  },
  downloadPdfBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#cbd5e1'
  },
  downloadPdfText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0f172a'
  }
});
