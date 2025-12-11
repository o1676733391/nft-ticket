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
} from "react-native";
import Header from "../components/Header";
import TopMenu from "../components/TopMenu";
import EventScheduleSection from "../components/EventScheduleSection";
import OrganizerSection from "../components/OrganizerSection";
import { useAuth } from "../context/AuthContext";
import * as mobileApi from "../services/mobileApi";

export default function EventDetailScreen({ route, navigation }) {
  const { event: passedEvent, eventId } = route.params || {};
  const [event, setEvent] = useState(passedEvent || null);
  const [loading, setLoading] = useState(!passedEvent && !!eventId);
  const [expanded, setExpanded] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [organizer, setOrganizer] = useState(null);
  const { isAuthenticated } = useAuth();
  
  const { width: screenWidth } = useWindowDimensions();
  const isTabletOrDesktop = screenWidth >= 768;
  
  const SIDE_MARGIN = isTabletOrDesktop ? 80 : 16;
  const CONTAINER_WIDTH = Math.min(screenWidth - SIDE_MARGIN * 2, 1320);

  // Load event from API if eventId is passed
  useEffect(() => {
    if (eventId && !passedEvent) {
      loadEvent();
    }
  }, [eventId]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      const data = await mobileApi.getEventById(eventId);
      setEvent(data);
      if (data.ticket_templates?.length > 0) {
        setSelectedTemplate(data.ticket_templates[0]);
      }
      
      // Load organizer info if available
      if (data.organizer_id) {
        try {
          const organizerData = await mobileApi.getOrganizerById(data.organizer_id);
          setOrganizer(organizerData);
        } catch (err) {
          console.error('Load organizer error:', err);
          // Set default organizer info
          setOrganizer({
            name: data.organizer_name || 'Đang cập nhật',
            description: data.organizer_info || '',
            logo: data.organizer_logo || null,
          });
        }
      }
    } catch (error) {
      console.error('Load event error:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin sự kiện');
    } finally {
      setLoading(false);
    }
  };

  // Get event image URL (string)
  const getImageUrl = () => {
    // Try banner_url first, then thumbnail_url, then event.image
    return event?.banner_url || event?.thumbnail_url || event?.image || null;
  };

  // Get price display
  const getPriceDisplay = () => {
    if (event?.price) return event.price.replace("Từ ", "");
    if (event?.ticket_templates?.length > 0) {
      const minPrice = Math.min(...event.ticket_templates.map(t => Number(t.price_token) || 0));
      return formatCurrency(minPrice);
    }
    return "Liên hệ";
  };

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
    });
  };

  const handleBuyTicket = () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Đăng nhập',
        'Vui lòng đăng nhập để mua vé',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Đăng nhập', onPress: () => navigation.navigate('Home') },
        ]
      );
      return;
    }

    // Navigate to checkout - will use default pricing
    navigation.navigate('Checkout', {
      event: event,
      template: selectedTemplate || (event?.ticket_templates?.[0]) || {
        name: 'General Admission',
        price: event.base_price || 0,
        description: 'Standard ticket'
      },
      quantity: 1,
    });
  };

  if (loading) {
    return (
      <View style={styles.screen}>
        <Header />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.loadingText}>Đang tải sự kiện...</Text>
        </View>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.screen}>
        <Header />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Không tìm thấy sự kiện</Text>
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
    <View style={styles.screen}>
      <Header />
      <TopMenu navigation={navigation} />

      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={[styles.wrapper, { 
          width: isTabletOrDesktop ? CONTAINER_WIDTH : screenWidth,
          flexDirection: isTabletOrDesktop ? "row" : "column",
          marginTop: isTabletOrDesktop ? 30 : 16,
          paddingHorizontal: isTabletOrDesktop ? 0 : 16,
        }]}>

          {/* Image first on mobile, left info on desktop */}
          {!isTabletOrDesktop && (
            <View style={styles.mobileImageBox}>
              {getImageUrl() ? (
                <Image
                  source={{ uri: getImageUrl() }}
                  style={styles.mobileImage}
                  resizeMode="cover"
                />
              ) : (
                <Image
                  source={require("../../asset/concert-show-performance.jpg")}
                  style={styles.mobileImage}
                  resizeMode="cover"
                />
              )}
            </View>
          )}

          {/* LEFT INFO */}
          <View style={[styles.leftBox, { 
            width: isTabletOrDesktop ? "40%" : "100%",
            padding: isTabletOrDesktop ? 24 : 20,
            borderRadius: isTabletOrDesktop ? 0 : 16,
            borderTopLeftRadius: isTabletOrDesktop ? 12 : 16,
            borderBottomLeftRadius: isTabletOrDesktop ? 12 : 16,
            borderTopRightRadius: isTabletOrDesktop ? 0 : 16,
            borderBottomRightRadius: isTabletOrDesktop ? 0 : 16,
          }]}>
            <Text style={[styles.title, { 
              fontSize: isTabletOrDesktop ? 26 : 22,
              marginBottom: isTabletOrDesktop ? 18 : 14,
            }]}>{event.title}</Text>

            <View style={styles.row}>
              <Text style={[styles.icon, { fontSize: isTabletOrDesktop ? 18 : 16 }]}>📅</Text>
              <Text style={[styles.text, { fontSize: isTabletOrDesktop ? 15 : 14 }]}>
                {event.date || formatDate(event.event_date)}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={[styles.icon, { fontSize: isTabletOrDesktop ? 18 : 16 }]}>📍</Text>
              <Text style={[styles.text, styles.greenText, { fontSize: isTabletOrDesktop ? 15 : 14 }]}>
                {event.location || event.locationText || "Đang cập nhật"}
              </Text>
            </View>

            <Text style={[styles.address, { 
              fontSize: isTabletOrDesktop ? 14 : 13,
              marginBottom: isTabletOrDesktop ? 18 : 14,
            }]}>
              {event.venue_name || event.address || event.venue || event.location || "Địa điểm đang cập nhật"}
            </Text>

            <View style={styles.separator} />

            <Text style={[styles.priceLabel, { fontSize: isTabletOrDesktop ? 15 : 13 }]}>Giá từ</Text>
            <Text style={[styles.priceValue, { 
              fontSize: isTabletOrDesktop ? 26 : 28,
              marginBottom: isTabletOrDesktop ? 20 : 16,
            }]}>
              {getPriceDisplay()}
            </Text>

            <TouchableOpacity 
              style={[styles.buyBtn, { 
                paddingVertical: isTabletOrDesktop ? 14 : 14,
                marginTop: isTabletOrDesktop ? 8 : 6,
                minHeight: isTabletOrDesktop ? undefined : 50,
              }]}
              onPress={handleBuyTicket}
            >
              <Text style={[styles.buyText, { fontSize: isTabletOrDesktop ? 16 : 16 }]}>Mua vé ngay</Text>
            </TouchableOpacity>
          </View>

          {/* RIGHT BANNER - Desktop only */}
          {isTabletOrDesktop && (
            <View style={styles.rightBox}>
              {getImageUrl() ? (
                <Image
                  source={{ uri: getImageUrl() }}
                  style={styles.banner}
                  resizeMode="cover"
                />
              ) : (
                <Image
                  source={require("../../asset/concert-show-performance.jpg")}
                  style={styles.banner}
                  resizeMode="cover"
                />
              )}
            </View>
          )}
        </View>

        {/* --- DESCRIPTION BOX (Expandable) --- */}
        <View style={[styles.descBox, { 
          width: isTabletOrDesktop ? CONTAINER_WIDTH : screenWidth,
          marginTop: isTabletOrDesktop ? 40 : 24,
          paddingHorizontal: isTabletOrDesktop ? 0 : 16,
        }]}>
          <Text style={[styles.descHeader, { 
            fontSize: isTabletOrDesktop ? 22 : 20,
            marginBottom: isTabletOrDesktop ? 14 : 12,
          }]}>Giới thiệu</Text>

          <View style={[styles.descContent, { 
            padding: isTabletOrDesktop ? 24 : 20,
          }]}>
            {/* Title mô tả */}
            <Text style={[styles.descTitle, { 
              fontSize: isTabletOrDesktop ? 20 : 18,
              marginBottom: isTabletOrDesktop ? 20 : 16,
            }]}>
              {event.title || "Đang cập nhật tiêu đề"}
            </Text>

            {/* Nội dung mô tả */}
            <Text
              style={[styles.descText, { 
                fontSize: isTabletOrDesktop ? 15 : 14,
                lineHeight: isTabletOrDesktop ? 22 : 20,
                marginBottom: isTabletOrDesktop ? 20 : 16,
              }]}
              numberOfLines={expanded ? 999 : 6}
            >
              {event.description || "Nội dung sự kiện đang được cập nhật."}
            </Text>


            {/* Xem thêm / Thu gọn */}
            <TouchableOpacity
              style={styles.expandBtn}
              onPress={() => setExpanded(!expanded)}
            >
              <Text style={styles.expandText}>
                {expanded ? "▲ Thu gọn" : "▼ Xem thêm"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <EventScheduleSection schedule={event.schedule} />
        <OrganizerSection organizer={organizer || event.organizer || {
          name: 'Đang cập nhật',
          description: '',
          logo: null,
        }} />


      </ScrollView>
    </View>
  );
}

