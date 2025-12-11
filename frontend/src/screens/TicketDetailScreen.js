// src/screens/TicketDetailScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
  Alert,
  Share,
} from "react-native";
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import * as mobileApi from "../services/mobileApi";

export default function TicketDetailScreen({ route, navigation }) {
  const { ticket: passedTicket, ticketId } = route.params || {};
  const [ticket, setTicket] = useState(passedTicket || null);
  const [loading, setLoading] = useState(!passedTicket && !!ticketId);
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  useEffect(() => {
    if (ticketId && !passedTicket) {
      loadTicket();
    }
  }, [ticketId]);

  const loadTicket = async () => {
    try {
      setLoading(true);
      const data = await mobileApi.getTicketById(ticketId);
      setTicket(data);
    } catch (error) {
      console.error("Load ticket error:", error);
      Alert.alert("Lỗi", "Không thể tải thông tin vé");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "valid":
        return "#10b981";
      case "used":
        return "#6b7280";
      case "cancelled":
        return "#ef4444";
      case "expired":
        return "#f59e0b";
      default:
        return "#3b82f6";
    }
  };

  const getStatusText = (status, isCheckedIn) => {
    if (isCheckedIn) return "Đã check-in";
    switch (status) {
      case "valid":
        return "Hợp lệ";
      case "used":
        return "Đã sử dụng";
      case "cancelled":
        return "Đã hủy";
      case "expired":
        return "Hết hạn";
      default:
        return status;
    }
  };

  const handleShare = async () => {
    const event = ticket?.events;
    try {
      await Share.share({
        message: `Vé tham dự: ${event?.title || "Sự kiện"}\n\nNgày: ${formatDate(
          event?.start_date
        )}\nĐịa điểm: ${event?.venue_name || event?.location || "N/A"}\nMã vé: ${
          ticket?.ticket_code
        }`,
        title: `Vé ${event?.title || "Sự kiện"}`,
      });
    } catch (error) {
      console.error("Share error:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.screen}>
        <Header />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.loadingText}>Đang tải vé...</Text>
        </View>
      </View>
    );
  }

  if (!ticket) {
    return (
      <View style={styles.screen}>
        <Header />
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons
            name="ticket-outline"
            size={64}
            color="#4b5563"
          />
          <Text style={styles.emptyText}>Không tìm thấy vé</Text>
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

  const event = ticket.events;
  const template = ticket.ticket_templates;
  const isValid = ticket.status === "valid" && !ticket.is_checked_in;

  return (
    <View style={styles.screen}>
      <Header />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backRow}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
          <Text style={styles.backText}>Quay lại</Text>
        </TouchableOpacity>

        {/* Ticket Card */}
        <View
          style={[
            styles.ticketCard,
            { width: isTablet ? Math.min(width * 0.5, 500) : width - 32 },
          ]}
        >
          {/* Event Banner */}
          <Image
            source={
              event?.banner_url
                ? { uri: event.banner_url }
                : require("../../asset/concert-show-performance.jpg")
            }
            style={styles.eventBanner}
            resizeMode="cover"
          />

          {/* Status Badge */}
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: getStatusColor(ticket.status) + "20",
                borderColor: getStatusColor(ticket.status),
              },
            ]}
          >
            <Text
              style={[styles.statusText, { color: getStatusColor(ticket.status) }]}
            >
              {getStatusText(ticket.status, ticket.is_checked_in)}
            </Text>
          </View>

          {/* Event Info */}
          <View style={styles.eventInfo}>
            <Text style={styles.eventTitle}>{event?.title || "Sự kiện"}</Text>

            <View style={styles.infoRow}>
              <FontAwesome5 name="calendar-alt" size={16} color="#10b981" />
              <Text style={styles.infoText}>{formatDate(event?.start_date)}</Text>
            </View>

            <View style={styles.infoRow}>
              <FontAwesome5 name="clock" size={16} color="#10b981" />
              <Text style={styles.infoText}>{formatTime(event?.start_date)}</Text>
            </View>

            <View style={styles.infoRow}>
              <FontAwesome5 name="map-marker-alt" size={16} color="#10b981" />
              <Text style={styles.infoText}>
                {event?.venue_name || event?.location || "N/A"}
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.leftCircle} />
            <View style={styles.dashedLine} />
            <View style={styles.rightCircle} />
          </View>

          {/* Ticket Details */}
          <View style={styles.ticketDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Loại vé</Text>
              <Text style={styles.detailValue}>
                {template?.name || "Vé thường"}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Hạng</Text>
              <Text style={styles.detailValue}>{template?.tier || "Standard"}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Mã vé</Text>
              <Text style={[styles.detailValue, styles.ticketCode]}>
                {ticket.ticket_code}
              </Text>
            </View>

            {ticket.seat_info && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Ghế</Text>
                <Text style={styles.detailValue}>{ticket.seat_info}</Text>
              </View>
            )}
          </View>

          {/* QR Code Section */}
          <View style={styles.qrSection}>
            <Text style={styles.qrLabel}>Mã QR Check-in</Text>

            <View style={styles.qrContainer}>
              {isValid ? (
                <QRCode
                  value={JSON.stringify({
                    ticketId: ticket.id,
                    code: ticket.ticket_code,
                    eventId: event?.id,
                  })}
                  size={180}
                  backgroundColor="#fff"
                  color="#000"
                />
              ) : (
                <View style={styles.qrInvalid}>
                  <MaterialCommunityIcons
                    name="qrcode-remove"
                    size={100}
                    color="#6b7280"
                  />
                  <Text style={styles.qrInvalidText}>
                    {ticket.is_checked_in ? "Đã check-in" : "Vé không hợp lệ"}
                  </Text>
                </View>
              )}
            </View>

            {isValid && (
              <Text style={styles.qrHint}>
                Đưa mã QR này cho nhân viên để check-in
              </Text>
            )}
          </View>

          {/* Check-in Info */}
          {ticket.is_checked_in && ticket.checked_in_at && (
            <View style={styles.checkinInfo}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.checkinText}>
                Đã check-in lúc {formatTime(ticket.checked_in_at)},{" "}
                {formatDate(ticket.checked_in_at)}
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <Ionicons name="share-social" size={20} color="#fff" />
            <Text style={styles.shareBtnText}>Chia sẻ</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.eventBtn}
            onPress={() => navigation.navigate("EventDetail", { eventId: event?.id })}
          >
            <FontAwesome5 name="info-circle" size={18} color="#10b981" />
            <Text style={styles.eventBtnText}>Chi tiết sự kiện</Text>
          </TouchableOpacity>
        </View>

        {/* Purchase Info */}
        <View style={styles.purchaseInfo}>
          <Text style={styles.purchaseLabel}>Thông tin mua vé</Text>

          <View style={styles.purchaseRow}>
            <Text style={styles.purchaseKey}>Ngày mua</Text>
            <Text style={styles.purchaseValue}>
              {formatDate(ticket.created_at)}
            </Text>
          </View>

          {ticket.order_id && (
            <View style={styles.purchaseRow}>
              <Text style={styles.purchaseKey}>Mã đơn hàng</Text>
              <Text style={styles.purchaseValue}>#{ticket.order_id}</Text>
            </View>
          )}

          {ticket.price_paid && (
            <View style={styles.purchaseRow}>
              <Text style={styles.purchaseKey}>Giá vé</Text>
              <Text style={[styles.purchaseValue, styles.priceText]}>
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                  minimumFractionDigits: 0,
                }).format(ticket.price_paid)}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#111827",
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    alignItems: "center",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    color: "#9ca3af",
    fontSize: 16,
    marginTop: 12,
  },

  emptyText: {
    color: "#9ca3af",
    fontSize: 18,
    marginTop: 16,
  },

  backBtn: {
    marginTop: 20,
    backgroundColor: "#10b981",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },

  backBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  backRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: 16,
    gap: 8,
  },

  backText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  ticketCard: {
    backgroundColor: "#1f2937",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  eventBanner: {
    width: "100%",
    height: 160,
  },

  statusBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },

  eventInfo: {
    padding: 20,
    gap: 12,
  },

  eventTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 4,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  infoText: {
    color: "#d1d5db",
    fontSize: 14,
  },

  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
    position: "relative",
  },

  leftCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#111827",
    position: "absolute",
    left: -12,
  },

  rightCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#111827",
    position: "absolute",
    right: -12,
  },

  dashedLine: {
    flex: 1,
    height: 2,
    marginHorizontal: 20,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#374151",
    borderRadius: 1,
  },

  ticketDetails: {
    padding: 20,
    paddingTop: 16,
    gap: 12,
  },

  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  detailLabel: {
    color: "#9ca3af",
    fontSize: 14,
  },

  detailValue: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  ticketCode: {
    fontFamily: "monospace",
    letterSpacing: 1,
  },

  qrSection: {
    padding: 20,
    paddingTop: 0,
    alignItems: "center",
  },

  qrLabel: {
    color: "#10b981",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  qrContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
  },

  qrInvalid: {
    width: 180,
    height: 180,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#374151",
    borderRadius: 8,
  },

  qrInvalidText: {
    color: "#9ca3af",
    fontSize: 14,
    marginTop: 8,
  },

  qrHint: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 12,
    textAlign: "center",
  },

  checkinInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#10b98120",
    gap: 8,
  },

  checkinText: {
    color: "#10b981",
    fontSize: 14,
  },

  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },

  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3b82f6",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },

  shareBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },

  eventBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1f2937",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#10b981",
    gap: 8,
  },

  eventBtnText: {
    color: "#10b981",
    fontSize: 14,
    fontWeight: "700",
  },

  purchaseInfo: {
    marginTop: 24,
    backgroundColor: "#1f2937",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    maxWidth: 500,
  },

  purchaseLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 16,
  },

  purchaseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },

  purchaseKey: {
    color: "#9ca3af",
    fontSize: 14,
  },

  purchaseValue: {
    color: "#fff",
    fontSize: 14,
  },

  priceText: {
    color: "#10b981",
    fontWeight: "700",
  },
});
