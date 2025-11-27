// src/components/Header.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native-web";
import { Platform } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native"; // chỉ cần dòng này

import SearchDropdown from "./SearchDropdown";
import { homeData } from "../data/homeData";
import { useAuth } from "../context/AuthContext";

export default function Header({ onLoginPress, user: userProp, onLogout }) {
  const navigation = useNavigation();
  const auth = useAuth();
  const user = userProp ?? auth.user;
  const route = useRoute();

  const [searchText, setSearchText] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const handleSearchPress = () => {
    const q = searchText.trim();
    setShowDropdown(false);
    navigation.navigate("SearchResult", { query: q });
  };

  const isWeb = Platform.OS === "web";

  const handleBack = () => {
    try {
      if (navigation.canGoBack()) {
        navigation.goBack();
        return;
      }
    } catch (e) {}

    if (window?.history?.length) window.history.back();
  };

  const handleAccountToggle = () => setShowAccountMenu((s) => !s);

  const handleMenuNavigate = (routeName) => {
    setShowAccountMenu(false);
    navigation.navigate(routeName);
  };

  const handleLogout = () => {
    setShowAccountMenu(false);
    auth?.logout?.();
    navigation.navigate("Home");
  };

  return (
    <View style={{ zIndex: 200 }}>
      <View style={styles.header}>
        {isWeb &&
          route?.name !== "Home" &&
          navigation.canGoBack() && (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Text style={styles.backIcon}>◀</Text>
            </TouchableOpacity>
          )}

        <TouchableOpacity onPress={() => navigation.navigate("Home")}>
          <Text style={styles.logo}>ticketbox</Text>
        </TouchableOpacity>

        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Bạn tìm gì hôm nay?"
            placeholderTextColor="#666"
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            onFocus={() => setShowDropdown(true)}
          />

          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearchPress}
          >
            <Text style={styles.searchButtonText}>Tìm kiếm</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate("CreateEvent")}>
          <Text style={styles.createButton}>Tạo sự kiện</Text>
        </TouchableOpacity>

        {user ? (
          <View>
            <TouchableOpacity
              style={styles.accountRow}
              onPress={handleAccountToggle}
            >
              <Image source={user.avatar} style={styles.avatar} />
              <Text style={styles.accountText}>{user.name} ▾</Text>
            </TouchableOpacity>

            {showAccountMenu && (
              <View style={styles.accountMenu}>
                <TouchableOpacity
                  style={styles.accountMenuItem}
                  onPress={() => handleMenuNavigate("MyTickets")}
                >
                  <Text style={styles.accountMenuIcon}>🎫</Text>
                  <Text style={styles.accountMenuText}>Vé của tôi</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.accountMenuItem}
                  onPress={() => handleMenuNavigate("MyEvents")}
                >
                  <Text style={styles.accountMenuIcon}>📅</Text>
                  <Text style={styles.accountMenuText}>Sự kiện của tôi</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.accountMenuItem}
                  onPress={() => handleMenuNavigate("Profile")}
                >
                  <Text style={styles.accountMenuIcon}>👤</Text>
                  <Text style={styles.accountMenuText}>Tài khoản của tôi</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.accountMenuItem}
                  onPress={handleLogout}
                >
                  <Text style={styles.accountMenuIcon}>↩️</Text>
                  <Text style={styles.accountMenuText}>Đăng xuất</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          <TouchableOpacity onPress={onLoginPress}>
            <Text style={styles.loginText}>Đăng nhập | Đăng ký</Text>
          </TouchableOpacity>
        )}
      </View>

      <SearchDropdown
        visible={showDropdown}
        onRequestClose={() => setShowDropdown(false)}
        recentSearches={["anh trai say hi", "soobin", "idecaf"]}
        categories={[
          { title: "Nhạc sống", image: require("../../asset/flower-workshop.jpg") },
          { title: "Sân khấu & Nghệ thuật", image: require("../../asset/flower-workshop.jpg") },
          { title: "Thể Thao", image: require("../../asset/flower-workshop.jpg") },
          { title: "Khác", image: require("../../asset/flower-workshop.jpg") },
        ]}
        suggestedEvents={homeData.forYouEvents}
      />
    </View>
  );
}




const styles = StyleSheet.create({
  header: {
    backgroundColor: "#19c48a",
    paddingVertical: 25,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },
  logo: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
  },
  searchContainer: {
    flex: 1,
    backgroundColor: "#fff",
    flexDirection: "row",
    borderRadius: 6,
    overflow: "hidden",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 9,
    fontSize: 15,
    outlineStyle: "none",
  },
  searchButton: {
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  searchButtonText: {
    color: "#4f4747ff",
    fontWeight: "500",
  },
  createButton: {
    backgroundColor: "#21d598",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  createButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  loginText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
  },
  accountText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  accountMenu: {
    position: "absolute",
    top: 56,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 8,
    width: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    zIndex: 9999,
  },
  accountMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  accountMenuIcon: {
    marginRight: 12,
    fontSize: 18,
  },
  accountMenuText: {
    color: "#111",
    fontSize: 14,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  backIcon: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
