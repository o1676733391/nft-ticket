// src/components/Header.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

import SearchDropdown from "./SearchDropdown";
import { homeData } from "../data/homeData";
import { useAuth } from "../context/AuthContext";
import { useAuthStore } from "../store/authStore";

export default function Header({ onLoginPress, user: userProp, onLogout }) {
  const navigation = useNavigation();
  const auth = useAuth();
  const { user: storeUser, walletAddress, isAuthenticated, logout: storeLogout } = useAuthStore();
  
  // Use Zustand store if available, fallback to props/context
  const user = storeUser || userProp || auth.user;
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
    // Call both logout methods
    storeLogout();
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
              {user.avatar ? (
                <Image source={user.avatar} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarPlaceholderText}>👤</Text>
                </View>
              )}
              <Text style={styles.accountText}>
                {walletAddress 
                  ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                  : user.name || 'Account'
                } ▾
              </Text>
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  logo: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    minWidth: 100,
  },
  searchContainer: {
    flex: 1,
    minWidth: 200,
    backgroundColor: "#fff",
    flexDirection: "row",
    borderRadius: 6,
    overflow: "hidden",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    outlineStyle: "none",
  },
  searchButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: "center",
  },
  searchButtonText: {
    color: "#4f4747ff",
    fontWeight: "500",
    fontSize: 13,
  },
  createButton: {
    backgroundColor: "#21d598",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    fontSize: 13,
  },
  createButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
  loginText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.06)",
    maxWidth: 150,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 6,
  },
  avatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 14,
  },
  accountText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    flexShrink: 1,
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
