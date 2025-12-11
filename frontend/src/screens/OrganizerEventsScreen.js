// src/screens/OrganizerEventsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  RefreshControl,
  ActivityIndicator,
  Image,
  TextInput,
} from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import * as mobileApi from '../services/mobileApi';

export default function OrganizerEventsScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const { user } = useAuth();
  
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState('all'); // all, active, draft
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadEvents();
  }, [filter]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      
      const filters = {};
      if (filter !== 'all') {
        filters.status = filter;
      }
      
      const data = await mobileApi.getOrganizerEvents(filters);
      
      // Transform API data to match UI format
      const formattedEvents = (data.events || []).map(event => ({
        id: event.id,
        title: event.title,
        image: event.image_url || 'https://picsum.photos/400/200?random=' + event.id,
        date: new Date(event.start_date).toLocaleDateString('vi-VN'),
        time: new Date(event.start_date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        location: event.location || event.venue || 'Chưa xác định',
        ticketsSold: event.ticketsSold || 0,
        totalTickets: event.totalTickets || 0,
        revenue: event.revenue || 0,
        status: event.is_active ? 'active' : 'draft',
      }));
      
      setEvents(formattedEvents);
    } catch (error) {
      console.error('Load events error:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'draft': return '#f59e0b';
      case 'past': return '#6b7280';
      default: return '#9ca3af';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Đang bán';
      case 'draft': return 'Bản nháp';
      case 'past': return 'Đã kết thúc';
      default: return status;
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesFilter = filter === 'all' || event.status === filter;
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const FilterTab = ({ value, label, count }) => (
    <TouchableOpacity
      style={[styles.filterTab, filter === value && styles.filterTabActive]}
      onPress={() => setFilter(value)}
    >
      <Text style={[styles.filterTabText, filter === value && styles.filterTabTextActive]}>
        {label}
      </Text>
      {count > 0 && (
        <View style={[styles.filterBadge, filter === value && styles.filterBadgeActive]}>
          <Text style={styles.filterBadgeText}>{count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const EventCard = ({ event }) => (
    <TouchableOpacity 
      style={[styles.eventCard, isTablet && styles.eventCardTablet]}
      onPress={() => navigation.navigate('EventDetail', { eventId: event.id })}
      activeOpacity={0.8}
    >
      {/* Event Image */}
      {event.image ? (
        <Image source={{ uri: event.image }} style={styles.eventImage} />
      ) : (
        <Image source={require("../../asset/concert-show-performance.jpg")} style={styles.eventImage} />
      )}
      
      {/* Status Badge */}
      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(event.status) + '20' }]}>
        <View style={[styles.statusDot, { backgroundColor: getStatusColor(event.status) }]} />
        <Text style={[styles.statusText, { color: getStatusColor(event.status) }]}>
          {getStatusText(event.status)}
        </Text>
      </View>

      {/* Event Info */}
      <View style={styles.eventInfo}>
        <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>
        
        <View style={styles.eventMeta}>
          <View style={styles.metaRow}>
            <FontAwesome5 name="calendar-alt" size={12} color="#9ca3af" />
            <Text style={styles.metaText}>{event.date} • {event.time}</Text>
          </View>
          <View style={styles.metaRow}>
            <FontAwesome5 name="map-marker-alt" size={12} color="#9ca3af" />
            <Text style={styles.metaText} numberOfLines={1}>{event.location}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.eventStatsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Vé đã bán</Text>
            <Text style={styles.statValue}>{event.ticketsSold}/{event.totalTickets}</Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${(event.ticketsSold / event.totalTickets) * 100}%` }
                ]} 
              />
            </View>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Doanh thu</Text>
            <Text style={styles.statValueGreen}>{formatCurrency(event.revenue)}</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.eventActions}>
          <TouchableOpacity style={styles.actionBtn}>
            <FontAwesome5 name="edit" size={14} color="#10b981" />
            <Text style={styles.actionBtnText}>Chỉnh sửa</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <FontAwesome5 name="chart-bar" size={14} color="#3b82f6" />
            <Text style={[styles.actionBtnText, { color: '#3b82f6' }]}>Thống kê</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <FontAwesome5 name="qrcode" size={14} color="#8b5cf6" />
            <Text style={[styles.actionBtnText, { color: '#8b5cf6' }]}>Check-in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.loadingText}>Đang tải sự kiện...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sự kiện của tôi</Text>
        <TouchableOpacity 
          style={styles.createBtn}
          onPress={() => navigation.navigate('OrgCreate')}
        >
          <FontAwesome5 name="plus" size={14} color="#fff" />
          <Text style={styles.createBtnText}>Tạo mới</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm sự kiện..."
            placeholderTextColor="#6b7280"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <FilterTab value="all" label="Tất cả" count={events.length} />
          <FilterTab value="active" label="Đang bán" count={events.filter(e => e.status === 'active').length} />
          <FilterTab value="draft" label="Bản nháp" count={events.filter(e => e.status === 'draft').length} />
          <FilterTab value="past" label="Đã kết thúc" count={events.filter(e => e.status === 'past').length} />
        </ScrollView>
      </View>

      {/* Events List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          isTablet && styles.scrollContentTablet
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#10b981"
            colors={['#10b981']}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredEvents.length === 0 ? (
          <View style={styles.emptyState}>
            <FontAwesome5 name="calendar-times" size={48} color="#374151" />
            <Text style={styles.emptyTitle}>Chưa có sự kiện nào</Text>
            <Text style={styles.emptyText}>
              {filter !== 'all' ? 'Không có sự kiện nào trong danh mục này' : 'Tạo sự kiện đầu tiên của bạn ngay!'}
            </Text>
            <TouchableOpacity 
              style={styles.emptyBtn}
              onPress={() => navigation.navigate('OrgCreate')}
            >
              <FontAwesome5 name="plus" size={14} color="#fff" />
              <Text style={styles.emptyBtnText}>Tạo sự kiện</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.eventsGrid, isTablet && styles.eventsGridTablet]}>
            {filteredEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#9ca3af',
    marginTop: 12,
    fontSize: 14,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#1f2937',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  createBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },

  // Search
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1f2937',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 15,
  },

  // Filter
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#1f2937',
    gap: 6,
  },
  filterTabActive: {
    backgroundColor: '#10b981',
  },
  filterTabText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: '#ffffff',
  },
  filterBadge: {
    backgroundColor: '#374151',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  filterBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  filterBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  scrollContentTablet: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },

  // Events Grid
  eventsGrid: {
    gap: 16,
  },
  eventsGridTablet: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },

  // Event Card
  eventCard: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#374151',
  },
  eventCardTablet: {
    width: '48%',
  },
  eventImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#374151',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  eventInfo: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
    lineHeight: 22,
  },
  eventMeta: {
    gap: 8,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    color: '#9ca3af',
    fontSize: 13,
    flex: 1,
  },

  // Stats
  eventStatsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  statBox: {
    flex: 1,
  },
  statLabel: {
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  statValueGreen: {
    color: '#10b981',
    fontSize: 15,
    fontWeight: '600',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 2,
  },

  // Actions
  eventActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#374151',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  actionBtnText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '500',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  emptyBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});
