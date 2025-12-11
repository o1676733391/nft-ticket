// src/components/OrganizerHeader.js
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
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { useAuthStore } from "../store/authStore";

export default function OrganizerHeader({ title }) {
  const navigation = useNavigation();
  const auth = useAuth();
  const { user: storeUser, walletAddress, logout: storeLogout } = useAuthStore();
  
  const user = storeUser || auth.user;
  const isMobile = Platform.OS === "android" || Platform.OS === "ios";

  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const handleAccountToggle = () => setShowAccountMenu((s) => !s);

  const handleGoToUserHome = () => {
    // Navigate to user's Home screen (exit organizer dashboard)
    navigation.navigate("Home");
  };

  const handleMenuNavigate = (routeName) => {
    setShowAccountMenu(false);
    navigation.navigate(routeName);
  };

  const handleLogout = () => {
    setShowAccountMenu(false);
    storeLogout();
    auth?.logout?.();
    navigation.navigate("Home");
  };

  const handleSwitchToUser = () => {
    setShowAccountMenu(false);
    navigation.navigate("Home");
  };

  return (
    <View style={{ zIndex: 200 }}>
      <View style={[styles.header, isMobile && styles.headerMobile]}>
        {/* Logo - khi ấn vào sẽ về trang Home của user */}
        <TouchableOpacity onPress={handleGoToUserHome}>
          <Text style={[styles.logo, isMobile && styles.logoMobile]}>ticketbox</Text>
        </TouchableOpacity>

        {/* Search bar - chỉ hiện trên desktop */}
        {!isMobile && (
          <View style={styles.searchContainer}>
            <TextInput
              placeholder="Tìm kiếm sự kiện..."
              placeholderTextColor="#666"
              style={styles.searchInput}
            />
          </View>
        )}

        {/* Account menu */}
        <View>
          <TouchableOpacity
            style={styles.accountRow}
            onPress={handleAccountToggle}
          >
            {user?.avatar ? (
              <Image 
                source={typeof user.avatar === 'string' ? { uri: user.avatar } : user.avatar} 
                style={styles.avatar} 
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarPlaceholderText}>👤</Text>
              </View>
            )}
            <Text style={styles.accountText}>
              {walletAddress 
                ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                : user?.name || 'Account'
              } ▾
            </Text>
          </TouchableOpacity>

          {showAccountMenu && (
            <View style={styles.accountMenu}>
              {/* Switch to User mode */}
              <TouchableOpacity
                style={styles.accountMenuItem}
                onPress={handleSwitchToUser}
              >
                <Text style={styles.accountMenuIcon}>🏠</Text>
                <Text style={styles.accountMenuText}>Chế độ người dùng</Text>
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              <TouchableOpacity
                style={styles.accountMenuItem}
                onPress={() => handleMenuNavigate("OrgProfile")}
              >
                <Text style={styles.accountMenuIcon}>👤</Text>
                <Text style={styles.accountMenuText}>Tài khoản Organizer</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.accountMenuItem}
                onPress={() => handleMenuNavigate("OrgEvents")}
              >
                <Text style={styles.accountMenuIcon}>📅</Text>
                <Text style={styles.accountMenuText}>Quản lý sự kiện</Text>
              </TouchableOpacity>

              <View style={styles.menuDivider} />

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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#111827",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
  },
  headerMobile: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  logo: {
    color: "#22c55e",
    fontSize: 24,
    fontWeight: "bold",
    fontStyle: "italic",
  },
  logoMobile: {
    fontSize: 20,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1f2937",
    borderRadius: 20,
    marginHorizontal: 20,
    maxWidth: 400,
  },
  searchInput: {
    flex: 1,
    height: 36,
    paddingHorizontal: 16,
    color: "#fff",
    fontSize: 14,
  },
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1f2937",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
  },
  avatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#374151",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  avatarPlaceholderText: {
    fontSize: 14,
  },
  accountText: {
    color: "#fff",
    fontSize: 14,
  },
  accountMenu: {
    position: "absolute",
    top: 45,
    right: 0,
    backgroundColor: "#1f2937",
    borderRadius: 8,
    paddingVertical: 8,
    minWidth: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  accountMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  accountMenuIcon: {
    fontSize: 16,
    marginRight: 12,
    width: 24,
    textAlign: "center",
  },
  accountMenuText: {
    color: "#e5e7eb",
    fontSize: 14,
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#374151",
    marginVertical: 4,
  },
});
