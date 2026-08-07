import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  TextInput,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Gift, Plus, History, X, Image as ImageIcon, AlertCircle, Users, CheckCircle2, XCircle, Phone, Info, Sparkles, RefreshCw, Video as VideoIcon } from "lucide-react-native";
import { launchImageLibrary } from "react-native-image-picker";
import Video from "react-native-video";
import ScreenWrapper from "../../components/shared/ScreenWrapper";
import { useAdminOffers, useSendDealerOffer, AdminOffer, useOfferDeliverySummary, useOfferGlobalStats } from "../../hooks/admin/useAdminOffers";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

export default function AdminOffers() {
  const navigation = useNavigation();
  const { data: offers = [], isLoading, isError, refetch } = useAdminOffers();
  const { data: globalStats, isLoading: isStatsLoading } = useOfferGlobalStats();
  const sendOfferMutation = useSendDealerOffer();

  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState<number | null>(null);

  const selectedOffer = offers.find(o => o.offerId === selectedOfferId);
  const { data: deliverySummary, isLoading: isLogsLoading, refetch: refetchLogs } = useOfferDeliverySummary(selectedOfferId);
  const selectedLogs = deliverySummary?.dealerBreakdown;

  // Form State
  const [templateType, setTemplateType] = useState<"IMAGE" | "VIDEO">("IMAGE");
  const [offerImage, setOfferImage] = useState<any>(null);
  const [offerVideo, setOfferVideo] = useState<any>(null);
  const [offerTitle, setOfferTitle] = useState("");
  const [dealerGreetingName, setDealerGreetingName] = useState("Valued Partner");
  const [offerDetails, setOfferDetails] = useState("");
  const [benefits, setBenefits] = useState("");
  const [contactInfo, setContactInfo] = useState("8483079733");

  const resetForm = () => {
    setTemplateType("IMAGE");
    setOfferImage(null);
    setOfferVideo(null);
    setOfferTitle("");
    setDealerGreetingName("Valued Partner");
    setOfferDetails("");
    setBenefits("");
    setContactInfo("8483079733");
  };

  const handleImagePick = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: "photo",
        quality: 0.8,
      });
      if (result.didCancel) return;
      if (result.errorCode) {
        Alert.alert("Error", result.errorMessage || "Could not pick image");
        return;
      }
      if (result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        if (file.fileSize && file.fileSize > 5 * 1024 * 1024) {
          Alert.alert("Error", "File size must be less than 5MB");
          return;
        }
        setOfferImage({
          uri: file.uri,
          type: file.type || "image/jpeg",
          name: file.fileName || "offer_banner.jpg",
        });
      }
    } catch (err) {
      console.log("Image Pick Error: ", err);
    }
  };

  const handleVideoPick = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: "video",
        quality: 0.8,
      });
      if (result.didCancel) return;
      if (result.errorCode) {
        Alert.alert("Error", result.errorMessage || "Could not pick video");
        return;
      }
      if (result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        if (file.fileSize && file.fileSize > 16 * 1024 * 1024) {
          Alert.alert("Error", "File size must be less than 16MB");
          return;
        }
        setOfferVideo({
          uri: file.uri,
          type: file.type || "video/mp4",
          name: file.fileName || "offer_video.mp4",
        });
      }
    } catch (err) {
      console.log("Video Pick Error: ", err);
    }
  };

  const handleSendOffer = async () => {
    if (templateType === "IMAGE" && !offerImage) {
      Alert.alert("Error", "Please select an offer image.");
      return;
    }
    if (templateType === "VIDEO" && !offerVideo) {
      Alert.alert("Error", "Please select an offer video.");
      return;
    }
    if (!offerTitle || !dealerGreetingName || !offerDetails || !benefits) {
      Alert.alert("Error", "Please fill all required fields.");
      return;
    }

    const formData = new FormData();
    formData.append("templateType", templateType);
    if (templateType === "IMAGE" && offerImage) {
      formData.append("offerImage", offerImage);
    } else if (templateType === "VIDEO" && offerVideo) {
      formData.append("offerVideo", offerVideo);
    }
    
    formData.append("offerTitle", offerTitle);
    formData.append("dealerGreetingName", dealerGreetingName);
    formData.append("offerDetails", offerDetails);
    formData.append("benefits", benefits);
    formData.append("contactInfo", contactInfo);

    try {
      await sendOfferMutation.mutateAsync(formData);
      Alert.alert("Success", "Offer sent to dealers successfully!");
      setIsSendModalOpen(false);
      resetForm();
    } catch (error: any) {
      const msg = error?.response?.data?.message || error.message || "Failed to send offer.";
      Alert.alert("Error", msg);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#4c0519" />
        </View>
      );
    }

    if (isError) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Failed to load offers.</Text>
          <Button title="Try Again" onPress={() => refetch()} variant="outline" />
        </View>
      );
    }

    return (
      <View style={styles.listContainer}>
        {/* Global WhatsApp Stats */}
        {!isStatsLoading && globalStats && (
          <View style={styles.globalStatsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.globalStatsScroll}>
              <View style={[styles.globalStatBox, { borderColor: '#e2e8f0' }]}>
                <View style={[styles.globalStatIconWrap, { backgroundColor: '#f1f5f9' }]}>
                  <History size={14} color="#475569" />
                </View>
                <Text style={[styles.globalStatLabel, { color: '#64748b' }]}>Total Sent</Text>
                <Text style={styles.globalStatValue}>{globalStats.totalSent ?? globalStats.sent ?? 0}</Text>
              </View>

              <View style={[styles.globalStatBox, { borderColor: '#fef3c7', backgroundColor: '#fffbeb' }]}>
                <View style={[styles.globalStatIconWrap, { backgroundColor: '#fef3c7' }]}>
                  <RefreshCw size={14} color="#d97706" />
                </View>
                <Text style={[styles.globalStatLabel, { color: '#d97706' }]}>Queued</Text>
                <Text style={[styles.globalStatValue, { color: '#b45309' }]}>{globalStats.totalQueued ?? globalStats.queued ?? globalStats.totalAccepted ?? globalStats.accepted ?? 0}</Text>
              </View>

              <View style={[styles.globalStatBox, { borderColor: '#d1fae5', backgroundColor: '#ecfdf5' }]}>
                <View style={[styles.globalStatIconWrap, { backgroundColor: '#d1fae5' }]}>
                  <CheckCircle2 size={14} color="#059669" />
                </View>
                <Text style={[styles.globalStatLabel, { color: '#059669' }]}>Delivered</Text>
                <Text style={[styles.globalStatValue, { color: '#047857' }]}>{globalStats.totalDelivered ?? globalStats.delivered ?? 0}</Text>
              </View>

              <View style={[styles.globalStatBox, { borderColor: '#dbeafe', backgroundColor: '#eff6ff' }]}>
                <View style={[styles.globalStatIconWrap, { backgroundColor: '#dbeafe' }]}>
                  <Users size={14} color="#2563eb" />
                </View>
                <Text style={[styles.globalStatLabel, { color: '#2563eb' }]}>Read</Text>
                <Text style={[styles.globalStatValue, { color: '#1d4ed8' }]}>{globalStats.totalRead ?? globalStats.read ?? 0}</Text>
              </View>

              <View style={[styles.globalStatBox, { borderColor: '#ffe4e6', backgroundColor: '#fff1f2' }]}>
                <View style={[styles.globalStatIconWrap, { backgroundColor: '#ffe4e6' }]}>
                  <XCircle size={14} color="#e11d48" />
                </View>
                <Text style={[styles.globalStatLabel, { color: '#e11d48' }]}>Failed</Text>
                <Text style={[styles.globalStatValue, { color: '#be123c' }]}>{globalStats.totalFailed ?? globalStats.failed ?? 0}</Text>
              </View>
            </ScrollView>
          </View>
        )}

        {offers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Gift size={48} color="#cbd5e1" style={{ marginBottom: 16 }} />
            <Text style={styles.emptyTitle}>No offers sent yet</Text>
            <Text style={styles.emptySub}>Click "Send New Offer" to get started.</Text>
          </View>
        ) : (
          offers.map((offer) => (
            <View key={offer.offerId} style={styles.card}>
              {/* Top Image/Video Section */}
              <View style={styles.imageSection}>
                {offer.templateType === "VIDEO" && offer.videoUrl ? (
                  <View style={[StyleSheet.absoluteFill, { backgroundColor: '#020617' }]}>
                    <Video 
                      source={{ uri: offer.videoUrl }}
                      style={StyleSheet.absoluteFill}
                      resizeMode="cover"
                      repeat
                      muted
                      paused={false}
                    />
                  </View>
                ) : offer.templateType === "IMAGE" && offer.imageUrl ? (
                  <View style={[StyleSheet.absoluteFill, { backgroundColor: '#020617' }]}>
                    <View style={[StyleSheet.absoluteFill, { zIndex: 1 }]}>
                      <Image source={{ uri: offer.imageUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    </View>
                  </View>
                ) : (
                  <View style={[StyleSheet.absoluteFill, { backgroundColor: '#020617', alignItems: 'center', justifyContent: 'center' }]}>
                    <Gift size={80} color="rgba(255,255,255,0.1)" />
                  </View>
                )}
                
                <View style={styles.imageOverlay} />
                <View style={styles.imageGradientOverlay} />
                
                <View style={styles.idBadgeContainer}>
                  <View style={styles.idBadge}>
                    <Text style={styles.idBadgeText}>ID: {offer.offerId}</Text>
                  </View>
                  <View style={[styles.idBadge, { backgroundColor: 'rgba(99, 102, 241, 0.2)', borderColor: 'rgba(99, 102, 241, 0.3)' }]}>
                    {offer.templateType === "VIDEO" ? <VideoIcon size={10} color="#a5b4fc" style={{marginRight: 4}} /> : <ImageIcon size={10} color="#a5b4fc" style={{marginRight: 4}} />}
                    <Text style={[styles.idBadgeText, { color: '#a5b4fc' }]}>{offer.templateType}</Text>
                  </View>
                </View>

                <View style={styles.titleContainer}>
                  <Text style={styles.cardTitle} numberOfLines={2}>{offer.offerTitle}</Text>
                  <Text style={styles.cardDate}>Sent: {new Date(offer.createdAt).toLocaleString()}</Text>
                </View>
              </View>
              
              {/* Body Section */}
              <View style={styles.cardBody}>
                {/* Stats Row */}
                <View style={styles.statsRow}>
                  <View style={[styles.statBox, { backgroundColor: '#eff6ff', borderColor: '#dbeafe' }]}>
                    <View style={[styles.statIconWrap, { backgroundColor: '#dbeafe' }]}><Users size={16} color="#2563eb" /></View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.statLabel, { color: '#64748b' }]}>Targeted</Text>
                      <Text style={[styles.statValue, { color: '#0f172a' }]}>{offer.totalDealersTargeted}</Text>
                    </View>
                  </View>
                  <View style={[styles.statBox, { backgroundColor: '#ecfdf5', borderColor: '#d1fae5' }]}>
                    <View style={[styles.statIconWrap, { backgroundColor: '#d1fae5' }]}><CheckCircle2 size={16} color="#059669" /></View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.statLabel, { color: '#059669' }]}>Success</Text>
                      <Text style={[styles.statValue, { color: '#059669' }]}>{offer.totalSentSuccess}</Text>
                    </View>
                  </View>
                  <View style={[styles.statBox, { backgroundColor: '#fff1f2', borderColor: '#ffe4e6' }]}>
                    <View style={[styles.statIconWrap, { backgroundColor: '#ffe4e6' }]}><XCircle size={16} color="#e11d48" /></View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.statLabel, { color: '#e11d48' }]}>Failed</Text>
                      <Text style={[styles.statValue, { color: '#e11d48' }]}>{offer.totalSentFailed}</Text>
                    </View>
                  </View>
                </View>
                
                {/* Details Box */}
                <View style={styles.detailsBox}>
                  <View style={styles.detailGrid}>
                    <View style={styles.detailGridItem}>
                      <View style={styles.detailHeaderWrap}><Users size={14} color="#9f1239" /><Text style={styles.detailHeader}>Greeting</Text></View>
                      <Text style={styles.detailValueBold}>{offer.dealerGreetingName}</Text>
                    </View>
                    <View style={styles.detailGridItem}>
                      <View style={styles.detailHeaderWrap}><Phone size={14} color="#9f1239" /><Text style={styles.detailHeader}>Contact</Text></View>
                      <Text style={styles.detailValueBold}>{offer.contactInfo}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.detailSection}>
                    <View style={styles.detailHeaderWrap}><Info size={14} color="#9f1239" /><Text style={styles.detailHeader}>Details</Text></View>
                    <Text style={[styles.detailValueText, { fontStyle: 'italic' }]} numberOfLines={3}>"{offer.offerDetails}"</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <View style={styles.detailHeaderWrap}><Sparkles size={14} color="#047857" /><Text style={[styles.detailHeader, { color: '#047857' }]}>Benefits</Text></View>
                    <Text style={[styles.detailValueText, { color: '#334155' }]} numberOfLines={2}>{offer.benefits}</Text>
                  </View>
                </View>
                
                <TouchableOpacity
                  style={styles.logsBtn}
                  onPress={() => setSelectedOfferId(offer.offerId)}
                >
                  <History size={16} color="#4c0519" />
                  <Text style={styles.logsBtnText}>View Detailed Logs</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>
    );
  };

  return (
    <ScreenWrapper showBack>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.pageTitle}>Offers</Text>
          <Text style={styles.pageSub}>Manage & send marketing offers</Text>
        </View>
        <TouchableOpacity
          style={styles.sendBtn}
          onPress={() => setIsSendModalOpen(true)}
        >
          <Plus size={16} color="#fff" />
          <Text style={styles.sendBtnText}>Send Offer</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {renderContent()}
      </ScrollView>

      {/* Send Offer Modal */}
      <Modal visible={isSendModalOpen} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Send Offer to Dealers</Text>
          <TouchableOpacity onPress={() => setIsSendModalOpen(false)}>
            <X size={24} color="#0f172a" />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.modalBody} contentContainerStyle={{ paddingBottom: 40 }}>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Select Template Type <Text style={{color:'red'}}>*</Text></Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity 
                style={[styles.templateTypeBtn, templateType === "IMAGE" && styles.templateTypeBtnActive]}
                onPress={() => setTemplateType("IMAGE")}
              >
                <ImageIcon size={20} color={templateType === "IMAGE" ? "#4c0519" : "#64748b"} />
                <Text style={[styles.templateTypeText, templateType === "IMAGE" && styles.templateTypeTextActive]}>Image</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.templateTypeBtn, templateType === "VIDEO" && styles.templateTypeBtnActive]}
                onPress={() => setTemplateType("VIDEO")}
              >
                <VideoIcon size={20} color={templateType === "VIDEO" ? "#4c0519" : "#64748b"} />
                <Text style={[styles.templateTypeText, templateType === "VIDEO" && styles.templateTypeTextActive]}>Video</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Offer Title <Text style={{color:'red'}}>*</Text></Text>
            <Input placeholder="e.g. Dealer Festival Offer" value={offerTitle} onChangeText={setOfferTitle} />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Greeting Name <Text style={{color:'red'}}>*</Text></Text>
            <Input placeholder="e.g. Valued Partner" value={dealerGreetingName} onChangeText={setDealerGreetingName} />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Offer Details <Text style={{color:'red'}}>*</Text></Text>
            <TextInput 
              style={styles.textArea} 
              placeholder="Brief description of the offer..." 
              value={offerDetails} 
              onChangeText={setOfferDetails} 
              multiline 
              numberOfLines={3} 
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Benefits <Text style={{color:'red'}}>*</Text></Text>
            <TextInput 
              style={styles.textArea} 
              placeholder="List benefits separated by commas..." 
              value={benefits} 
              onChangeText={setBenefits} 
              multiline 
              numberOfLines={3} 
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Contact Info <Text style={{color:'red'}}>*</Text></Text>
            <TextInput 
              style={[styles.inputDisabled]} 
              value={contactInfo} 
              editable={false} 
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              {templateType === "IMAGE" ? "Offer Image (.jpg or .png)" : "Offer Video (.mp4 or .3gp)"} <Text style={{color:'red'}}>*</Text>
            </Text>
            
            {templateType === "IMAGE" ? (
              offerImage ? (
                <View style={[styles.mediaPickerBtn, styles.mediaPickerBtnActive]}>
                  <View style={{ alignItems: 'center', width: '100%' }}>
                    <Image source={{ uri: offerImage.uri }} style={{ width: '100%', height: 160, borderRadius: 8, marginBottom: 8 }} resizeMode="contain" />
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingHorizontal: 4 }}>
                      <Text style={[styles.mediaPickerText, { color: '#059669', fontWeight: 'bold', flex: 1, textAlign: 'left' }]} numberOfLines={1}>{offerImage.name}</Text>
                      <TouchableOpacity style={styles.removeMediaBtn} onPress={() => setOfferImage(null)}>
                        <X size={14} color="#e11d48" />
                        <Text style={styles.removeMediaBtnText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ) : (
                <TouchableOpacity style={styles.mediaPickerBtn} onPress={handleImagePick}>
                  <ImageIcon size={24} color="#4c0519" style={{ marginBottom: 8 }} />
                  <Text style={styles.mediaPickerText}>Click to upload banner image</Text>
                </TouchableOpacity>
              )
            ) : (
              offerVideo ? (
                <View style={[styles.mediaPickerBtn, { borderColor: '#818cf8', backgroundColor: '#eef2ff', borderStyle: 'solid' }]}>
                  <View style={{ alignItems: 'center', width: '100%' }}>
                    <View style={{ width: '100%', height: 160, borderRadius: 8, overflow: 'hidden', marginBottom: 8, backgroundColor: '#000' }}>
                      <Video source={{ uri: offerVideo.uri }} style={StyleSheet.absoluteFill} resizeMode="contain" repeat muted paused={false} />
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingHorizontal: 4 }}>
                      <Text style={[styles.mediaPickerText, { color: '#4338ca', fontWeight: 'bold', flex: 1, textAlign: 'left' }]} numberOfLines={1}>{offerVideo.name}</Text>
                      <TouchableOpacity style={styles.removeMediaBtn} onPress={() => setOfferVideo(null)}>
                        <X size={14} color="#e11d48" />
                        <Text style={styles.removeMediaBtnText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ) : (
                <TouchableOpacity style={styles.mediaPickerBtn} onPress={handleVideoPick}>
                  <VideoIcon size={24} color="#4338ca" style={{ marginBottom: 8 }} />
                  <Text style={styles.mediaPickerText}>Click to upload offer video</Text>
                </TouchableOpacity>
              )
            )}
          </View>
          
          <Button 
            title="Blast Offer" 
            onPress={handleSendOffer} 
            loading={sendOfferMutation.isPending} 
            style={{ marginTop: 16, backgroundColor: '#4c0519' }} 
          />
        </ScrollView>
      </Modal>

      {/* Logs Modal */}
      <Modal visible={!!selectedOfferId} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSelectedOfferId(null)}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Delivery Logs</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <TouchableOpacity onPress={() => refetchLogs()} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              {isLogsLoading ? <ActivityIndicator size="small" color="#475569" /> : <RefreshCw size={16} color="#475569" />}
              <Text style={{ fontSize: 12, color: "#475569", fontWeight: "600" }}>Refresh</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSelectedOfferId(null)}>
              <X size={24} color="#0f172a" />
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView style={styles.modalBody} contentContainerStyle={{ paddingBottom: 40 }}>
          
          {isLogsLoading ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#4c0519" />
            </View>
          ) : deliverySummary ? (
            <>
              {/* Delivery Stats Grid */}
              <View style={styles.logStatsGrid}>
                <View style={styles.logStatItem}>
                  <Text style={styles.logStatLabel}>Targeted</Text>
                  <Text style={styles.logStatValue}>{deliverySummary.totalDealers}</Text>
                </View>
                <View style={styles.logStatItem}>
                  <Text style={[styles.logStatLabel, { color: '#2563eb' }]}>Accepted</Text>
                  <Text style={[styles.logStatValue, { color: '#1d4ed8' }]}>{deliverySummary.accepted}</Text>
                </View>
                <View style={styles.logStatItem}>
                  <Text style={[styles.logStatLabel, { color: '#4f46e5' }]}>Sent</Text>
                  <Text style={[styles.logStatValue, { color: '#4338ca' }]}>{deliverySummary.sent}</Text>
                </View>
                <View style={styles.logStatItem}>
                  <Text style={[styles.logStatLabel, { color: '#059669' }]}>Delivered</Text>
                  <Text style={[styles.logStatValue, { color: '#047857' }]}>{deliverySummary.delivered}</Text>
                </View>
                <View style={styles.logStatItem}>
                  <Text style={[styles.logStatLabel, { color: '#0d9488' }]}>Read</Text>
                  <Text style={[styles.logStatValue, { color: '#0f766e' }]}>{deliverySummary.read}</Text>
                </View>
                <View style={styles.logStatItem}>
                  <Text style={[styles.logStatLabel, { color: '#e11d48' }]}>Failed</Text>
                  <Text style={[styles.logStatValue, { color: '#be123c' }]}>{deliverySummary.failed}</Text>
                </View>
              </View>

              <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#0f172a', marginBottom: 12, marginTop: 16 }}>Dealer Logs</Text>
              
              {selectedLogs && selectedLogs.length > 0 ? (
                selectedLogs.map((log, idx) => {
                  const isSuccess = log.deliveryStatus !== 'FAILED';
                  return (
                    <View key={idx} style={[styles.logCard, isSuccess ? styles.logSuccess : styles.logFailed]}>
                      <View style={styles.logCardHeader}>
                        <View>
                          <Text style={styles.logDealerName}>{log.dealerName}</Text>
                          <Text style={styles.logMobile}>+{log.mobileNumber}</Text>
                        </View>
                        <View style={[styles.statusBadge, isSuccess ? styles.statusBadgeSuccess : styles.statusBadgeFailed]}>
                          <Text style={[styles.statusBadgeText, isSuccess ? styles.statusBadgeTextSuccess : styles.statusBadgeTextFailed]}>{log.deliveryStatus}</Text>
                        </View>
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                        <Text style={styles.logDate}>Attempted: {new Date(log.sentAt).toLocaleString()}</Text>
                        {log.whatsappMessageId && <Text style={{ fontSize: 10, color: '#94a3b8' }}>ID: {log.whatsappMessageId}</Text>}
                      </View>
                    </View>
                  );
                })
              ) : (
                <Text style={{ textAlign: 'center', marginTop: 20, color: '#64748b' }}>No specific dealer logs available.</Text>
              )}
            </>
          ) : (
            <Text style={{ textAlign: 'center', marginTop: 40, color: '#64748b' }}>No logs available for this offer.</Text>
          )}
        </ScrollView>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  contentContainer: { padding: 16, paddingBottom: 40 },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", minHeight: 300 },
  errorText: { color: "#e11d48", marginBottom: 12, fontSize: 16 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9"
  },
  pageTitle: { fontSize: 20, fontWeight: "bold", color: "#020617" },
  pageSub: { fontSize: 13, color: "#64748b", marginTop: 2 },
  sendBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4c0519",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4
  },
  sendBtnText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  
  globalStatsContainer: {
    marginBottom: 16,
  },
  globalStatsScroll: {
    paddingVertical: 4,
    gap: 12,
  },
  globalStatBox: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    minWidth: 110,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  globalStatIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  globalStatLabel: {
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  globalStatValue: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0f172a",
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderStyle: "dashed",
    marginTop: 16
  },
  emptyTitle: { fontSize: 18, fontWeight: "600", color: "#0f172a" },
  emptySub: { fontSize: 14, color: "#64748b", marginTop: 4 },
  listContainer: { gap: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  imageSection: {
    height: 220,
    position: "relative",
    justifyContent: "flex-end",
    padding: 16
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(2, 6, 23, 0.4)",
    zIndex: 2
  },
  imageGradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    backgroundColor: 'rgba(0,0,0,0.4)', // Faking gradient visually in basic RN View
    zIndex: 2,
  },
  idBadgeContainer: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: 'row',
    gap: 6,
    zIndex: 10
  },
  idBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    flexDirection: 'row',
    alignItems: 'center'
  },
  idBadgeText: { color: "#fff", fontSize: 10, fontWeight: "800", textTransform: "uppercase" },
  titleContainer: { zIndex: 10 },
  cardTitle: { color: "#fff", fontSize: 22, fontWeight: "900", textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: {width: 0, height: 1}, textShadowRadius: 4 },
  cardDate: { color: "#cbd5e1", fontSize: 12, marginTop: 4, fontWeight: "600" },
  cardBody: { padding: 16, backgroundColor: '#fff' },
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  statBox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 8,
    flexDirection: 'row',
    alignItems: "center",
    gap: 8
  },
  statIconWrap: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  statLabel: { fontSize: 9, fontWeight: "900", textTransform: "uppercase", marginBottom: 2 },
  statValue: { fontSize: 16, fontWeight: "900" },
  detailsBox: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16
  },
  detailGrid: { flexDirection: 'row', gap: 12, marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  detailGridItem: { flex: 1, backgroundColor: '#fff', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#f1f5f9' },
  detailHeaderWrap: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  detailHeader: { fontSize: 10, fontWeight: "bold", textTransform: "uppercase", color: "#9f1239", letterSpacing: 0.5 },
  detailValueBold: { fontSize: 14, fontWeight: "700", color: "#0f172a" },
  detailSection: { marginBottom: 12 },
  detailValueText: { fontSize: 13, color: "#64748b", lineHeight: 20 },
  logsBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff1f2",
    borderWidth: 1,
    borderColor: "#ffe4e6",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6
  },
  logsBtnText: { color: "#4c0519", fontWeight: "600", fontSize: 14 },
  
  // Modal styles
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9"
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#0f172a" },
  modalBody: { flex: 1, backgroundColor: "#fff", padding: 16 },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "500", color: "#334155", marginBottom: 6 },
  
  templateTypeBtn: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f8fafc'
  },
  templateTypeBtnActive: {
    borderColor: '#4c0519',
    backgroundColor: '#fff1f2'
  },
  templateTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b'
  },
  templateTypeTextActive: {
    color: '#4c0519'
  },

  textArea: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#0f172a",
    backgroundColor: "#fff",
    textAlignVertical: "top",
    minHeight: 80
  },
  inputDisabled: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#64748b",
    backgroundColor: "#f1f5f9",
  },
  mediaPickerBtn: {
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc"
  },
  mediaPickerBtnActive: {
    borderColor: '#fda4af',
    backgroundColor: '#fff1f2',
    borderStyle: 'solid'
  },
  mediaPickerText: { color: "#64748b", fontSize: 14, fontWeight: "500", textAlign: "center" },
  removeMediaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffe4e6',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4
  },
  removeMediaBtnText: {
    color: '#e11d48',
    fontSize: 12,
    fontWeight: 'bold'
  },

  // Log Stats Grid
  logStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8
  },
  logStatItem: {
    width: '31%',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center'
  },
  logStatLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 4
  },
  logStatValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a'
  },

  // Log Card
  logCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10
  },
  logSuccess: { backgroundColor: "#ecfdf5", borderColor: "#d1fae5" },
  logFailed: { backgroundColor: "#fff1f2", borderColor: "#ffe4e6" },
  logCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  logDealerName: { fontSize: 15, fontWeight: "bold", color: "#0f172a" },
  logMobile: { fontSize: 13, color: "#64748b", marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusBadgeSuccess: { backgroundColor: "#d1fae5" },
  statusBadgeFailed: { backgroundColor: "#ffe4e6" },
  statusBadgeText: { fontSize: 10, fontWeight: "bold" },
  statusBadgeTextSuccess: { color: "#059669" },
  statusBadgeTextFailed: { color: "#e11d48" },
  logDate: { fontSize: 11, color: "#94a3b8" }
});
