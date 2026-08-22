import React, { useState } from 'react';
import {  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image, Modal, TextInput  } from 'react-native';
import ScreenWrapper from '../../../components/shared/ScreenWrapper';
import { useRoute, useNavigation } from '@react-navigation/native';
import {
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  Camera,
  CheckSquare,
  Square,
  CheckCircle,
  Clock,
  Inbox,
  Search,
  Loader,
  XCircle,
} from 'lucide-react-native';
import {
  useGetAdminInstagramDealerRequests,
  useAdminRejectInstagramRequests,
  useAdminBulkApproveInstagramPublish,
} from '../../../hooks/admin/useAdminInstagram';
import { formatINR } from '../../../utils/helpers';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=533&fit=crop';

export default function AdminInstagramDealerRequests() {
  const route = useRoute();
  const navigation = useNavigation();
  const { dealerId } = route.params as { dealerId: string | number };
  const parsedDealerId = dealerId ? Number(dealerId) : 0;

  const [selectedRequestIds, setSelectedRequestIds] = useState<number[]>([]);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const {
    data: requests = [],
    isLoading,
    isRefetching,
    refetch,
    error,
  } = useGetAdminInstagramDealerRequests(parsedDealerId);

  const rejectMutation = useAdminRejectInstagramRequests(parsedDealerId);
  const approveMutation = useAdminBulkApproveInstagramPublish(parsedDealerId);

  const pendingRequests = requests.filter((r) => r.approvalStatus === 'PENDING');
  const isAllSelected = pendingRequests.length > 0 && pendingRequests.every((r) => selectedRequestIds.includes(r.requestId));

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedRequestIds([]);
    } else {
      const pendingIds = pendingRequests.map((r) => r.requestId);
      setSelectedRequestIds(pendingIds.slice(0, 10)); // Max 10
    }
  };

  const handleSelectOne = (requestId: number) => {
    if (selectedRequestIds.includes(requestId)) {
      setSelectedRequestIds((prev) => prev.filter((id) => id !== requestId));
    } else {
      if (selectedRequestIds.length >= 10) {
        // Warning: max 10
        return;
      }
      setSelectedRequestIds((prev) => [...prev, requestId]);
    }
  };

  const handleApprovePublish = () => {
    if (selectedRequestIds.length === 0 || !parsedDealerId) return;

    approveMutation.mutate(
      { dealerId: parsedDealerId, requestIds: selectedRequestIds },
      {
        onSuccess: (data) => {
          setSelectedRequestIds([]);
          navigation.navigate('AdminInstagramBatchProgress', { batchId: data.batchId });
        },
      }
    );
  };

  const handleRejectSubmit = () => {
    if (selectedRequestIds.length === 0) return;
    if (!rejectReason.trim()) return;

    rejectMutation.mutate(
      { requestIds: selectedRequestIds, reason: rejectReason.trim() },
      {
        onSuccess: () => {
          setIsRejectModalOpen(false);
          setRejectReason('');
          setSelectedRequestIds([]);
          refetch();
        },
      }
    );
  };

  const renderApprovalStatus = (status: string) => {
    if (status === 'PENDING') return <Badge label="Pending" icon={Clock} color="#d97706" bg="#fffbeb" />;
    if (status === 'APPROVED') return <Badge label="Approved" icon={CheckCircle} color="#10b981" bg="#ecfdf5" />;
    if (status === 'REJECTED') return <Badge label="Rejected" icon={XCircle} color="#e11d48" bg="#fff1f2" />;
    return null;
  };

  const renderPublishStatus = (status: string) => {
    if (status === 'QUEUED') return <Badge label="Queued" icon={Clock} color="#0e7490" bg="#cffafe" />;
    if (status === 'PROCESSING') return <Badge label="Processing" icon={Loader} color="#1d4ed8" bg="#dbeafe" />;
    if (status === 'RETRY_SCHEDULED') return <Badge label="Retrying" icon={Clock} color="#c2410c" bg="#ffedd5" />;
    if (status === 'PUBLISHED') return <Badge label="Published" icon={CheckCircle} color="#10b981" bg="#ecfdf5" />;
    if (status === 'FAILED') return <Badge label="Failed" icon={AlertCircle} color="#e11d48" bg="#fff1f2" />;
    return <Badge label="Not Started" color="#64748b" bg="#f1f5f9" />;
  };

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <AlertCircle size={40} color="#ef4444" />
        <Text style={styles.errorTitle}>Failed to load requests for this dealer</Text>
        <Text style={styles.errorText}>{error.message}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <RefreshCw size={16} color="white" />
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <ChevronLeft size={16} color="#64748b" />
        <Text style={styles.backButtonText}>Back to Summaries</Text>
      </TouchableOpacity>

      <View style={styles.titleRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Review Dealer Requests</Text>
          <Text style={styles.subtitle}>
            Select pending vehicle requests for this dealer and approve to auto-publish on Instagram.
          </Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={() => refetch()} disabled={isLoading || isRefetching}>
          <RefreshCw size={20} color="#64748b" />
        </TouchableOpacity>
      </View>

      {selectedRequestIds.length > 0 && (
        <View style={styles.bulkActionBar}>
          <TouchableOpacity onPress={handleSelectAll} disabled={pendingRequests.length === 0} style={{ padding: 4 }}>
            {isAllSelected ? <CheckSquare size={20} color="#E1306C" /> : <Square size={20} color="#94a3b8" />}
          </TouchableOpacity>
          <View style={styles.bulkActionLeft}>
            <Text style={styles.bulkActionText}>{selectedRequestIds.length} selected</Text>
          </View>
          <View style={styles.bulkActionRight}>
            <TouchableOpacity style={styles.rejectBtn} onPress={() => setIsRejectModalOpen(true)}>
              <Text style={styles.rejectBtnText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.approveBtn} onPress={handleApprovePublish} disabled={approveMutation.isPending}>
              {approveMutation.isPending ? <ActivityIndicator size="small" color="#fff" /> : <Camera size={14} color="#fff" />}
              <Text style={styles.approveBtnText}>Approve</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  const renderItem = ({ item }) => {
    const isSelected = selectedRequestIds.includes(item.requestId);
    const isPending = item.approvalStatus === 'PENDING';
    return (
      <View style={[styles.cardWrapper, isSelected && { shadowColor: '#E1306C', shadowOpacity: 0.2 }]}>
        <View style={[styles.itemCard, isSelected && { borderColor: '#E1306C', borderWidth: 1.5 }]}>
          <View style={styles.itemCardHeader}>
            <TouchableOpacity onPress={() => isPending && handleSelectOne(item.requestId)} disabled={!isPending} style={{ paddingRight: 12, paddingTop: 4 }}>
              {isSelected ? <CheckSquare size={22} color={!isPending ? "#cbd5e1" : "#E1306C"} /> : <Square size={22} color={!isPending ? "#cbd5e1" : "#94a3b8"} />}
            </TouchableOpacity>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
              <Image source={{ uri: item.primaryImageUrl || FALLBACK_IMG }} style={styles.vehicleImage} />
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={styles.vehicleTitle} numberOfLines={1}>{item.registrationYear} {item.brand} {item.model}</Text>
                <Text style={styles.vehicleSub}>{item.variant} • {item.fuelType}</Text>
                <Text style={styles.vehiclePrice}>{item.askingPrice ? formatINR(item.askingPrice) : '—'}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.statusGrid}>
            <View style={[styles.statusCol, { backgroundColor: '#f8fafc', padding: 10, borderRadius: 8 }]}>
              <Text style={styles.statusLabel}>Approval</Text>
              {renderApprovalStatus(item.approvalStatus)}
            </View>
            <View style={[styles.statusCol, { backgroundColor: '#f8fafc', padding: 10, borderRadius: 8 }]}>
              <Text style={styles.statusLabel}>Publishing</Text>
              {renderPublishStatus(item.publishStatus)}
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScreenWrapper layoutType="admin" scrollEnabled={false}>
      <View style={styles.container}>
      <FlatList
        data={requests}
        keyExtractor={(item) => item.requestId.toString()}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator size="large" color="#E1306C" style={{ marginTop: 40 }} />
          ) : (
            <Text style={styles.emptyText}>No requests submitted by this dealer.</Text>
          )
        }
        contentContainerStyle={styles.listContent}
      />

      <Modal visible={isRejectModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reject Post Requests</Text>
            <Text style={styles.modalDesc}>Please enter a reason for rejecting the selected {selectedRequestIds.length} requests.</Text>
            <TextInput
              style={styles.textArea}
              placeholder="e.g. Mandatory vehicle details missing..."
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setIsRejectModalOpen(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={handleRejectSubmit} disabled={rejectMutation.isPending}>
                {rejectMutation.isPending ? <ActivityIndicator size="small" color="#fff" /> : null}
                <Text style={styles.modalConfirmText}>Confirm Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
    </ScreenWrapper>
  );
}

const Badge = ({ label, icon, color, bg }) => (
  <View style={[styles.badge, { backgroundColor: bg, borderColor: color }]}>
    {icon && (() => { const Icon = icon; return <Icon size={10} color={color} style={{ marginRight: 4 }} />; })()}
    <Text style={[styles.badgeText, { color }]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  listContent: { padding: 16 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 12 },
  errorText: { fontSize: 14, color: '#64748b', marginTop: 4, textAlign: 'center' },
  retryButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f172a', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, marginTop: 16, gap: 8 },
  retryButtonText: { color: 'white', fontWeight: 'bold' },
  headerContainer: { marginBottom: 16 },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  backButtonText: { fontSize: 12, fontWeight: '600', color: '#64748b', marginLeft: 4 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0f172a' },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
  refreshButton: { padding: 8, backgroundColor: 'white', borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0', marginLeft: 16 },
  bulkActionBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f1f5f9', padding: 12, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  bulkActionLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bulkActionText: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
  bulkActionRight: { flexDirection: 'row', gap: 8 },
  rejectBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#fecdd3', backgroundColor: 'white' },
  rejectBtnText: { color: '#e11d48', fontSize: 12, fontWeight: 'bold' },
  approveBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: '#E1306C' },
  approveBtnText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  cardWrapper: {
    marginBottom: 16,
  },
  itemCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  itemCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  vehicleImage: { width: 80, height: 60, borderRadius: 8, backgroundColor: '#e2e8f0' },
  vehicleTitle: { fontSize: 15, fontWeight: 'bold', color: '#0f172a' },
  vehicleSub: { fontSize: 13, color: '#64748b', marginTop: 2 },
  vehiclePrice: { fontSize: 14, fontWeight: 'bold', color: '#1e293b', marginTop: 4 },
  statusGrid: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f8fafc',
    paddingTop: 16,
    gap: 12,
  },
  statusCol: { flex: 1, alignItems: 'flex-start' },
  statusLabel: { fontSize: 11, color: '#64748b', fontWeight: '600', marginBottom: 6, textTransform: 'uppercase' },
  emptyText: { textAlign: 'center', marginTop: 32, color: '#64748b', fontSize: 14 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 0.5, alignSelf: 'flex-start' },
  badgeText: { fontSize: 11, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', backgroundColor: 'white', borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginBottom: 8 },
  modalDesc: { fontSize: 14, color: '#64748b', marginBottom: 16 },
  textArea: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 12, height: 100, fontSize: 14, marginBottom: 20 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  modalCancel: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  modalCancelText: { fontSize: 14, fontWeight: 'bold', color: '#64748b' },
  modalConfirm: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e11d48', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, gap: 8 },
  modalConfirmText: { fontSize: 14, fontWeight: 'bold', color: 'white' },
});
