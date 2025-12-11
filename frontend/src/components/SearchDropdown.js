// src/components/SearchDropdown.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as mobileApi from "../services/mobileApi";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const isMobile = Platform.OS === "ios" || Platform.OS === "android" || SCREEN_WIDTH < 768;

export default function SearchDropdown({
  visible,
  onRequestClose,
  recentSearches = [],
}) {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState("category");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadEvents();
    }
  }, [visible]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await mobileApi.getEvents({ limit: 12 });
      const eventList = data.events || data || [];
      setEvents(eventList);
    } catch (error) {
      console.error('Load events error:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const transformEvent = (event) => {
    let minPrice = 0;
    if (event.ticket_templates?.length > 0) {
      const prices = event.ticket_templates.map(t => Number(t.price_token) || 0);
      minPrice = Math.min(...prices);
    }

    return {
      id: event.id,
      title: event.title,
      date: formatDate(event.start_date),
      location: event.city || event.location || 'Việt Nam',
      price: minPrice > 0 ? `Từ ${formatCurrency(minPrice)}` : 'Miễn phí',
      image: event.banner_url || event.thumbnail_url || null, // Return string URL, not object
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Đang cập nhật';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  };

  const handleCategoryPress = (category) => {
    onRequestClose();
    navigation.navigate("SearchResult", { query: "", category });
  };

  const handleCityPress = (city) => {
    onRequestClose();
    navigation.navigate("SearchResult", { query: "", location: city });
  };

  const handleEventPress = (event) => {
    onRequestClose();
    navigation.navigate("EventDetail", { event, eventId: event.id });
  };

  const handleRecentSearch = (searchText) => {
    onRequestClose();
    navigation.navigate("SearchResult", { query: searchText });
  };

  if (!visible) return null;

  // Categories and cities data
  const categories = [
    { title: "Nhạc sống", image: require("../../asset/concert-show-performance.jpg") },
    { title: "Sân khấu & Nghệ thuật", image: require("../../asset/flower-workshop.jpg") },
    { title: "Thể Thao", image: require("../../asset/flower-workshop.jpg") },
    { title: "Khác", image: require("../../asset/flower-workshop.jpg") },
  ];

  // city data cho tab Thành phố
  const cityList = [
    { title: "Tp. Hồ Chí Minh", city: "hcm", image: require("../../asset/ho-chi-minh-city-skyline.jpg") },
    { title: "Hà Nội", city: "hn", image: require("../../asset/hanoi-architecture.jpg") },
    { title: "Đà Lạt", city: "dl", image: require("../../asset/nha-trang-observatory-sky.jpg") },
    { title: "Vị trí khác", city: "other", image: require("../../asset/nha-trang-observatory-sky.jpg") },
  ];

  // Use real events from API
  const suggestedEvents = events.slice(0, isMobile ? 4 : 6).map(transformEvent);

  // Mobile: dùng Modal fullscreen
  if (isMobile) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onRequestClose}
      >
        <TouchableWithoutFeedback onPress={onRequestClose}>
          <View style={styles.mobileOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.mobileDropdown}>
                <ScrollView
                  showsVerticalScrollIndicator={true}
                  style={{ maxHeight: SCREEN_WIDTH * 1.2 }}
                >
                  {/* Lịch sử tìm kiếm */}
                  {recentSearches.length > 0 && (
                    <View style={styles.historyBox}>
                      {recentSearches.map((item, idx) => (
                        <TouchableOpacity key={idx} style={styles.historyRow} onPress={() => handleRecentSearch(item)}>
                          <Text style={styles.historyIcon}>↗</Text>
                          <Text style={styles.historyText}>{item}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {/* Tabs */}
                  <View style={styles.mobileTabsRow}>
                    <TouchableOpacity
                      onPress={() => setActiveTab("category")}
                      style={styles.tabWrap}
                    >
                      <Text
                        style={[
                          styles.mobileTabText,
                          activeTab === "category"
                            ? styles.tabActiveText
                            : styles.tabInactiveText,
                        ]}
                      >
                        Khám phá theo Thể loại
                      </Text>
                      {activeTab === "category" && <View style={styles.tabUnderline} />}
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => setActiveTab("city")}
                      style={styles.tabWrap}
                    >
                      <Text
                        style={[
                          styles.mobileTabText,
                          activeTab === "city"
                            ? styles.tabActiveText
                            : styles.tabInactiveText,
                        ]}
                      >
                        Theo Thành phố
                      </Text>
                      {activeTab === "city" && <View style={styles.tabUnderline} />}
                    </TouchableOpacity>
                  </View>

                  {/* Categories/Cities */}
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ marginTop: 12 }}
                  >
                    {(activeTab === "category" ? categories : cityList).map(
                      (item, idx) => (
                        <TouchableOpacity 
                          key={idx} 
                          style={styles.mobileCategoryCard}
                          onPress={() => activeTab === "category" ? handleCategoryPress(item.title) : handleCityPress(item.city)}
                        >
                          <Image 
                            source={typeof item.image === 'string' ? { uri: item.image } : item.image} 
                            style={styles.mobileCategoryImage} 
                          />
                          <Text style={styles.mobileCategoryTitle}>{item.title}</Text>
                        </TouchableOpacity>
                      )
                    )}
                  </ScrollView>

                  {/* Gợi ý */}
                  {loading ? (
                    <Text style={styles.mobileSectionTitle}>Đang tải...</Text>
                  ) : (
                    <>
                      <Text style={styles.mobileSectionTitle}>Gợi ý dành cho bạn</Text>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                      >
                        {suggestedEvents.map((ev, idx) => (
                          <TouchableOpacity 
                            key={idx} 
                            style={styles.mobileEventCard}
                            onPress={() => handleEventPress(events[idx])}
                          >
                            <Image 
                              source={ev.image ? { uri: ev.image } : require("../../asset/concert-show-performance.jpg")} 
                              style={styles.mobileEventImage} 
                            />
                            <View style={styles.mobileEventInfo}>
                              <Text numberOfLines={2} style={styles.mobileEventTitle}>
                                {ev.title}
                              </Text>
                              <Text style={styles.mobileEventPrice}>{ev.price}</Text>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </>
                  )}

                  <View style={{ height: 20 }} />
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  }

  // Web/Desktop: dropdown cố định
  return (
    <View
      style={styles.wrapper}
      pointerEvents="box-none"
      onMouseLeave={onRequestClose} // rê chuột ra ngoài box -> đóng
    >
      <View style={styles.dropdown} pointerEvents="auto">
        <ScrollView
          showsVerticalScrollIndicator={true}
          style={{ maxHeight: 520 }}
        >
          {/* ===== Lịch sử tìm kiếm ===== */}
          {recentSearches.length > 0 && (
            <View style={styles.historyBox}>
              {recentSearches.map((item, idx) => (
                <TouchableOpacity key={idx} style={styles.historyRow} onPress={() => handleRecentSearch(item)}>
                  <Text style={styles.historyIcon}>↗</Text>
                  <Text style={styles.historyText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* ===== Tabs ===== */}
          <View style={styles.tabsRow}>
            <TouchableOpacity
              onPress={() => setActiveTab("category")}
              style={styles.tabWrap}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "category"
                    ? styles.tabActiveText
                    : styles.tabInactiveText,
                ]}
              >
                Khám phá theo Thể loại
              </Text>
              {activeTab === "category" && <View style={styles.tabUnderline} />}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab("city")}
              style={styles.tabWrap}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "city"
                    ? styles.tabActiveText
                    : styles.tabInactiveText,
                ]}
              >
                Khám phá theo Thành phố
              </Text>
              {activeTab === "city" && <View style={styles.tabUnderline} />}
            </TouchableOpacity>
          </View>

          {/* ===== Nội dung tab: Thể loại / Thành phố ===== */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: 12 }}
          >
            {(activeTab === "category" ? categories : cityList).map(
              (item, idx) => (
                <TouchableOpacity 
                  key={idx} 
                  style={styles.categoryCard}
                  onPress={() => activeTab === "category" ? handleCategoryPress(item.title) : handleCityPress(item.city)}
                >
                  <Image 
                    source={typeof item.image === 'string' ? { uri: item.image } : item.image} 
                    style={styles.categoryImage} 
                  />
                  <Text style={styles.categoryTitle}>{item.title}</Text>
                </TouchableOpacity>
              )
            )}
          </ScrollView>

          {/* ===== Gợi ý dành cho bạn ===== */}
          {loading ? (
            <Text style={styles.sectionTitle}>Đang tải...</Text>
          ) : (
            <>
              <Text style={styles.sectionTitle}>Gợi ý dành cho bạn</Text>

              <View style={styles.eventRow}>
                {suggestedEvents.map((ev, idx) => (
                  <TouchableOpacity 
                    key={idx} 
                    style={styles.eventCard}
                    onPress={() => handleEventPress(events[idx])}
                  >
                    <Image 
                      source={ev.image ? { uri: ev.image } : require("../../asset/concert-show-performance.jpg")} 
                      style={styles.eventImage} 
                    />
                    <View style={styles.eventBody}>
                      <Text numberOfLines={2} style={styles.eventTitle}>
                        {ev.title}
                      </Text>
                      <Text style={styles.eventPrice}>{ev.price}</Text>
                      <View style={styles.eventMetaRow}>
                        <Text style={styles.eventMetaIcon}>📅</Text>
                        <Text style={styles.eventMetaText}>{ev.date}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          <View style={{ height: 30 }} />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // ===== MOBILE STYLES =====
  mobileOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingTop: 60, // Below header
  },
  mobileDropdown: {
    marginHorizontal: 10,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "rgba(20,20,20,0.98)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    maxHeight: "80%",
  },
  mobileTabsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.25)",
    gap: 16,
  },
  mobileTabText: {
    fontSize: 13,
  },
  mobileCategoryCard: {
    width: 120,
    marginRight: 12,
    marginTop: 8,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  mobileCategoryImage: {
    width: "100%",
    height: 70,
    resizeMode: "cover",
  },
  mobileCategoryTitle: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    fontSize: 12,
    fontWeight: "600",
    color: "#f9fafb",
  },
  mobileSectionTitle: {
    marginTop: 20,
    marginBottom: 10,
    fontSize: 14,
    fontWeight: "700",
    color: "#f9fafb",
  },
  mobileEventCard: {
    width: 140,
    marginRight: 12,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  mobileEventImage: {
    width: "100%",
    height: 90,
    resizeMode: "cover",
  },
  mobileEventInfo: {
    padding: 8,
  },
  mobileEventTitle: {
    color: "#f9fafb",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  mobileEventPrice: {
    color: "#10b981",
    fontSize: 11,
    fontWeight: "700",
  },

  // ===== WEB/DESKTOP STYLES =====
  // Box bám ngay dưới ô search, không full màn
  wrapper: {
    position: "absolute",
    top: 80,        // chỉnh nhẹ nếu lệch so với ô search
    left: 260,      // tuỳ layout của bạn, có thể giữ 160 nếu khớp hơn
    width: 820,
    zIndex: 300,
  },

  dropdown: {
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "rgba(15,15,15,0.9)", // nền tối giống ticketbox
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },

  /* ----- lịch sử search ----- */
  historyBox: {
    marginBottom: 8,
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  historyIcon: {
    color: "#4ade80",
    fontSize: 16,
    marginRight: 8,
  },
  historyText: {
    color: "#f9fafb",
    fontSize: 15,
  },

  /* ----- Tabs ----- */
  tabsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.25)",
    gap: 26,
  },
  tabWrap: {
    position: "relative",
  },
  tabText: {
    fontSize: 15,
  },
  tabActiveText: {
    color: "#fff",
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  tabInactiveText: {
    color: "#9ca3af",
    fontWeight: "500",
  },
  tabUnderline: {
    marginTop: 6,
    height: 3,
    borderRadius: 999,
    backgroundColor: "#10b981",
  },

  /* ----- card thể loại / thành phố ----- */
  categoryCard: {
    width: 180,
    marginRight: 14,
    marginTop: 10,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.05)",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  categoryImage: {
    width: "100%",
    height: 96,
    resizeMode: "cover",
  },
  categoryTitle: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: "600",
    color: "#f9fafb",
    letterSpacing: 0.2,
  },

  /* ----- Gợi ý dành cho bạn: 3 card ngang ----- */
  sectionTitle: {
    marginTop: 24,
    marginBottom: 12,
    fontSize: 17,
    fontWeight: "700",
    color: "#f9fafb",
    letterSpacing: 0.4,
  },

  eventRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  eventCard: {
    width: "31%",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.05)",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },

  eventImage: {
    width: "100%",
    height: 140,
  },

  eventBody: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  eventTitle: {
    color: "#f9fafb",
    fontSize: 14,
    fontWeight: "700",
    minHeight: 40,
    letterSpacing: 0.2,
  },

  eventPrice: {
    marginTop: 5,
    color: "#10b981",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.2,
  },

  eventMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },

  eventMetaIcon: {
    fontSize: 13,
    color: "#d1d5db",
    marginRight: 4,
  },

  eventMetaText: {
    fontSize: 13,
    color: "#d1d5db",
    fontWeight: "500",
  },
});
