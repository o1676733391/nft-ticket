// src/screens/OrganizerProfileScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  useWindowDimensions,
  Switch,
  Alert,
} from 'react-native';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function OrganizerProfileScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const { user, logout } = useAuth();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Đăng xuất', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            });
          }
        },
      ]
    );
  };

  const MenuItem = ({ icon, iconFamily = 'fa5', title, subtitle, onPress, showArrow = true, rightElement }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuIconWrap}>
        {iconFamily === 'fa5' && <FontAwesome5 name={icon} size={18} color="#10b981" />}
        {iconFamily === 'ion' && <Ionicons name={icon} size={20} color="#10b981" />}
        {iconFamily === 'mci' && <MaterialCommunityIcons name={icon} size={20} color="#10b981" />}
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement || (showArrow && (
        <FontAwesome5 name="chevron-right" size={14} color="#6b7280" />
      ))}
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tài khoản</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, isTablet && styles.scrollContentTablet]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <FontAwesome5 name="building" size={32} color="#10b981" />
              </View>
            )}
            <TouchableOpacity style={styles.editAvatarBtn}>
              <FontAwesome5 name="camera" size={12} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.organizerName}>
              {user?.organization_name || user?.organizationName || 'Tên tổ chức'}
            </Text>
            <Text style={styles.organizerEmail}>{user?.email}</Text>
            
            <View style={styles.verifiedBadge}>
              {user?.is_organizer_verified ? (
                <>
                  <FontAwesome5 name="check-circle" size={14} color="#10b981" solid />
                  <Text style={styles.verifiedText}>Đã xác minh</Text>
                </>
              ) : (
                <>
                  <FontAwesome5 name="clock" size={14} color="#f59e0b" />
                  <Text style={[styles.verifiedText, { color: '#f59e0b' }]}>Chờ xác minh</Text>
                </>
              )}
            </View>
          </View>

          <TouchableOpacity style={styles.editProfileBtn}>
            <Text style={styles.editProfileText}>Chỉnh sửa</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Summary */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Sự kiện</Text>
          </View>
          <View style={[styles.statBox, styles.statBoxBorder]}>
            <Text style={styles.statNumber}>1,847</Text>
            <Text style={styles.statLabel}>Vé đã bán</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>458M</Text>
            <Text style={styles.statLabel}>Doanh thu</Text>
          </View>
        </View>

        {/* Menu Sections */}
        <SectionHeader title="Quản lý" />
        <View style={styles.menuSection}>
          <MenuItem
            icon="calendar-alt"
            title="Sự kiện của tôi"
            subtitle="Quản lý tất cả sự kiện"
            onPress={() => navigation.navigate('OrgEvents')}
          />
          <MenuItem
            icon="ticket-alt"
            title="Quản lý vé"
            subtitle="Xem danh sách vé đã bán"
            onPress={() => {}}
          />
          <MenuItem
            icon="chart-line"
            title="Báo cáo & Thống kê"
            subtitle="Xem báo cáo doanh thu"
            onPress={() => {}}
          />
          <MenuItem
            icon="money-bill-wave"
            title="Thanh toán"
            subtitle="Cài đặt phương thức thanh toán"
            onPress={() => {}}
          />
        </View>

        <SectionHeader title="Cài đặt" />
        <View style={styles.menuSection}>
          <MenuItem
            icon="bell"
            title="Thông báo"
            subtitle="Nhận thông báo khi có vé mới"
            showArrow={false}
            rightElement={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#374151', true: '#065f46' }}
                thumbColor={notificationsEnabled ? '#10b981' : '#6b7280'}
              />
            }
          />
          <MenuItem
            icon="envelope"
            iconFamily="fa5"
            title="Thông báo Email"
            subtitle="Gửi báo cáo qua email"
            showArrow={false}
            rightElement={
              <Switch
                value={emailAlerts}
                onValueChange={setEmailAlerts}
                trackColor={{ false: '#374151', true: '#065f46' }}
                thumbColor={emailAlerts ? '#10b981' : '#6b7280'}
              />
            }
          />
          <MenuItem
            icon="shield-alt"
            title="Bảo mật"
            subtitle="Đổi mật khẩu, xác thực 2 bước"
            onPress={() => {}}
          />
          <MenuItem
            icon="language"
            iconFamily="ion"
            title="Ngôn ngữ"
            subtitle="Tiếng Việt"
            onPress={() => {}}
          />
        </View>

        <SectionHeader title="Hỗ trợ" />
        <View style={styles.menuSection}>
          <MenuItem
            icon="question-circle"
            title="Trung tâm trợ giúp"
            onPress={() => {}}
          />
          <MenuItem
            icon="headset"
            iconFamily="mci"
            title="Liên hệ hỗ trợ"
            onPress={() => {}}
          />
          <MenuItem
            icon="file-contract"
            title="Điều khoản sử dụng"
            onPress={() => {}}
          />
          <MenuItem
            icon="info-circle"
            title="Về chúng tôi"
            subtitle="Phiên bản 1.0.0"
            onPress={() => {}}
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>

        {/* Switch to User Mode */}
        <TouchableOpacity 
          style={styles.switchModeBtn}
          onPress={() => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            });
          }}
        >
          <FontAwesome5 name="exchange-alt" size={14} color="#3b82f6" />
          <Text style={styles.switchModeText}>Chuyển sang chế độ người dùng</Text>
        </TouchableOpacity>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },

  // Header
  header: {
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

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  scrollContentTablet: {
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },

  // Profile Card
  profileCard: {
    backgroundColor: '#1f2937',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#1f2937',
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  organizerName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  organizerEmail: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 12,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#065f4620',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  verifiedText: {
    color: '#10b981',
    fontSize: 13,
    fontWeight: '500',
  },
  editProfileBtn: {
    backgroundColor: '#374151',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  editProfileText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#374151',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statBoxBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#374151',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#10b981',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },

  // Section Header
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 8,
  },

  // Menu Section
  menuSection: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#374151',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  menuIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#10b98115',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#6b7280',
  },

  // Logout Button
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1f2937',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: '#ef444430',
    marginBottom: 12,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },

  // Switch Mode
  switchModeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  switchModeText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500',
  },
});
