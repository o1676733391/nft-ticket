import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  useWindowDimensions,
  TextInput,
  ActivityIndicator,
} from "react-native";

import Header from "../components/Header";
import DateFilterModal from "../components/DateFilterDropdown";
import FilterDropdown from "../components/FilterDropdown";
import { useNavigation } from "@react-navigation/native";
import { getEvents } from "../services/mobileApi";

// ==========================================
// DATE PARSER
// ==========================================
const parseEventDate = (dateStr) => {
  if (!dateStr) return new Date(0);
  // ISO format from database
  return new Date(dateStr);
};

export default function SearchResultScreen({ route }) {
  const { query, category, location } = (route && route.params) || {};
  const navigation = useNavigation();
  const { width: screenWidth } = useWindowDimensions();
  const isTabletOrDesktop = screenWidth >= 768;
  
  const SIDE_MARGIN = isTabletOrDesktop ? 80 : 16;
  const CONTAINER_WIDTH = Math.min(screenWidth - SIDE_MARGIN * 2, 1320);
  const CARD_GAP = isTabletOrDesktop ? 20 : 12;
  const NUM_COLUMNS = isTabletOrDesktop ? 3 : 2;
  const CARD_WIDTH = (screenWidth - SIDE_MARGIN * 2 - CARD_GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

  // ============================
  // STATE
  // ============================
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateModal, setDateModal] = useState(false);
  const [filterModal, setFilterModal] = useState(false);
  const [dateRange, setDateRange] = useState(null);

  const categoryMap = {
    "Nhạc sống": "Âm nhạc",
    "Sân khấu & Nghệ thuật": "Sân khấu",
    "Dành cho bạn": null,
    "Thể loại khác": null,
    "Sự kiện đặc biệt": null,
    "Cuối tuần này": null,
    "Tháng này": null,
    "Thể Thao": "Thể thao",
    "Khác": null,
  };

  const initialCategory = category ? categoryMap[category] : null;
  const initialLocation = location || "all";

  const [filters, setFilters] = useState({
    location: initialLocation,
    freeOnly: false,
    categories: initialCategory ? [initialCategory] : [],
  });

  // ============================
  // LOAD EVENTS FROM API
  // ============================
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await getEvents({
        search: query || '',
        limit: 100,
      });
      
      const transformedEvents = response.events.map(event => {
        // Get image URL as string
        const imageUrl = event.banner_url || event.thumbnail_url || null;

        return {
          id: event.id,
          title: event.title,
          date: new Date(event.start_date).toLocaleDateString('vi-VN'),
          time: new Date(event.start_date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          location: event.location || 'Chưa xác định',
          category: event.category || 'Khác',
          price: event.ticket_templates?.[0]?.price_token === 0 ? 'Miễn phí' : `${event.ticket_templates?.[0]?.price_token || 0}đ`,
          image: imageUrl,
          organizer: event.organizer_name || 'Unknown',
          rawDate: event.start_date,
        };
      });

      setEvents(transformedEvents);
    } catch (error) {
      console.error('Failed to load events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // FILTER LOGIC
  // ============================
  // FILTER LOGIC
  // ============================
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      /* ----- 1. LOCATION ----- */
      if (filters.location !== "all") {
        const locationMap = {
          "hcm": "Tp. Hồ Chí Minh",
          "hn": "Hà Nội",
          "dl": "Đà Lạt",
          "other": "Vị trí khác",
        };
        const targetLocation = locationMap[filters.location] || filters.location;
        if (!ev.location.includes(targetLocation)) {
          return false;
        }
      }

      /* ----- 2. PRICE (FREE ONLY) ----- */
      if (filters.freeOnly) {
        const p = ev.price.toLowerCase();
        if (!(p.includes("miễn") || p.includes("0đ") || p.includes("0"))) {
          return false;
        }
      }

      /* ----- 3. CATEGORY ----- */
      if (filters.categories.length > 0) {
        if (!filters.categories.includes(ev.category)) {
          return false;
        }
      }

      /* ----- 4. DATE RANGE ----- */
      if (dateRange) {
        const d = parseEventDate(ev.rawDate);
        if (d < dateRange.start || d > dateRange.end) return false;
      }

      return true;
    });
  }, [events, filters, dateRange]);

  return (
    <View style={styles.screen}>
      {/* Mobile Header with Back Button */}
      {!isTabletOrDesktop ? (
        <View style={styles.mobileHeader}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tìm kiếm</Text>
          <View style={{ width: 40 }} />
        </View>
      ) : (
        <Header />
      )}

      {/* Search Input - Mobile */}
      {!isTabletOrDesktop && (
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Nhập từ khóa"
            placeholderTextColor="#9ca3af"
            defaultValue={query}
          />
        </View>
      )}

      {/* Filter Buttons */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterScrollView}
        contentContainerStyle={[styles.filterContainer, { paddingHorizontal: SIDE_MARGIN }]}
      >
        <TouchableOpacity
          style={[styles.filterBtn, styles.filterBtnPrimary]}
          onPress={() => setDateModal(true)}
        >
          <Text style={styles.filterIcon}>📅</Text>
          <Text style={styles.filterText}>Tất cả các ngày</Text>
          <Text style={styles.filterArrow}>⌄</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterBtn, styles.filterBtnSecondary]}
          onPress={() => setFilterModal(true)}
        >
          <Text style={styles.filterIcon}>⚙️</Text>
          <Text style={styles.filterText}>Bộ lọc</Text>
          <Text style={styles.filterArrow}>⌄</Text>
        </TouchableOpacity>

        {filters.categories.length > 0 && (
          <TouchableOpacity style={[styles.filterBtn, styles.filterBtnActive]}>
            <Text style={styles.filterIcon}>✕</Text>
            <Text style={styles.filterText}>{category || 'Đã chọn'}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={[styles.container, { paddingHorizontal: SIDE_MARGIN }]}
      >
        {/* Loading */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6366f1" />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        )}

        {/* Results Grid */}
        {!loading && (
          <View style={styles.grid}>
            {filteredEvents.map((ev, idx) => {
            // Calculate if this card is on the right column
            const isRightColumn = idx % NUM_COLUMNS === NUM_COLUMNS - 1;
            
            return (
              <TouchableOpacity 
                key={idx} 
                style={[
                  styles.card, 
                  { 
                    width: CARD_WIDTH,
                    marginRight: isRightColumn ? 0 : CARD_GAP,
                    marginBottom: CARD_GAP,
                  }
                ]}
                activeOpacity={0.9}
                onPress={() => navigation.navigate("EventDetail", { event: ev })}
              >
                <View style={[styles.imageContainer, { height: CARD_WIDTH * 1.2 }]}>
                  {ev.image ? (
                    <Image source={{ uri: ev.image }} style={styles.image} />
                  ) : (
                    <Image source={require("../../asset/concert-show-performance.jpg")} style={styles.image} />
                  )}
                </View>
                
                <View style={styles.cardContent}>
                  <Text numberOfLines={2} style={styles.titleCard}>{ev.title}</Text>
                  <Text style={styles.price}>{ev.price}</Text>
                  <View style={styles.dateRow}>
                    <Text style={styles.dateIcon}>📅</Text>
                    <Text style={styles.dateText}>{ev.date}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
          </View>
        )}

        {!loading && filteredEvents.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Không tìm thấy sự kiện nào</Text>
          </View>
        )}
      </ScrollView>

      {/* DATE MODAL */}
      <DateFilterModal
        visible={dateModal}
        onClose={() => setDateModal(false)}
        onApply={(range) => setDateRange(range)}
      />

      {/* FILTER MODAL */}
      <FilterDropdown
        visible={filterModal}
        onClose={() => setFilterModal(false)}
        onApply={(vals) => setFilters(vals)}
      />
    </View>
  );
}

/* ========= STYLES ========= */
const styles = StyleSheet.create({
  screen: { 
    flex: 1, 
    backgroundColor: "#111827",
  },
  
  // Mobile Header
  mobileHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#111827",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1f2937",
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "300",
    marginTop: -2,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  
  // Search Input
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#1f2937",
    borderRadius: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
  },
  
  // Filter Buttons
  filterScrollView: {
    maxHeight: 60,
    marginBottom: 8,
  },
  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
  },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 6,
  },
  filterBtnPrimary: {
    backgroundColor: "#10b981",
  },
  filterBtnSecondary: {
    backgroundColor: "#f59e0b",
  },
  filterBtnActive: {
    backgroundColor: "#374151",
    borderWidth: 1,
    borderColor: "#10b981",
  },
  filterIcon: {
    fontSize: 14,
  },
  filterText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  filterArrow: {
    color: "#fff",
    fontSize: 12,
    marginLeft: 2,
  },
  
  // Scroll & Container
  scrollView: { 
    flex: 1,
  },
  container: { 
    paddingBottom: 32,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  
  // Grid
  grid: { 
    flexDirection: "row", 
    flexWrap: "wrap",
  },
  
  // Card
  card: { 
    backgroundColor: "#1f2937",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  imageContainer: {
    width: "100%",
    backgroundColor: "#374151",
  },
  image: { 
    width: "100%", 
    height: "100%",
    resizeMode: "cover",
  },
  cardContent: {
    padding: 12,
  },
  titleCard: { 
    color: "#fff", 
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
    minHeight: 40,
    letterSpacing: 0.2,
  },
  price: { 
    color: "#10b981", 
    fontSize: 15,
    fontWeight: "800",
    marginTop: 6,
    letterSpacing: 0.3,
  },
  dateRow: { 
    flexDirection: "row", 
    alignItems: "center",
    marginTop: 8,
  },
  dateIcon: { 
    fontSize: 13,
    marginRight: 6,
  },
  dateText: { 
    color: "#d1d5db",
    fontSize: 13,
    fontWeight: "500",
  },
  
  // Empty State
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    color: "#9ca3af",
    fontSize: 16,
  },
});
