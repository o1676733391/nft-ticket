// src/components/SearchDropdown.js
import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";

export default function SearchDropdown({
  visible,
  onRequestClose,
  recentSearches = [],
  categories = [],
  suggestedEvents = [],
}) {
  if (!visible) return null;

  const [activeTab, setActiveTab] = useState("category");

  // city data cho tab Thành phố
  const cityList = [
    {
      title: "Tp. Hồ Chí Minh",
      image: require("../../asset/ho-chi-minh-city-skyline.jpg"),
    },
    {
      title: "Hà Nội",
      image: require("../../asset/hanoi-architecture.jpg"),
    },
    {
      title: "Đà Lạt",
      image: require("../../asset/nha-trang-observatory-sky.jpg"),
    },
    {
      title: "Vị trí khác",
      image: require("../../asset/nha-trang-observatory-sky.jpg"),
    },
  ];

  // chỉ lấy 3 sự kiện để xếp hàng ngang giống hình
  const events = suggestedEvents.slice(0, 3);

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
                <View key={idx} style={styles.historyRow}>
                  <Text style={styles.historyIcon}>↗</Text>
                  <Text style={styles.historyText}>{item}</Text>
                </View>
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
                <View key={idx} style={styles.categoryCard}>
                  <Image source={item.image} style={styles.categoryImage} />
                  <Text style={styles.categoryTitle}>{item.title}</Text>
                </View>
              )
            )}
          </ScrollView>

          {/* ===== Gợi ý dành cho bạn ===== */}
          <Text style={styles.sectionTitle}>Gợi ý dành cho bạn</Text>

          <View style={styles.eventRow}>
            {events.map((ev, idx) => (
              <View key={idx} style={styles.eventCard}>
                <Image source={ev.image} style={styles.eventImage} />
                <View style={styles.eventBody}>
                  <Text numberOfLines={2} style={styles.eventTitle}>
                    {ev.title}
                  </Text>
                  <Text style={styles.eventPrice}>Từ {ev.price}</Text>
                  <View style={styles.eventMetaRow}>
                    <Text style={styles.eventMetaIcon}>📅</Text>
                    <Text style={styles.eventMetaText}>{ev.date}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          <View style={{ height: 30 }} />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    fontWeight: "600",
  },
  tabInactiveText: {
    color: "#9ca3af",
  },
  tabUnderline: {
    marginTop: 6,
    height: 3,
    borderRadius: 999,
    backgroundColor: "#22c55e",
  },

  /* ----- card thể loại / thành phố ----- */
  categoryCard: {
    width: 180,
    marginRight: 14,
    marginTop: 10,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  categoryImage: {
    width: "100%",
    height: 96,
    resizeMode: "cover",
  },
  categoryTitle: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 14,
    color: "#f9fafb",
  },

  /* ----- Gợi ý dành cho bạn: 3 card ngang ----- */
  sectionTitle: {
    marginTop: 22,
    marginBottom: 10,
    fontSize: 16,
    fontWeight: "600",
    color: "#f9fafb",
  },

  eventRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  eventCard: {
    width: "31%",
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.05)",
  },

  eventImage: {
    width: "100%",
    height: 140,
  },

  eventBody: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  eventTitle: {
    color: "#f9fafb",
    fontSize: 14,
    fontWeight: "600",
    minHeight: 40,
  },

  eventPrice: {
    marginTop: 4,
    color: "#4ade80",
    fontSize: 14,
    fontWeight: "700",
  },

  eventMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },

  eventMetaIcon: {
    fontSize: 13,
    color: "#d1d5db",
    marginRight: 4,
  },

  eventMetaText: {
    fontSize: 13,
    color: "#d1d5db",
  },
});
