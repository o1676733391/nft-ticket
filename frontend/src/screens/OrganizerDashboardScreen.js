// src/screens/OrganizerDashboardScreen.js
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
} from 'react-native';
import { FontAwesome5, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import OrganizerHeader from '../components/OrganizerHeader';
import { useAuth } from '../context/AuthContext';
import * as mobileApi from '../services/mobileApi';

export default function OrganizerDashboardScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const { user, logout } = useAuth();
  
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalTicketsSold: 0,
    totalRevenue: 0,
    upcomingEvents: 0,
  });
  const [recentEvents, setRecentEvents] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await mobileApi.getOrganizerDashboard();
      
      setStats(data.stats);
      setRecentEvents(data.recentEvents || []);
    } catch (err) {
      console.error('Load dashboard error:', err);
      setError('Không thể tải dữ liệu. Vui lòng thử lại.');
      // Set empty data on error
      setStats({
        totalEvents: 0,
        totalTicketsSold: 0,
        totalRevenue: 0,
        upcomingEvents: 0,
      });
      setRecentEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleLogout = async () => {
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  const StatCard = ({ icon, iconFamily, title, value, color, bgColor }) => (
    <View style={[styles.statCard, isTablet && styles.statCardTablet]}>
      <View style={[styles.statCardInner, { backgroundColor: bgColor }]}>
        <View style={[styles.statIconWrap, { backgroundColor: color + '30' }]}>
          {iconFamily === 'fa5' && (
            <FontAwesome5 name={icon} size={20} color={color} />
          )}
          {iconFamily === 'mci' && (
            <MaterialCommunityIcons name={icon} size={24} color={color} />
          )}
          {iconFamily === 'ion' && (
            <Ionicons name={icon} size={24} color={color} />
          )}
        </View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  );

  const QuickAction = ({ icon, title, onPress, color }) => (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: color + '20' }]}>
        <FontAwesome5 name={icon} size={18} color={color} />
      </View>
      <Text style={styles.quickActionText}>{title}</Text>
    </TouchableOpacity>
  );

  const EventCard = ({ event }) => (
    <TouchableOpacity 
      style={styles.eventCard}
      onPress={() => navigation.navigate('EventDetail', { eventId: event.id })}
    >
      <View style={styles.eventCardHeader}>
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle} numberOfLines={1}>{event.title}</Text>
          <View style={styles.eventDateRow}>
            <FontAwesome5 name="calendar-alt" size={12} color="#9ca3af" />
            <Text style={styles.eventDate}>{event.date}</Text>
          </View>
        </View>
        <View style={[
          styles.eventStatus, 
          event.status === 'active' ? styles.statusActive : styles.statusDraft
        ]}>
          <Text style={[
            styles.eventStatusText,
            event.status === 'active' ? styles.statusActiveText : styles.statusDraftText
          ]}>
            {event.status === 'active' ? 'Đang bán' : 'Nháp'}
          </Text>
        </View>
      </View>
      
      <View style={styles.eventStats}>
        <View style={styles.eventStatItem}>
          <Text style={styles.eventStatLabel}>Vé đã bán</Text>
          <Text style={styles.eventStatValue}>
            {event.ticketsSold}/{event.totalTickets}
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(event.ticketsSold / event.totalTickets) * 100}%` }
              ]} 
            />
          </View>
        </View>
        <View style={styles.eventStatItem}>
          <Text style={styles.eventStatLabel}>Doanh thu</Text>
          <Text style={styles.eventStatValueGreen}>
            {formatCurrency(event.revenue)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <OrganizerHeader title="Tổng quan" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <OrganizerHeader title="Tổng quan" />
      
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
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeLeft}>
            <Text style={styles.welcomeText}>Xin chào,</Text>
            <Text style={styles.organizerName}>
              {user?.organizationName || user?.fullName || 'Organizer'}
            </Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={[styles.statsGrid, isTablet && styles.statsGridTablet]}>
          <StatCard
            icon="calendar-check"
            iconFamily="fa5"
            title="Tổng sự kiện"
            value={stats.totalEvents}
            color="#3b82f6"
            bgColor="#1e3a5f"
          />
          <StatCard
            icon="ticket-alt"
            iconFamily="fa5"
            title="Vé đã bán"
            value={stats.totalTicketsSold.toLocaleString()}
            color="#10b981"
            bgColor="#134e4a"
          />
          <StatCard
            icon="cash"
            iconFamily="ion"
            title="Doanh thu"
            value={formatCurrency(stats.totalRevenue)}
            color="#f59e0b"
            bgColor="#451a03"
          />
          <StatCard
            icon="clock"
            iconFamily="fa5"
            title="Sắp diễn ra"
            value={stats.upcomingEvents}
            color="#8b5cf6"
            bgColor="#3b0764"
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
          <View style={[styles.quickActionsGrid, isTablet && styles.quickActionsGridTablet]}>
            <QuickAction
              icon="plus"
              title="Tạo sự kiện"
              color="#10b981"
              onPress={() => navigation.navigate('CreateEvent')}
            />
            <QuickAction
              icon="qrcode"
              title="Quét vé"
              color="#3b82f6"
              onPress={() => {/* TODO: Navigate to scanner */}}
            />
            <QuickAction
              icon="chart-bar"
              title="Báo cáo"
              color="#f59e0b"
              onPress={() => {/* TODO: Navigate to reports */}}
            />
            <QuickAction
              icon="cog"
              title="Cài đặt"
              color="#8b5cf6"
              onPress={() => navigation.navigate('Profile')}
            />
          </View>
        </View>

        {/* Recent Events */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sự kiện gần đây</Text>
            <TouchableOpacity onPress={() => {/* TODO: View all */}}>
              <Text style={styles.viewAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.eventsList}>
            {recentEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </View>
        </View>

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <View style={styles.tipCard}>
            <View style={styles.tipIconWrap}>
              <FontAwesome5 name="lightbulb" size={24} color="#fbbf24" />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Mẹo tăng doanh số</Text>
              <Text style={styles.tipText}>
                Thêm hình ảnh chất lượng cao và mô tả chi tiết để thu hút người tham dự!
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom Spacing */}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  scrollContentTablet: {
    paddingHorizontal: 32,
    maxWidth: 1000,
    alignSelf: 'center',
    width: '100%',
  },
  
  // Welcome Section
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeLeft: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  organizerName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 4,
  },
  logoutBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1f2937',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 24,
  },
  statsGridTablet: {
    marginHorizontal: -8,
  },
  statCard: {
    width: '50%',
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  statCardTablet: {
    width: '25%',
    paddingHorizontal: 8,
  },
  statCardInner: {
    borderRadius: 16,
    padding: 16,
  },
  statIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 13,
    color: '#9ca3af',
  },
  
  // Section
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500',
  },
  
  // Quick Actions
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  quickActionsGridTablet: {
    marginHorizontal: -8,
  },
  quickAction: {
    width: '25%',
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: '#e5e7eb',
    textAlign: 'center',
  },
  
  // Events List
  eventsList: {
    gap: 12,
  },
  eventCard: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  eventCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  eventInfo: {
    flex: 1,
    marginRight: 12,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 6,
  },
  eventDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventDate: {
    fontSize: 13,
    color: '#9ca3af',
  },
  eventStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusActive: {
    backgroundColor: '#065f4620',
  },
  statusDraft: {
    backgroundColor: '#374151',
  },
  eventStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusActiveText: {
    color: '#10b981',
  },
  statusDraftText: {
    color: '#9ca3af',
  },
  eventStats: {
    flexDirection: 'row',
    gap: 24,
  },
  eventStatItem: {
    flex: 1,
  },
  eventStatLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  eventStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 6,
  },
  eventStatValueGreen: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
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
  
  // Tips Section
  tipsSection: {
    marginBottom: 24,
  },
  tipCard: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#065f46',
  },
  tipIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 13,
    color: '#d1d5db',
    lineHeight: 18,
  },
});
