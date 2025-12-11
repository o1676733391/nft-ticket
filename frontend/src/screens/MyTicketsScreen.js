// src/screens/MyTicketsScreen.js
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import * as mobileApi from "../services/mobileApi";

export default function MyTicketsScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const { user, isAuthenticated } = useAuth();
  
  const [activeTab, setActiveTab] = useState("all");
  const [subTab, setSubTab] = useState("upcoming");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTickets = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    
    try {
      const filters = {};
      
      // Map tab to status
      if (activeTab === 'success') filters.status = 'valid';
      else if (activeTab === 'processing') filters.status = 'pending';
      else if (activeTab === 'cancelled') filters.status = 'cancelled';
      
      // Upcoming filter
      if (subTab === 'upcoming') filters.upcoming = true;
      
      const data = await mobileApi.getMyTickets(filters);
      setTickets(data.tickets || data || []);
    } catch (error) {
      console.error('Load tickets error:', error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, activeTab, subTab]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTickets();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'valid': return '#10b981';
      case 'used': return '#6b7280';
      case 'cancelled': return '#ef4444';
      case 'expired': return '#f59e0b';
      default: return '#3b82f6';
    }
  };

  const getStatusText = (status, isCheckedIn) => {
    if (isCheckedIn) return 'Đã sử dụng';
    switch (status) {
      case 'valid': return 'Hợp lệ';
      case 'used': return 'Đã sử dụng';
      case 'cancelled': return 'Đã hủy';
      case 'expired': return 'Hết hạn';
      default: return status;
    }
  };

  // Ticket Card Component
  const TicketCard = ({ ticket }) => {
    const event = ticket.events;
    const template = ticket.ticket_templates;
    
    return (
      <TouchableOpacity 
        style={styles.ticketCard}
        onPress={() => navigation.navigate('TicketDetail', { ticket })}
        activeOpacity={0.8}
      >
        {/* Event Image */}
        <Image
          source={
            event?.banner_url 
              ? { uri: event.banner_url }
              : require("../../asset/concert-show-performance.jpg")
          }
          style={styles.ticketImage}
        />
        
        {/* Ticket Info */}
        <View style={styles.ticketInfo}>
          <View style={styles.ticketHeader}>
            <Text style={styles.ticketTitle} numberOfLines={2}>
              {event?.title || 'Sự kiện'}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticket.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(ticket.status) }]}>
                {getStatusText(ticket.status, ticket.is_checked_in)}
              </Text>
            </View>
          </View>
          
          <View style={styles.ticketMeta}>
            <View style={styles.metaRow}>
              <FontAwesome5 name="calendar-alt" size={12} color="#9ca3af" />
              <Text style={styles.metaText}>
                {formatDate(event?.start_date)}
              </Text>
            </View>
            
            <View style={styles.metaRow}>
              <FontAwesome5 name="clock" size={12} color="#9ca3af" />
              <Text style={styles.metaText}>
                {formatTime(event?.start_date)}
              </Text>
            </View>
            
            <View style={styles.metaRow}>
              <FontAwesome5 name="map-marker-alt" size={12} color="#9ca3af" />
              <Text style={styles.metaText} numberOfLines={1}>
                {event?.venue_name || event?.location || 'N/A'}
              </Text>
            </View>
          </View>
          
          <View style={styles.ticketFooter}>
            <View style={styles.ticketType}>
              <MaterialCommunityIcons name="ticket-confirmation" size={16} color="#10b981" />
              <Text style={styles.ticketTypeText}>
                {template?.name || 'Vé thường'} • {template?.tier || 'Standard'}
              </Text>
            </View>
            
            <Text style={styles.ticketCode}>{ticket.ticket_code}</Text>
          </View>
        </View>
        
        {/* QR Icon */}
        <TouchableOpacity 
          style={styles.qrButton}
          onPress={() => navigation.navigate('TicketDetail', { ticket })}
        >
          <MaterialCommunityIcons name="qrcode" size={28} color="#10b981" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  // Not logged in state
  if (!isAuthenticated) {
    return (
      <View style={styles.screen}>
        <Header />
        <View style={styles.centerContainer}>
          <FontAwesome5 name="ticket-alt" size={60} color="#374151" />
          <Text style={styles.emptyTitle}>Đăng nhập để xem vé</Text>
          <Text style={styles.emptyTextCenter}>
            Vui lòng đăng nhập để xem danh sách vé của bạn
          </Text>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={styles.loginBtnText}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Header />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
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
        {/* Page Header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Vé của tôi</Text>
          <Text style={styles.pageSubtitle}>
            {tickets.length} vé
          </Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.tabsRow}>
              {[
                { key: "all", label: "Tất cả", icon: "layers" },
                { key: "success", label: "Hợp lệ", icon: "checkmark-circle" },
                { key: "processing", label: "Đang xử lý", icon: "time" },
                { key: "cancelled", label: "Đã hủy", icon: "close-circle" },
              ].map((item) => (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.tab,
                    activeTab === item.key && styles.tabActive,
                  ]}
                  onPress={() => setActiveTab(item.key)}
                >
                  <Ionicons 
                    name={item.icon} 
                    size={16} 
                    color={activeTab === item.key ? '#10b981' : '#9ca3af'} 
                  />
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === item.key && styles.tabTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Sub Tabs */}
        <View style={styles.subTabsRow}>
          <TouchableOpacity 
            style={[styles.subTab, subTab === 'upcoming' && styles.subTabActive]}
            onPress={() => setSubTab("upcoming")}
          >
            <Text style={[styles.subTabText, subTab === 'upcoming' && styles.subTabTextActive]}>
              Sắp diễn ra
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.subTab, subTab === 'finished' && styles.subTabActive]}
            onPress={() => setSubTab("finished")}
          >
            <Text style={[styles.subTabText, subTab === 'finished' && styles.subTabTextActive]}>
              Đã kết thúc
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#10b981" />
            <Text style={styles.loadingText}>Đang tải vé...</Text>
          </View>
        ) : tickets.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FontAwesome5 name="ticket-alt" size={60} color="#374151" />
            <Text style={styles.emptyTitle}>Chưa có vé nào</Text>
            <Text style={styles.emptyTextCenter}>
              Hãy mua vé để tham gia các sự kiện thú vị!
            </Text>
            <TouchableOpacity
              style={styles.buyBtn}
              onPress={() => navigation.navigate("Home")}
            >
              <Text style={styles.buyBtnText}>Khám phá sự kiện</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.ticketsList}>
            {tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { 
    flex: 1, 
    backgroundColor: "#111827" 
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  
  // Page Header
  pageHeader: {
    marginTop: 20,
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  
  // Tabs
  tabsContainer: {
    marginBottom: 16,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#1f2937',
    borderWidth: 1,
    borderColor: '#374151',
  },
  tabActive: {
    backgroundColor: '#10b98120',
    borderColor: '#10b981',
  },
  tabText: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#10b981',
  },
  
  // Sub Tabs
  subTabsRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  subTab: {
    paddingBottom: 8,
  },
  subTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#10b981',
  },
  subTabText: {
    fontSize: 15,
    color: '#9ca3af',
    fontWeight: '500',
  },
  subTabTextActive: {
    color: '#10b981',
  },
  
  // Loading
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#9ca3af',
  },
  
  // Empty State
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 20,
  },
  emptyTextCenter: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
  },
  loginBtn: {
    marginTop: 24,
    backgroundColor: '#10b981',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  loginBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  buyBtn: {
    marginTop: 24,
    backgroundColor: '#10b981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  buyBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  
  // Tickets List
  ticketsList: {
    gap: 16,
  },
  ticketCard: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#374151',
    marginBottom: 16,
  },
  ticketImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#374151',
  },
  ticketInfo: {
    padding: 16,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  ticketTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  ticketMeta: {
    gap: 8,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 13,
    color: '#d1d5db',
    flex: 1,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  ticketType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ticketTypeText: {
    fontSize: 13,
    color: '#10b981',
    fontWeight: '500',
  },
  ticketCode: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'monospace',
  },
  qrButton: {
    position: 'absolute',
    right: 16,
    top: 150,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1f2937',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#10b981',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});