/* ========= STYLES ========= */

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#111827" },

  scrollView: {
    alignItems: "center",
    paddingBottom: 80,
  },

  wrapper: {},
  
  mobileImageBox: {
    width: "100%",
    marginBottom: 16,
  },
  
  mobileImage: {
    width: "100%",
    height: 280,
    borderRadius: 16,
  },

  /* LEFT */
  leftBox: {
    backgroundColor: "#1f2937",
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },

  title: {
    color: "#fff",
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  row: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  icon: { marginRight: 6 },

  text: { color: "#d1d5db", fontWeight: "500" },

  greenText: { color: "#10b981", fontWeight: "700" },

  address: {
    color: "#9ca3af",
    marginTop: 4,
  },

  separator: {
    height: 1,
    backgroundColor: "#374151",
    marginVertical: 16,
  },

  priceLabel: { color: "#9ca3af", fontWeight: "600" },

  priceValue: {
    color: "#10b981",
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  buyBtn: {
    backgroundColor: "#10b981",
    borderRadius: 8,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buyText: { color: "#fff", fontWeight: "800", letterSpacing: 0.5 },

  /* RIGHT - Desktop only */
  rightBox: { width: "60%" },
  banner: {
    width: "100%",
    height: 380,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },

  /* DESCRIPTION */
  descBox: {},

  descHeader: {
    color: "#10b981",
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  descContent: {
    backgroundColor: "#1f2937",
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  descTitle: {
    color: "#fff",
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 0.3,
  },

  descText: {
    color: "#d1d5db",
  },

  descImage: {
    width: "100%",
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
  },

  expandBtn: {
    alignItems: "center",
    paddingVertical: 8,
  },

  expandText: {
    color: "#10b981",
    fontSize: 15,
    fontWeight: "600",
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
});
