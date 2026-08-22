import React, { useState } from 'react';
import {  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput  } from 'react-native';
import ScreenWrapper from '../../../components/shared/ScreenWrapper';
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
  Search
} from 'lucide-react-native';
import { useGetAdminInstagramDealerSummary } from '../../../hooks/admin/useAdminInstagram';

export default function AdminInstagramDealerSummary() {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');

  const {
    data: summaries = [],
    isLoading,
    isRefetching,
    refetch,
    error,
  } = useGetAdminInstagramDealerSummary();

  const handleRowClick = (dealerId: number) => {
    navigation.navigate('AdminInstagramDealerRequests', { dealerId });
  };

  const filteredSummaries = summaries.filter((s) =>
    s.dealerBusinessName?.toLowerCase().includes(search.toLowerCase())
  );

  const totalDealers = summaries.length;
  const totalPending = summaries.reduce((acc, curr) => acc + curr.pendingCount, 0);
  const totalPublished = summaries.reduce((acc, curr) => acc + curr.publishedCount, 0);
  const totalFailed = summaries.reduce((acc, curr) => acc + curr.failedCount, 0);

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <AlertCircle size={40} color="#ef4444" />
        <Text style={styles.errorTitle}>Failed to load dealer requests summary</Text>
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
        <View style={styles.titleLeft}>
          <Camera size={28} color="#E1306C" />
          <Text style={styles.title}>Instagram Requests</Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={() => refetch()} disabled={isLoading || isRefetching}>
          <RefreshCw size={20} color="#64748b" />
        </TouchableOpacity>
      </View>
      <Text style={styles.subtitle}>
        Overview of dealer-submitted vehicle publishing requests. Click on any dealer to review and publish.
      </Text>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View>
            <Text style={styles.statLabel}>Dealers</Text>
            {isLoading ? <ActivityIndicator size="small" color="#94a3b8" /> : <Text style={styles.statValue}>{totalDealers}</Text>}
          </View>
          <View style={[styles.iconContainer, { backgroundColor: '#f8fafc' }]}>
            <Inbox size={20} color="#475569" />
          </View>
        </View>

        <View style={styles.statCard}>
          <View>
            <Text style={styles.statLabel}>Pending</Text>
            {isLoading ? <ActivityIndicator size="small" color="#94a3b8" /> : <Text style={[styles.statValue, { color: '#d97706' }]}>{totalPending}</Text>}
          </View>
          <View style={[styles.iconContainer, { backgroundColor: '#fffbeb' }]}>
            <Clock size={20} color="#f59e0b" />
          </View>
        </View>

        <View style={styles.statCard}>
          <View>
            <Text style={styles.statLabel}>Published</Text>
            {isLoading ? <ActivityIndicator size="small" color="#94a3b8" /> : <Text style={[styles.statValue, { color: '#059669' }]}>{totalPublished}</Text>}
          </View>
          <View style={[styles.iconContainer, { backgroundColor: '#ecfdf5' }]}>
            <CheckCircle size={20} color="#10b981" />
          </View>
        </View>

        <View style={styles.statCard}>
          <View>
            <Text style={styles.statLabel}>Failed</Text>
            {isLoading ? <ActivityIndicator size="small" color="#94a3b8" /> : <Text style={[styles.statValue, { color: '#e11d48' }]}>{totalFailed}</Text>}
          </View>
          <View style={[styles.iconContainer, { backgroundColor: '#fff1f2' }]}>
            <AlertCircle size={20} color="#f43f5e" />
          </View>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#94a3b8" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by dealer business name..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

    </View>
  );

  const renderItem = ({ item }) => {
    const initial = item.dealerBusinessName ? item.dealerBusinessName.charAt(0).toUpperCase() : 'D';
    return (
      <TouchableOpacity style={styles.cardWrapper} onPress={() => handleRowClick(item.dealerId)} activeOpacity={0.8}>
        <View style={styles.dealerCard}>
          <View style={styles.dealerCardHeader}>
            <View style={styles.dealerAvatar}>
               <Text style={styles.dealerAvatarText}>{initial}</Text>
            </View>
            <View style={styles.dealerHeaderInfo}>
              <Text style={styles.dealerBusinessName} numberOfLines={1}>
                {item.dealerBusinessName || `Dealer ID: ${item.dealerId}`}
              </Text>
              <Text style={styles.dealerSubtitle}>Review vehicle requests</Text>
            </View>
          </View>
          
          <View style={styles.dealerStatsGrid}>
            <View style={[styles.dealerStatItem, { backgroundColor: item.pendingCount > 0 ? '#fffbeb' : '#f8fafc' }]}>
              <Text style={[styles.dealerStatValue, { color: item.pendingCount > 0 ? '#d97706' : '#94a3b8' }]}>{item.pendingCount}</Text>
              <Text style={[styles.dealerStatLabel, { color: item.pendingCount > 0 ? '#b45309' : '#64748b' }]}>Pending</Text>
            </View>
            <View style={[styles.dealerStatItem, { backgroundColor: item.processingCount > 0 ? '#eff6ff' : '#f8fafc' }]}>
              <Text style={[styles.dealerStatValue, { color: item.processingCount > 0 ? '#2563eb' : '#94a3b8' }]}>{item.processingCount}</Text>
              <Text style={[styles.dealerStatLabel, { color: item.processingCount > 0 ? '#1d4ed8' : '#64748b' }]}>Processing</Text>
            </View>
            <View style={[styles.dealerStatItem, { backgroundColor: item.publishedCount > 0 ? '#ecfdf5' : '#f8fafc' }]}>
              <Text style={[styles.dealerStatValue, { color: item.publishedCount > 0 ? '#059669' : '#94a3b8' }]}>{item.publishedCount}</Text>
              <Text style={[styles.dealerStatLabel, { color: item.publishedCount > 0 ? '#047857' : '#64748b' }]}>Published</Text>
            </View>
            <View style={[styles.dealerStatItem, { backgroundColor: item.failedCount > 0 ? '#fff1f2' : '#f8fafc' }]}>
              <Text style={[styles.dealerStatValue, { color: item.failedCount > 0 ? '#e11d48' : '#94a3b8' }]}>{item.failedCount}</Text>
              <Text style={[styles.dealerStatLabel, { color: item.failedCount > 0 ? '#be123c' : '#64748b' }]}>Failed</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenWrapper layoutType="admin" scrollEnabled={false}>
      <View style={styles.container}>
        {renderHeader()}
        <FlatList
          data={filteredSummaries}
          keyExtractor={(item) => item.dealerId.toString()}
          renderItem={renderItem}
          ListEmptyComponent={
            isLoading ? (
              <ActivityIndicator size="large" color="#E1306C" style={{ marginTop: 40 }} />
            ) : (
              <Text style={styles.emptyText}>No matching dealers found.</Text>
            )
          }
          contentContainerStyle={styles.listContent}
        />
      </View>
    </ScreenWrapper>
  );
}

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
  titleLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0f172a' },
  subtitle: { fontSize: 14, color: '#64748b', marginBottom: 16 },
  refreshButton: { padding: 8, backgroundColor: 'white', borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  statCard: { width: '48%', backgroundColor: 'white', padding: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  statLabel: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#0f172a', marginTop: 4 },
  iconContainer: { padding: 8, borderRadius: 8 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 12, height: 44, marginBottom: 16 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: '100%', fontSize: 14 },
  emptyText: { textAlign: 'center', marginTop: 32, color: '#64748b', fontSize: 14 },
  cardWrapper: {
    marginBottom: 16,
  },
  dealerCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  dealerCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dealerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fdf4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#fae8ff',
  },
  dealerAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#d946ef',
  },
  dealerHeaderInfo: {
    flex: 1,
  },
  dealerBusinessName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  dealerSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  dealerStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  dealerStatItem: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
  },
  dealerStatLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  dealerStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
