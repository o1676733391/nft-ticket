// src/screens/ProfileScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";

export default function ProfileScreen({ navigation }) {
  const { user, isAuthenticated } = useAuth();
  
  const [profile, setProfile] = useState({
    name: "",
    phoneCountry: "+84",
    phone: "",
    email: "",
    dob: "",
    gender: "",
  });

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.full_name || user.username || "",
        phoneCountry: "+84",
        phone: user.phone || "",
        email: user.email || "",
        dob: "",
        gender: "",
      });
    }
  }, [user]);

  const setField = (k, v) => setProfile({ ...profile, [k]: v });

  const menuItems = [
    { key: "settings", label: "Cài đặt tài khoản", icon: "user", active: false },
    { key: "info", label: "Thông tin tài khoản", icon: null, active: true },
    { key: "tickets", label: "Vé của tôi", icon: "ticket-alt", active: false },
    { key: "events", label: "Sự kiện của tôi", icon: "calendar-alt", active: false },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#111319" }}>
      <Header />

      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>

        {/* BREADCRUMB */}
        <View style={styles.breadcrumb}>
          <Text style={styles.breadcrumbText}>
            Trang chủ › Cài đặt tài khoản › Thông tin tài khoản
          </Text>
        </View>

        {/* MAIN */}
        <View style={styles.mainRow}>

          {/* LEFT MENU */}
          <View style={styles.leftCol}>
            <View style={styles.accountBox}>
              <Image
                source={user?.avatar_url ? { uri: user.avatar_url } : require("../../asset/concert-show-performance.jpg")}
                style={styles.avatarSmall}
              />
              <Text style={styles.leftTitle}>Tài khoản của {user?.username || 'User'}</Text>
            </View>

            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={styles.menuRow}
                onPress={() => {
                  if (item.key === 'tickets') navigation.navigate('MyTickets');
                }}
              >
                {item.icon ? (
                  <FontAwesome5
                    name={item.icon}
                    size={18}
                    color={item.active ? "#22c55e" : "#e5e7eb"}
                    style={styles.menuIcon}
                  />
                ) : (
                  <View style={styles.menuIconPlaceholder} />
                )}

                <Text
                  style={[styles.menuText, item.active && styles.menuActive]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* RIGHT CONTENT */}
          <View style={styles.rightCol}>

            <Text style={styles.pageTitle}>Thông tin tài khoản</Text>

            {/* Avatar */}
            <View style={styles.avatarWrap}>
              <Image
                source={user?.avatar_url ? { uri: user.avatar_url } : require("../../asset/concert-show-performance.jpg")}
                style={styles.avatarLarge}
              />

              <TouchableOpacity style={styles.cameraBtn}>
                <Text style={{ color: "#fff" }}>📷</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.helperText}>
              Cung cấp thông tin chính xác sẽ hỗ trợ bạn trong quá trình mua vé,
              hoặc khi cần xác thực vé
            </Text>

            {/* FORM */}
            <View style={styles.form}>

              <Text style={styles.label}>Họ và tên</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập ở đây"
                value={profile.name}
                onChangeText={(t) => setField("name", t)}
              />

              <Text style={styles.label}>Số điện thoại</Text>
              <View style={styles.phoneRow}>
                <TouchableOpacity style={styles.countryBox}>
                  <Text style={styles.countryText}>{profile.phoneCountry}</Text>
                </TouchableOpacity>

                <TextInput
                  style={[styles.input, styles.phoneInput]}
                  placeholder="Nhập ở đây"
                  value={profile.phone}
                  onChangeText={(t) => setField("phone", t)}
                />
              </View>

              <Text style={styles.label}>Email</Text>
              <View style={styles.emailRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Nhập ở đây"
                  value={profile.email}
                  onChangeText={(t) => setField("email", t)}
                />

                {profile.email.includes("@") && (
                  <Text style={styles.checkMark}>✓</Text>
                )}
              </View>

              <Text style={styles.label}>Ngày tháng năm sinh</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập ở đây"
                value={profile.dob}
                onChangeText={(t) => setField("dob", t)}
              />

              <Text style={styles.label}>Giới tính</Text>
              <View style={styles.genderRow}>
                {["Nam", "Nữ", "Khác"].map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={styles.genderBtn}
                    onPress={() => setField("gender", g)}
                  >
                    <View
                      style={[
                        styles.radioCircle,
                        profile.gender === g && styles.radioActive,
                      ]}
                    />
                    <Text style={styles.genderText}>{g}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.saveBtn}>
                <Text style={styles.saveText}>Hoàn thành</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>

        <Footer />
      </ScrollView>
    </View>
  );
}


/* ========================== STYLES ========================== */

const styles = StyleSheet.create({
  breadcrumb: {
    paddingHorizontal: 80,
    marginTop: 26,
    marginBottom: 10,
  },
  breadcrumbText: { color: "#9ca3af" },

  mainRow: {
    flexDirection: "row",
    paddingHorizontal: 80,
    marginTop: 10,
  },

  /* LEFT */
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

  /* RIGHT - CENTER ALIGN */
  rightCol: {
    flex: 1,
    alignItems: "center",       // ★ CĂN GIỮA PHẦN NỘI DUNG
  },

  pageTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
  },

  /* AVATAR */
  avatarWrap: {
    alignItems: "center",
    marginBottom: 8,
  },
  avatarLarge: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#fff",
  },
  cameraBtn: {
    position: "absolute",
    bottom: 6,
    right: 24,
    backgroundColor: "#19c48a",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  helperText: {
    color: "#cbd5e1",
    textAlign: "center",
    width: 430,
    marginBottom: 26,
    lineHeight: 20,
  },

  /* FORM BOX */
  form: {
    width: 430,   // ★ CHUẨN TICKETBOX
  },

  label: {
    color: "#e5e7eb",
    marginBottom: 6,
    marginTop: 10,
    fontSize: 15,
  },

  input: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },

  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  countryBox: {
    width: 90,
    backgroundColor: "#fff",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  countryText: { color: "#111", fontWeight: "600" },
  phoneInput: { flex: 1 },

  emailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkMark: {
    color: "#22c55e",
    fontSize: 22,
    marginLeft: 10,
  },

  genderRow: {
    flexDirection: "row",
    marginTop: 6,
    gap: 20,
  },
  genderBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#9ca3af",
  },
  radioActive: {
    backgroundColor: "#22c55e",
    borderColor: "#22c55e",
  },
  genderText: { color: "#fff" },

  saveBtn: {
    marginTop: 22,
    backgroundColor: "#19c48a",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
