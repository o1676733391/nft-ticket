import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import Header from "../components/Header";
import TopMenu from "../components/TopMenu";
import EventScheduleSection from "../components/EventScheduleSection";
import OrganizerSection from "../components/OrganizerSection";
import { homeData } from "../data/homeData";



const SCREEN_WIDTH = Dimensions.get("window").width;
const SIDE_MARGIN = 80;
const CONTAINER_WIDTH = Math.min(SCREEN_WIDTH - SIDE_MARGIN * 2, 1320);

export default function EventDetailScreen({ route, navigation }) {
  const { event } = route.params;

  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.screen}>
      <Header />
      <TopMenu navigation={navigation} />

      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.wrapper}>

          {/* LEFT INFO */}
          <View style={styles.leftBox}>
            <Text style={styles.title}>{event.title}</Text>

            <View style={styles.row}>
              <Text style={styles.icon}>📅</Text>
              <Text style={styles.text}>{event.date}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.icon}>📍</Text>
              <Text style={[styles.text, styles.greenText]}>
                {event.locationText || "TP. Hồ Chí Minh"}
              </Text>
            </View>

            <Text style={styles.address}>
              {event.address ||
                "Khu đô thị Vạn Phúc, Phường Hiệp Bình Phước, TP. Thủ Đức, TP HCM"}
            </Text>

            <View style={styles.separator} />

            <Text style={styles.priceLabel}>Giá từ</Text>
            <Text style={styles.priceValue}>
              {event.price.replace("Từ ", "")}
            </Text>

            <TouchableOpacity style={styles.buyBtn}>
              <Text style={styles.buyText}>Mua vé ngay</Text>
            </TouchableOpacity>
          </View>

          {/* RIGHT BANNER */}
          <View style={styles.rightBox}>
            <Image
              source={event.image}
              style={styles.banner}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* --- DESCRIPTION BOX (Expandable) --- */}
        <View style={styles.descBox}>
          <Text style={styles.descHeader}>Giới thiệu</Text>

          <View style={styles.descContent}>
            {/* Title mô tả */}
            <Text style={styles.descTitle}>
              {event.title || "Đang cập nhật tiêu đề"}
            </Text>

            {/* Nội dung mô tả */}
            <Text
              style={styles.descText}
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
        <OrganizerSection organizer={event.organizer || homeData.organizer} />


      </ScrollView>
    </View>
  );
}

/* ========= STYLES ========= */

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#000" },

  scrollView: {
    alignItems: "center",
    paddingBottom: 80,
  },

  wrapper: {
    width: CONTAINER_WIDTH,
    flexDirection: "row",
    marginTop: 30,
  },

  /* LEFT */
  leftBox: {
    width: "40%",
    backgroundColor: "#1b1b1b",
    padding: 24,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },

  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 18,
  },

  row: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  icon: { marginRight: 6, fontSize: 18 },

  text: { color: "#ccc", fontSize: 15 },

  greenText: { color: "#4ade80", fontWeight: "600" },

  address: {
    color: "#aaa",
    marginTop: 4,
    fontSize: 14,
    marginBottom: 18,
  },

  separator: {
    height: 1,
    backgroundColor: "#333",
    marginVertical: 16,
  },

  priceLabel: { color: "#aaa", fontSize: 15 },

  priceValue: {
    color: "#4ade80",
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 20,
  },

  buyBtn: {
    backgroundColor: "#22c55e",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buyText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  /* RIGHT */
  rightBox: { width: "60%" },
  banner: {
    width: "100%",
    height: 380,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },

  /* DESCRIPTION */
  descBox: {
    width: CONTAINER_WIDTH,
    marginTop: 40,
  },

  descHeader: {
    color: "#22c55e",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 14,
  },

  descContent: {
    backgroundColor: "#1f2733",
    padding: 24,
    borderRadius: 12,
  },

  descTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
  },

  descText: {
    color: "#ccc",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
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
    color: "#fff",
    fontSize: 15,
    opacity: 0.8,
  },
});
