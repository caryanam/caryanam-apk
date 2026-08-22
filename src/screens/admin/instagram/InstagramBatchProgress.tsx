import React from 'react';
import {  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator  } from 'react-native';
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
  useGetAdminInstagramBatchStatus,
  useAdminRetryFailedInstagramPublish,
} from '../../../hooks/admin/useAdminInstagram';

export default function AdminInstagramBatchProgress() {
  const route = useRoute();
  const navigation = useNavigation();
  const { batchId } = route.params as { batchId: string | number };
  const parsedBatchId = batchId ? Number(batchId) : 0;

  const {
    data: batch,
    isLoading,
    isRefetching,
    refetch,
    error,
  } = useGetAdminInstagramBatchStatus(parsedBatchId);

  const retryMutation = useAdminRetryFailedInstagramPublish(parsedBatchId);

  const handleRetryFailed = () => {
    if (!parsedBatchId) return;
    retryMutation.mutate({ batchId: parsedBatchId }, {
      onSuccess: () => refetch()
    });
  };

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <AlertCircle size={40} color="#ef4444" />
        <Text style={styles.errorTitle}>Failed to load batch status</Text>
        <Text style={styles.errorText}>{error.message}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <RefreshCw size={16} color="white" />
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const total = batch?.totalCount || 0;
  const success = batch?.successCount || 0;
  const failed = batch?.failedCount || 0;
  const pending = batch?.pendingCount || 0;
  const progressPercent = total > 0 ? ((success + failed) / total) * 100 : 0;

  const isBatchActive = batch?.status === 'QUEUED' || batch?.status === 'PROCESSING';
  const hasFailedItems = failed > 0;

  const renderBatchStatusBadge = (status: string) => {
    switch (status) {
      case 'QUEUED': return <Badge label="Queued" icon={Clock} color="#0e7490" bg="#cffafe" />;
      case 'PROCESSING': return <Badge label="Processing" icon={Loader} color="#1d4ed8" bg="#dbeafe" />;
      case 'COMPLETED': return <Badge label="Completed" icon={CheckCircle} color="#10b981" bg="#ecfdf5" />;
      case 'PARTIALLY_COMPLETED': return <Badge label="Partially Completed" icon={CheckCircle} color="#b45309" bg="#fef3c7" />;
      case 'FAILED': return <Badge label="Failed" icon={XCircle} color="#e11d48" bg="#fff1f2" />;
      default: return null;
    }
  };

  const renderItemStatusBadge = (status: string) => {
    switch (status) {
      case 'QUEUED': return <Badge label="Queued" icon={Clock} color="#0e7490" bg="#cffafe" />;
      case 'PROCESSING': return <Badge label="Processing" icon={Loader} color="#1d4ed8" bg="#dbeafe" />;
      case 'RETRY_SCHEDULED': return <Badge label="Retry Scheduled" icon={Clock} color="#c2410c" bg="#ffedd5" />;
      case 'PUBLISHED': return <Badge label="Published" icon={CheckCircle} color="#10b981" bg="#ecfdf5" />;
      case 'FAILED': return <Badge label="Failed" icon={AlertCircle} color="#e11d48" bg="#fff1f2" />;
      default: return <Badge label="Pending" color="#64748b" bg="#f1f5f9" />;
    }
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} disabled={isBatchActive}>
        <ChevronLeft size={16} color={isBatchActive ? "#cbd5e1" : "#64748b"} />
        <Text style={[styles.backButtonText, isBatchActive && { color: '#cbd5e1' }]}>Back to Requests</Text>
      </TouchableOpacity>

      <View style={styles.titleRow}>
        <View style={{ flex: 1 }}>
          <View style={styles.titleLeft}>
            <Camera size={24} color="#E1306C" />
            <Text style={styles.title}>Batch Publishing</Text>
          </View>
          <Text style={styles.subtitle}>
            Live monitoring of Instagram auto-posts for Batch ID: #{parsedBatchId}.
          </Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={() => refetch()} disabled={isLoading || isRefetching}>
          <RefreshCw size={20} color="#64748b" />
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Publishing Status</Text>
          {batch && renderBatchStatusBadge(batch.status)}
        </View>
        
        <View style={styles.cardContent}>
          {isLoading && !batch ? (
            <ActivityIndicator size="small" color="#E1306C" />
          ) : (
            <>
              <View style={styles.progressHeader}>
                <Text style={styles.progressText}>Progress ({success + failed} of {total} processed)</Text>
                <Text style={styles.progressPercent}>{Math.round(progressPercent)}%</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
              </View>

              <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                  <Text style={styles.statBoxLabel}>Total</Text>
                  <Text style={styles.statBoxValue}>{total}</Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: '#fffbeb' }]}>
                  <Text style={[styles.statBoxLabel, { color: '#d97706' }]}>Pending</Text>
                  <Text style={[styles.statBoxValue, { color: '#b45309' }]}>{pending}</Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: '#ecfdf5' }]}>
                  <Text style={[styles.statBoxLabel, { color: '#059669' }]}>Success</Text>
                  <Text style={[styles.statBoxValue, { color: '#047857' }]}>{success}</Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: '#fff1f2' }]}>
                  <Text style={[styles.statBoxLabel, { color: '#e11d48' }]}>Failed</Text>
                  <Text style={[styles.statBoxValue, { color: '#be123c' }]}>{failed}</Text>
                </View>
              </View>

              {!isBatchActive && hasFailedItems && (
                <View style={styles.retrySection}>
                  <Text style={styles.retryText}>Failed items can be retried.</Text>
                  <TouchableOpacity style={styles.retryItemsBtn} onPress={handleRetryFailed} disabled={retryMutation.isPending}>
                    {retryMutation.isPending ? <ActivityIndicator size="small" color="#fff" /> : <RefreshCw size={14} color="#fff" />}
                    <Text style={styles.retryItemsBtnText}>Retry Failed</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>
      </View>

      <Text style={styles.sectionTitle}>Batch Items Details</Text>
      
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.cardWrapper}>
      <View style={styles.itemCard}>
        <View style={styles.itemHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemName} numberOfLines={1}>{item.vehicleName || `ID: ${item.vehicleId}`}</Text>
            <Text style={styles.itemSub}>Req: #{item.requestId}</Text>
          </View>
          <View style={styles.retryBadge}>
            <Text style={styles.retryBadgeText}>{item.retryCount} / 3 Retries</Text>
          </View>
        </View>
        <View style={[styles.itemStatusRow, { backgroundColor: '#f8fafc', padding: 10, borderRadius: 8 }]}>
          {renderItemStatusBadge(item.status)}
        </View>
        {item.errorMessage ? (
          <View style={styles.errorBox}>
            <AlertCircle size={14} color="#e11d48" style={{ marginRight: 6, marginTop: 2 }} />
            <Text style={styles.itemError} numberOfLines={3}>{item.errorMessage}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );

  return (
    <ScreenWrapper layoutType="admin" scrollEnabled={false}>
      <View style={styles.container}>
      <FlatList
        data={batch?.items || []}
        keyExtractor={(item) => item.requestId.toString()}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          isLoading && !batch ? null : (
            <Text style={styles.emptyText}>No items in this batch.</Text>
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
  headerContainer: { marginBottom: 16 },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  backButtonText: { fontSize: 12, fontWeight: '600', color: '#64748b', marginLeft: 4 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  titleLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0f172a' },
  subtitle: { fontSize: 14, color: '#64748b' },
  refreshButton: { padding: 8, backgroundColor: 'white', borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0', marginLeft: 16 },
  card: { backgroundColor: 'white', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 24 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', backgroundColor: '#f8fafc', borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
  cardContent: { padding: 16 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  progressPercent: { fontSize: 12, fontWeight: 'bold', color: '#0f172a' },
  progressBarBg: { height: 10, backgroundColor: '#f1f5f9', borderRadius: 5, overflow: 'hidden', marginBottom: 20 },
  progressBarFill: { height: '100%', backgroundColor: '#E1306C' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statBox: { flex: 1, minWidth: '45%', backgroundColor: '#f8fafc', padding: 12, borderRadius: 8, alignItems: 'center' },
  statBoxLabel: { fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b' },
  statBoxValue: { fontSize: 20, fontWeight: 'bold', color: '#0f172a', marginTop: 4 },
  retrySection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  retryText: { fontSize: 13, color: '#64748b', flex: 1, marginRight: 8 },
  retryItemsBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E1306C', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, gap: 6 },
  retryItemsBtnText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginBottom: 12 },
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
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemName: { fontSize: 15, fontWeight: 'bold', color: '#0f172a' },
  itemSub: { fontSize: 13, color: '#64748b', marginTop: 4 },
  itemStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  retryBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  retryBadgeText: { fontSize: 11, color: '#475569', fontWeight: '600' },
  errorBox: {
    flexDirection: 'row',
    backgroundColor: '#fff1f2',
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#ffe4e6',
  },
  itemError: { flex: 1, fontSize: 12, color: '#e11d48' },
  emptyText: { textAlign: 'center', marginTop: 32, color: '#64748b', fontSize: 14 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 0.5, alignSelf: 'flex-start' },
  badgeText: { fontSize: 11, fontWeight: '700' },
});
