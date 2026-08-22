import React, { useState } from 'react';
import {  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, Image, ScrollView  } from 'react-native';
import ScreenWrapper from '../../components/shared/ScreenWrapper';
import { useNavigation } from '@react-navigation/native';
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
  useGetDealerInstagramVehicles,
  useSubmitBulkInstagramPost,
} from '../../hooks/dealer/useDealerInstagram';
import { formatINR } from '../../utils/helpers';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=533&fit=crop';

export default function DealerInstagramRequests() {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const {
    data: vehicles = [],
    isLoading,
    isRefetching,
    refetch,
    error,
  } = useGetDealerInstagramVehicles();

  const submitMutation = useSubmitBulkInstagramPost();

  const filteredVehicles = vehicles.filter((v) => {
    const searchLower = search.toLowerCase();
    const matchesSearch =
      `${v.brand} ${v.model} ${v.variant}`.toLowerCase().includes(searchLower) ||
      v.registrationYear.toString().includes(searchLower);

    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'selectable') return matchesSearch && v.selectable;
    if (statusFilter === 'pending') return matchesSearch && v.approvalStatus === 'PENDING';
    if (statusFilter === 'published') return matchesSearch && v.publishStatus === 'PUBLISHED';
    if (statusFilter === 'failed') return matchesSearch && (v.publishStatus === 'FAILED' || v.approvalStatus === 'REJECTED');

    return matchesSearch;
  });

  const allSelectableFiltered = filteredVehicles.filter((v) => v.selectable);
  const isAllSelected = allSelectableFiltered.length > 0 && allSelectableFiltered.every((v) => selectedIds.includes(v.vehicleId));

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      const selectable = allSelectableFiltered.map((v) => v.vehicleId);
      setSelectedIds(selectable.slice(0, 10));
    }
  };

  const handleSelectOne = (vehicleId: number) => {
    if (selectedIds.includes(vehicleId)) {
      setSelectedIds((prev) => prev.filter((id) => id !== vehicleId));
    } else {
      if (selectedIds.length >= 10) return;
      setSelectedIds((prev) => [...prev, vehicleId]);
    }
  };

  const handleSubmit = () => {
    if (selectedIds.length === 0 || selectedIds.length > 10) return;
    submitMutation.mutate(
      { vehicleIds: selectedIds },
      {
        onSuccess: () => {
          setSelectedIds([]);
          refetch();
        },
      }
    );
  };

  const totalCount = vehicles.length;
  const pendingCount = vehicles.filter((v) => v.approvalStatus === 'PENDING').length;
  const publishedCount = vehicles.filter((v) => v.publishStatus === 'PUBLISHED').length;
  const failedCount = vehicles.filter(
    (v) => v.publishStatus === 'FAILED' || v.approvalStatus === 'REJECTED'
  ).length;

  const renderApprovalStatus = (v: any) => {
    if (v.approvalStatus === 'PENDING') return <Badge label="Pending Review" icon={Clock} color="#d97706" bg="#fffbeb" />;
    if (v.approvalStatus === 'APPROVED') return <Badge label="Approved" icon={CheckCircle} color="#10b981" bg="#ecfdf5" />;
    if (v.approvalStatus === 'REJECTED') {
      return (
        <View style={{ alignItems: 'flex-start' }}>
          <Badge label="Rejected" icon={XCircle} color="#e11d48" bg="#fff1f2" />
          {v.rejectionReason && <Text style={styles.rejectReason} numberOfLines={2}>Reason: {v.rejectionReason}</Text>}
        </View>
      );
    }
    return <Badge label="No Request" color="#64748b" bg="#f8fafc" />;
  };

  const renderPublishStatus = (v: any) => {
    if (v.publishStatus === 'QUEUED') return <Badge label="Queued" icon={Clock} color="#0e7490" bg="#cffafe" />;
    if (v.publishStatus === 'PROCESSING') return <Badge label="Processing" icon={Loader} color="#1d4ed8" bg="#dbeafe" />;
    if (v.publishStatus === 'RETRY_SCHEDULED') return <Badge label="Retrying" icon={Clock} color="#c2410c" bg="#ffedd5" />;
    if (v.publishStatus === 'PUBLISHED') return <Badge label="Published" icon={CheckCircle} color="#10b981" bg="#ecfdf5" />;
    if (v.publishStatus === 'FAILED') return <Badge label="Failed" icon={AlertCircle} color="#e11d48" bg="#fff1f2" />;
    return <Badge label="Not Started" color="#94a3b8" bg="#f1f5f9" />;
  };

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <AlertCircle size={40} color="#ef4444" />
        <Text style={styles.errorTitle}>Failed to load Instagram request list</Text>
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
      <View style={styles.titleRow}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Camera size={28} color="#E1306C" />
          <Text style={styles.title}>Instagram Publishing</Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={() => refetch()} disabled={isLoading || isRefetching}>
          <RefreshCw size={20} color="#64748b" />
        </TouchableOpacity>
      </View>
      <Text style={styles.subtitle}>
        Request, track, and manage your vehicle auto-posts on the official Instagram Page.
      </Text>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Vehicles</Text>
          <Text style={styles.statValue}>{totalCount}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Pending</Text>
          <Text style={[styles.statValue, { color: '#d97706' }]}>{pendingCount}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Published</Text>
          <Text style={[styles.statValue, { color: '#059669' }]}>{publishedCount}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Failed</Text>
          <Text style={[styles.statValue, { color: '#e11d48' }]}>{failedCount}</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#94a3b8" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by brand, model or year..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
        {['all', 'selectable', 'pending', 'published', 'failed'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, statusFilter === f && styles.filterBtnActive]}
            onPress={() => setStatusFilter(f)}
          >
            <Text style={[styles.filterText, statusFilter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedIds.length > 0 && (
        <View style={styles.bulkActionBar}>
          <TouchableOpacity onPress={handleSelectAll} disabled={allSelectableFiltered.length === 0} style={{ padding: 4 }}>
            {isAllSelected ? <CheckSquare size={20} color="#E1306C" /> : <Square size={20} color="#94a3b8" />}
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.bulkActionText}>{selectedIds.length} vehicle(s) selected</Text>
            <Text style={styles.bulkActionSub}>(Max 10 at a time)</Text>
          </View>
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitMutation.isPending}>
            {submitMutation.isPending ? <ActivityIndicator size="small" color="#fff" /> : <Camera size={14} color="#fff" />}
            <Text style={styles.submitBtnText}>Submit</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderItem = ({ item }) => {
    const isSelected = selectedIds.includes(item.vehicleId);
    return (
      <View style={[styles.cardWrapper, isSelected && { shadowColor: '#E1306C', shadowOpacity: 0.2 }]}>
        <View style={[styles.itemCard, isSelected && { borderColor: '#E1306C', borderWidth: 1.5 }]}>
          <View style={styles.itemCardHeader}>
            <TouchableOpacity onPress={() => item.selectable && handleSelectOne(item.vehicleId)} disabled={!item.selectable} style={{ paddingRight: 12, paddingTop: 4 }}>
              {isSelected ? <CheckSquare size={22} color={!item.selectable ? "#cbd5e1" : "#E1306C"} /> : <Square size={22} color={!item.selectable ? "#cbd5e1" : "#94a3b8"} />}
            </TouchableOpacity>
            
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
              <Image source={{ uri: item.primaryImageUrl || FALLBACK_IMG }} style={styles.vehicleImage} />
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={styles.vehicleTitle} numberOfLines={1}>{item.registrationYear} {item.brand} {item.model}</Text>
                <Text style={styles.vehicleSub}>{item.variant}</Text>
                <Text style={styles.vehiclePrice}>{item.askingPrice ? formatINR(item.askingPrice) : '—'}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.statusGrid}>
            <View style={[styles.statusCol, { backgroundColor: '#f8fafc', padding: 10, borderRadius: 8 }]}>
              <Text style={styles.statusLabel}>Approval</Text>
              {renderApprovalStatus(item)}
            </View>
            <View style={[styles.statusCol, { backgroundColor: '#f8fafc', padding: 10, borderRadius: 8 }]}>
              <Text style={styles.statusLabel}>Publishing</Text>
              {renderPublishStatus(item)}
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScreenWrapper layoutType="dealer" scrollEnabled={false}>
      <View style={styles.container}>
        {renderHeader()}
        <FlatList
          data={filteredVehicles}
          keyExtractor={(item) => item.vehicleId.toString()}
          renderItem={renderItem}
          ListEmptyComponent={
            isLoading ? (
              <ActivityIndicator size="large" color="#E1306C" style={{ marginTop: 40 }} />
            ) : (
              <Text style={styles.emptyText}>No matching vehicles found.</Text>
            )
          }
          contentContainerStyle={styles.listContent}
        />
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
  headerContainer: { paddingHorizontal: 16, paddingTop: 16, marginBottom: 0, backgroundColor: '#f8fafc' },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#0f172a' },
  subtitle: { fontSize: 14, color: '#64748b', marginBottom: 16 },
  refreshButton: { padding: 8, backgroundColor: 'white', borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  statCard: { width: '48%', backgroundColor: 'white', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  statLabel: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#0f172a', marginTop: 4 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 12, height: 44, marginBottom: 12 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: '100%', fontSize: 14 },
  filtersContainer: { flexDirection: 'row', marginBottom: 16, height: 40 },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: 'white', marginRight: 8, height: 36, justifyContent: 'center' },
  filterBtnActive: { backgroundColor: '#0f172a', borderColor: '#0f172a' },
  filterText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  filterTextActive: { color: 'white' },
  bulkActionBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fdf2f8', padding: 12, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#fbcfe8' },
  bulkActionText: { fontSize: 14, fontWeight: '600', color: '#E1306C' },
  bulkActionSub: { fontSize: 11, color: '#64748b', marginTop: 2 },
  submitBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, backgroundColor: '#E1306C' },
  submitBtnText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
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
  rejectReason: { fontSize: 10, color: '#e11d48', marginTop: 4, maxWidth: '100%' },
  emptyText: { textAlign: 'center', marginTop: 32, color: '#64748b', fontSize: 14 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 0.5, alignSelf: 'flex-start' },
  badgeText: { fontSize: 11, fontWeight: '700' },
});
