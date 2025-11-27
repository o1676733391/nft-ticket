// src/screens/MyTicketsScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function MyTicketsScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState("all");
  const [subTab, setSubTab] = useState("upcoming");

  const menuItems = [
    {
      key: "settings",
      label: "Cài đặt tài khoản",
      icon: "user",
      active: false,
    },
    { key: "info", label: "Thông tin tài khoản", icon: null, active: false },
    { key: "tickets", label: "Vé của tôi", icon: "ticket-alt", active: true },
    {
      key: "events",
      label: "Sự kiện của tôi",
      icon: "calendar-alt",
      active: false,
    },
  ];

  return (
    <View style={styles.screen}>
      <Header />

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* BREADCRUMB */}
        <View style={styles.breadcrumb}>
          <Text style={styles.breadcrumbText}>Trang chủ › Vé của tôi</Text>
        </View>

        <View style={styles.mainRow}>
          {/* LEFT MENU */}
     
          <View style={styles.leftCol}>
            <View style={styles.accountBox}>
              <Image
                source={require("../../asset/concert-show-performance.jpg")}
                style={styles.avatarSmall}
              />
              <Text style={styles.leftTitle}>Tài khoản của</Text>
            </View>

            {[
              {
                key: "settings",
                label: "Cài đặt tài khoản",
                icon: "user",
                screen: "AccountSettings",
              },
              {
                key: "info",
                label: "Thông tin tài khoản",
                icon: null,
                screen: "Profile",
              },
              {
                key: "tickets",
                label: "Vé của tôi",
                icon: "ticket-alt",
                screen: "MyTickets",
              },
              {
                key: "events",
                label: "Sự kiện của tôi",
                icon: "calendar-alt",
                screen: "MyEvents",
              },
            ].map((item) => {
              const isActive = item.key === "tickets"; // màn hình hiện tại

              return (
                <TouchableOpacity
                  key={item.key}
                  style={styles.menuRow}
                  onPress={() => navigation.navigate(item.screen)} // ★★ CHUYỂN MÀN HÌNH
                >
                  {item.icon ? (
                    <FontAwesome5
                      name={item.icon}
                      size={18}
                      color={isActive ? "#22c55e" : "#e5e7eb"}
                      style={styles.menuIcon}
                    />
                  ) : (
                    <View style={styles.menuIconPlaceholder} />
                  )}

                  <Text
                    style={[styles.menuText, isActive && styles.menuActive]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* RIGHT CONTENT */}
          <View style={styles.rightCol}>
            <Text style={styles.pageTitle}>Vé của tôi</Text>

            {/* TABS GROUP 1 */}
            <View style={styles.tabsRow}>
              {[
                { key: "all", label: "Tất cả" },
                { key: "success", label: "Thành công" },
                { key: "processing", label: "Đang xử lý" },
                { key: "cancelled", label: "Đã hủy" },
              ].map((item) => (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.tab,
                    activeTab === item.key && styles.tabActive,
                  ]}
                  onPress={() => setActiveTab(item.key)}
                >
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

            {/* TABS GROUP 2 */}
            <View style={styles.subTabsRow}>
              <TouchableOpacity onPress={() => setSubTab("upcoming")}>
                <Text
                  style={[
                    styles.subTab,
                    subTab === "upcoming" && styles.subTabActive,
                  ]}
                >
                  Sắp diễn ra
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setSubTab("finished")}>
                <Text
                  style={[
                    styles.subTab,
                    subTab === "finished" && styles.subTabActive,
                  ]}
                >
                  Đã kết thúc
                </Text>
              </TouchableOpacity>
            </View>

            {/* EMPTY STATE */}
            <View style={styles.centerArea}>
              <Image
                source={require("../../asset/placeholder-user.jpg")}
                style={styles.illustration}
              />

              <Text style={styles.emptyText}>Bạn chưa có vé nào</Text>

              <TouchableOpacity
                style={styles.buyBtn}
                onPress={() => navigation.navigate("Home")}
              >
                <Text style={styles.buyText}>Mua vé ngay</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Footer />
      </ScrollView>
    </View>
  );
}

/* =====================  STYLES  ===================== */

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#111319" },

  /* Breadcrumb */
  breadcrumb: {
    paddingHorizontal: 80,
    marginTop: 26,
    marginBottom: 10,
  },
  breadcrumbText: { color: "#9ca3af" },

  /* Grid layout */
  mainRow: {
    flexDirection: "row",
    paddingHorizontal: 80,
    marginTop: 10,
  },

  /* LEFT MENU */
  leftCol: {
    width: 260,
    paddingLeft: 48,
    paddingRight: 40,
  },
  accountBox: {
    alignItems: "center",
    marginBottom: 26,
  },
  avatarSmall: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 8,
  },
  leftTitle: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 20,
  },

  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    width: 240,
  },
  menuIcon: {
    width: 22,
    marginRight: 12,
    textAlign: "center",
  },
  menuIconPlaceholder: {
    width: 22,
    marginRight: 12,
  },
  menuText: {
    color: "#cbd5e1",
    fontSize: 16,
  },
  menuActive: {
    color: "#22c55e",
    fontWeight: "700",
  },

  /* RIGHT CONTENT */
  rightCol: {
    flex: 1,
    paddingLeft: 20,
  },

  pageTitle: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 20,
  },

  /* TAB GROUP 1 (PILLS) */
  tabsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 22,
    backgroundColor: "#2b2d31",
  },
  tabActive: {
    backgroundColor: "#22c55e",
  },
  tabText: {
    color: "#bfc1c4",
    fontSize: 15,
  },
  tabTextActive: {
    color: "#07301a",
    fontWeight: "700",
  },

  /* TAB GROUP 2 (UNDERLINE) */
  subTabsRow: {
    flexDirection: "row",
    gap: 26,
    marginTop: 6,
    marginBottom: 32,
    paddingLeft: 8,
  },
  subTab: {
    color: "#8f9092",
    fontSize: 15,
  },
  subTabActive: {
    color: "#ffffff",
    fontWeight: "700",
    borderBottomWidth: 2,
    borderBottomColor: "#22c55e",
    paddingBottom: 4,
  },

  /* EMPTY STATE */
  centerArea: {
    alignItems: "center",
    marginTop: 20,
  },
  illustration: {
    width: 280,
    height: 280,
    borderRadius: 140,
    marginBottom: 18,
  },
  emptyText: {
    color: "#cbd5e1",
    marginBottom: 22,
    fontSize: 16,
  },
  buyBtn: {
    backgroundColor: "#19c48a",
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 8,
  },
  buyText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
