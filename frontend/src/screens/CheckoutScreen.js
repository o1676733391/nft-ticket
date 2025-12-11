import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
  TextInput,
} from 'react-native';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import checkoutApi from '../services/checkoutApi';

export default function CheckoutScreen({ route, navigation }) {
  const { width } = useWindowDimensions();
  const { user, isAuthenticated } = useAuth();
  const { event, template, quantity = 1 } = route.params || {};
  
  const [loading, setLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('card');
  const [orderQuantity, setOrderQuantity] = useState(quantity);
  const [promoCode, setPromoCode] = useState('');

  const unitPrice = Number(template?.price || 0);
  const totalAmount = unitPrice * orderQuantity;
  const serviceFee = totalAmount * 0.05; // 5% service fee
  const grandTotal = totalAmount + serviceFee;

  const paymentMethods = [
    { id: 'card', name: 'Thẻ tín dụng/Ghi nợ', icon: 'credit-card', iconFamily: 'fa5' },
    { id: 'momo', name: 'Ví MoMo', icon: 'wallet', iconFamily: 'ion', color: '#a50064' },
    { id: 'zalopay', name: 'ZaloPay', icon: 'wallet', iconFamily: 'ion', color: '#0068ff' },
    { id: 'vnpay', name: 'VNPAY', icon: 'wallet', iconFamily: 'ion', color: '#005baa' },
    { id: 'bank_transfer', name: 'Chuyển khoản ngân hàng', icon: 'university', iconFamily: 'fa5' },
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleQuantityChange = (delta) => {
    const newQty = orderQuantity + delta;
    const available = (template?.supply || 0) - (template?.sold || 0);
    if (newQty >= 1 && newQty <= Math.min(available, 10)) {
      setOrderQuantity(newQty);
    }
  };

  const handleCheckout = async () => {
    if (!isAuthenticated || !user?.id) {
      Alert.alert('Đăng nhập', 'Vui lòng đăng nhập để mua vé', [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đăng nhập', onPress: () => navigation.navigate('Home') },
      ]);
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        userId: user.id,
        eventId: event.id,
        templateId: template.id,
        quantity: orderQuantity,
        paymentMethod: selectedPayment,
        promoCode: promoCode.trim() || null,
      };

      const response = await checkoutApi.createOrder(orderData);

      if (response.success) {
        Alert.alert(
          '🎉 Đặt vé thành công!',
          `Bạn đã mua ${orderQuantity} vé ${template.name} cho sự kiện "${event.title}"`,
          [
            {
              text: 'Xem vé của tôi',
              onPress: () => navigation.navigate('MyTickets'),
            },
            {
              text: 'Tiếp tục khám phá',
              onPress: () => navigation.navigate('Home'),
            },
          ]
        );
      } else {
        Alert.alert('Lỗi', response.message || 'Không thể hoàn tất đơn hàng');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      Alert.alert(
        'Lỗi',
        error.message || 'Không thể hoàn tất đơn hàng. Vui lòng thử lại.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!event || !template) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <FontAwesome5 name="exclamation-circle" size={60} color="#ef4444" />
          <Text style={styles.errorTitle}>Lỗi</Text>
          <Text style={styles.errorText}>Không tìm thấy thông tin vé</Text>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backBtnText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Event Info Card */}
        <View style={styles.eventCard}>
          <Image
            source={
              event.banner_url
                ? { uri: event.banner_url }
                : require('../../asset/concert-show-performance.jpg')
            }
            style={styles.eventImage}
          />
          <View style={styles.eventInfo}>
            <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>
            <View style={styles.eventMeta}>
              <FontAwesome5 name="calendar-alt" size={12} color="#9ca3af" />
              <Text style={styles.eventMetaText}>{formatDate(event.start_date)}</Text>
            </View>
            <View style={styles.eventMeta}>
              <FontAwesome5 name="map-marker-alt" size={12} color="#9ca3af" />
              <Text style={styles.eventMetaText} numberOfLines={1}>
                {event.venue_name || event.location}
              </Text>
            </View>
          </View>
        </View>

        {/* Ticket Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Loại vé</Text>
          <View style={styles.ticketCard}>
            <View style={styles.ticketInfo}>
              <Text style={styles.ticketName}>{template.name}</Text>
              <Text style={styles.ticketTier}>{template.tier || 'Standard'}</Text>
              {template.benefits && (
                <Text style={styles.ticketBenefits} numberOfLines={2}>
                  {template.benefits}
                </Text>
              )}
            </View>
            <Text style={styles.ticketPrice}>{formatCurrency(unitPrice)}</Text>
          </View>

          {/* Quantity Selector */}
          <View style={styles.quantityRow}>
            <Text style={styles.quantityLabel}>Số lượng</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity
                style={[styles.qtyBtn, orderQuantity <= 1 && styles.qtyBtnDisabled]}
                onPress={() => handleQuantityChange(-1)}
                disabled={orderQuantity <= 1}
              >
                <FontAwesome5 name="minus" size={14} color={orderQuantity <= 1 ? '#4b5563' : '#fff'} />
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{orderQuantity}</Text>
              <TouchableOpacity
                style={[styles.qtyBtn, orderQuantity >= 10 && styles.qtyBtnDisabled]}
                onPress={() => handleQuantityChange(1)}
                disabled={orderQuantity >= 10}
              >
                <FontAwesome5 name="plus" size={14} color={orderQuantity >= 10 ? '#4b5563' : '#fff'} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentOption,
                selectedPayment === method.id && styles.paymentOptionActive,
              ]}
              onPress={() => setSelectedPayment(method.id)}
            >
              <View style={styles.paymentLeft}>
                {method.iconFamily === 'fa5' ? (
                  <FontAwesome5
                    name={method.icon}
                    size={20}
                    color={method.color || '#9ca3af'}
                  />
                ) : (
                  <Ionicons
                    name={method.icon}
                    size={22}
                    color={method.color || '#9ca3af'}
                  />
                )}
                <Text style={styles.paymentName}>{method.name}</Text>
              </View>
              <View
                style={[
                  styles.radioOuter,
                  selectedPayment === method.id && styles.radioOuterActive,
                ]}
              >
                {selectedPayment === method.id && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chi tiết đơn hàng</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                {template.name} x {orderQuantity}
              </Text>
              <Text style={styles.summaryValue}>{formatCurrency(totalAmount)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Phí dịch vụ (5%)</Text>
              <Text style={styles.summaryValue}>{formatCurrency(serviceFee)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Tổng cộng</Text>
              <Text style={styles.totalValue}>{formatCurrency(grandTotal)}</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Checkout Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomInfo}>
          <Text style={styles.bottomLabel}>Tổng thanh toán</Text>
          <Text style={styles.bottomTotal}>{formatCurrency(grandTotal)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.checkoutBtn, loading && styles.checkoutBtnDisabled]}
          onPress={handleCheckout}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MaterialCommunityIcons name="ticket-confirmation" size={20} color="#fff" />
              <Text style={styles.checkoutBtnText}>Đặt vé</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#1f2937',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  
  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  
  // Event Card
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#1f2937',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#374151',
  },
  eventImage: {
    width: 100,
    height: 100,
    backgroundColor: '#374151',
  },
  eventInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  eventMetaText: {
    fontSize: 12,
    color: '#9ca3af',
    flex: 1,
  },
  
  // Section
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  
  // Ticket Card
  ticketCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#10b981',
    marginBottom: 16,
  },
  ticketInfo: {
    flex: 1,
  },
  ticketName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  ticketTier: {
    fontSize: 13,
    color: '#10b981',
    marginTop: 2,
  },
  ticketBenefits: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  ticketPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10b981',
  },
  
  // Quantity
  quantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityLabel: {
    fontSize: 14,
    color: '#d1d5db',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnDisabled: {
    backgroundColor: '#1f2937',
  },
  qtyValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    minWidth: 30,
    textAlign: 'center',
  },
  
  // Payment
  paymentOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#374151',
  },
  paymentOptionActive: {
    borderColor: '#10b981',
    backgroundColor: '#10b98110',
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentName: {
    fontSize: 14,
    color: '#e5e7eb',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#4b5563',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterActive: {
    borderColor: '#10b981',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10b981',
  },
  
  // Summary
  summaryCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#9ca3af',
  },
  summaryValue: {
    fontSize: 14,
    color: '#e5e7eb',
  },
  divider: {
    height: 1,
    backgroundColor: '#374151',
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10b981',
  },
  
  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1f2937',
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  bottomInfo: {
    flex: 1,
  },
  bottomLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  bottomTotal: {
    fontSize: 20,
    fontWeight: '700',
    color: '#10b981',
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#10b981',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
  },
  checkoutBtnDisabled: {
    opacity: 0.6,
  },
  checkoutBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  
  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
  },
  backBtn: {
    marginTop: 24,
    backgroundColor: '#374151',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  backBtnText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
});
