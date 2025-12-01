import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";

import Header from "../components/Header";
import { homeData } from "../data/homeData";
import DateFilterModal from "../components/DateFilterDropdown";
import FilterDropdown from "../components/FilterDropdown";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SIDE_MARGIN = 80;
const CONTAINER_WIDTH = Math.min(SCREEN_WIDTH - SIDE_MARGIN * 2, 1320);

// ==========================================
// CATEGORY DETECTOR (Dựa trên prefix ID)
// ==========================================
const detectCategory = (id) => {
  if (id.startsWith("l")) return "music";         // liveMusicEvents
  if (id.startsWith("sa")) return "stage";        // stageArtEvents
  if (id.startsWith("w")) return "week";         // weekendEvents
  if (id.startsWith("m")) return "month";         // monthEvents
  if (id.startsWith("oc")) return "other";        // otherCategoryEvents

};

// ==========================================
// DATE PARSER
// ==========================================
const parseEventDate = (dateStr) => {
  // format: "07.12.2025" hoặc "25 tháng 11, 2025"
  if (!dateStr) return new Date(0);

  // case 1: DD.MM.YYYY
  if (dateStr.includes(".")) {
    const [d, m, y] = dateStr.split(".").map(Number);
    return new Date(y, m - 1, d);
  }

  // case 2: "25 tháng 11, 2025"
  const cleaned = dateStr.replace("tháng", "").replace(",", "").trim();
  const parts = cleaned.split(" ").map(Number);
  return new Date(parts[2], parts[1] - 1, parts[0]);
};

export default function SearchResultScreen({ route }) {
  const { query, category, location } = (route && route.params) || {};

  // ============================
  // FILTER STATES
  // ============================
  const [dateModal, setDateModal] = useState(false);
  const [filterModal, setFilterModal] = useState(false);

  const [dateRange, setDateRange] = useState(null);

  const categoryMap = {
    "Nhạc sống": ["music"],
    "Sân khấu & Nghệ thuật": ["stage"],
    "Dành cho bạn": ["other"],
    "Thể loại khác": ["oc"],
    "Sự kiện đặc biệt": ["other"],
    "Cuối tuần này": ["week"],
    "Tháng này": ["month"],
    "Thể Thao": ["other"],
    "Khác": ["other"],
  };

  const initialCategories = category ? (categoryMap[category] || []) : [];

  const initialLocation = location || "all";

  const [filters, setFilters] = useState({
    location: initialLocation,
    freeOnly: false,
    categories: initialCategories, // ["music", "stage"]
  });

  // ============================
  // MERGE ALL EVENTS
  // ============================
  const allEvents = [
    ...(homeData.specialEvents || []),
    ...(homeData.trendingEvents || []),
    ...(homeData.forYouEvents || []),
    ...(homeData.weekendEvents || []),
    ...(homeData.monthEvents || []),
    ...(homeData.liveMusicEvents || []),
    ...(homeData.stageArtEvents || []),
    ...(homeData.otherCategoryEvents || []),
  ];

  // ============================
  // FILTER LOGIC CHUẨN
  // ============================
  const filteredEvents = useMemo(() => {
    return allEvents.filter((ev) => {
      /* ----- 1. LOCATION ----- */
      if (filters.location !== "all" && ev.location !== filters.location) {
        return false;
      }

      /* ----- 2. PRICE (FREE ONLY) ----- */
      if (filters.freeOnly) {
        const p = ev.price.toLowerCase();
        if (!(p.includes("miễn") || p.includes("0đ") || p.includes("0"))) {
          return false;
        }
      }

      /* ----- 3. CATEGORY (PREFIX) ----- */
      if (filters.categories.length > 0) {
        const evCat = detectCategory(ev.id);  // convert ID → category
        if (!filters.categories.includes(evCat)) return false;
      }

      /* ----- 4. DATE RANGE ----- */
      if (dateRange) {
        const d = parseEventDate(ev.date);
        if (d < dateRange.start || d > dateRange.end) return false;
      }

      return true;
    });
  }, [filters, dateRange]);

  return (
    <View style={styles.screen}>
      <Header />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
        <View style={styles.pageWrapper}>
          <View style={styles.content}>

            {/* TITLE + FILTERS */}
            <View style={styles.titleFilterRow}>
              <Text style={styles.title}>Kết quả tìm kiếm:</Text>

              <View style={styles.filterRow}>
                <TouchableOpacity
                  style={styles.filterBtn}
                  onPress={() => setDateModal(true)}
                >
                  <Text style={styles.filterText}>📅 Tất cả các ngày ⌄</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.filterBtn, { marginLeft: 10 }]}
                  onPress={() => setFilterModal(true)}
                >
                  <Text style={styles.filterText}>⚙️ Bộ lọc ⌄</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* GRID */}
            <View style={styles.grid}>
              {filteredEvents.map((ev, idx) => (
                <View key={idx} style={styles.card}>
                  <Image source={ev.image} style={styles.image} />
                  <Text numberOfLines={2} style={styles.titleCard}>{ev.title}</Text>
                  <Text style={styles.price}>{ev.price}</Text>
                  <View style={styles.dateRow}>
                    <Text style={styles.dateIcon}>📅</Text>
                    <Text style={styles.dateText}>{ev.date}</Text>
                  </View>
                </View>
              ))}
            </View>

          </View>
        </View>
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

/* styles giữ nguyên */
const styles = {
  screen: { flex: 1, backgroundColor: "#000" },
  scrollView: { flex: 1 },
  container: { paddingBottom: 40 },
  pageWrapper: { alignItems: "center", paddingTop: 12 },
  content: { width: CONTAINER_WIDTH },
  title: { fontSize: 18, color: "#4ade80", fontWeight: "700" },
  titleFilterRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  filterRow: { flexDirection: "row" },
  filterBtn: { backgroundColor: "#3E3E46", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 30 },
  filterText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 18 },
  card: { width: "31%", backgroundColor: "#111", borderRadius: 12, overflow: "hidden" },
  image: { width: "100%", height: 160 },
  titleCard: { color: "#fff", marginTop: 8, paddingHorizontal: 10, minHeight: 40 },
  price: { paddingHorizontal: 10, color: "#00ff66", marginVertical: 4 },
  dateRow: { flexDirection: "row", paddingHorizontal: 10, marginBottom: 10 },
  dateIcon: { marginRight: 6 },
  dateText: { color: "#fff" }
};
