// src/components/LoginModal.js
import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

export default function LoginModal({ onClose, onSwitchToRegister, onLoginSuccess }) {
  return (
    <View style={styles.overlay}>
      <View className="login-modal-card" style={styles.card}>
        {/* Nút X */}
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Đăng nhập</Text>
          <View style={styles.mascot}>
            <Text style={{ fontSize: 26 }}>🐶</Text>
          </View>
        </View>

        {/* Body */}
        <View style={styles.body}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Nhập email hoặc số điện thoại</Text>
            <TextInput
              placeholder="Nhập email hoặc số điện thoại"
              placeholderTextColor="#9ca3af"
              style={styles.input}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Nhập mật khẩu</Text>
            <TextInput
              placeholder="Nhập mật khẩu"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              style={styles.input}
            />
          </View>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => {
              // mock login success — in real app validate credentials
              const user = {
                name: "Tài khoản",
                avatar: require("../../asset/concert-show-performance.jpg"),
              };
              if (onLoginSuccess) onLoginSuccess(user);
            }}
          >
            <Text style={styles.primaryText}>Tiếp tục</Text>
          </TouchableOpacity>



          <TouchableOpacity>
            <Text style={styles.linkCenter}>Quên mật khẩu?</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onSwitchToRegister}>
            <Text style={styles.linkCenter}>
              Chưa có tài khoản? Tạo tài khoản ngay
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>Hoặc</Text>
            <View style={styles.divider} />
          </View>

          {/* Login Google */}
          <TouchableOpacity style={styles.googleBtn}>
            <View style={styles.googleIcon}>
              <Text style={{ fontSize: 16 }}>G</Text>
            </View>
            <Text style={styles.googleText}>Đăng nhập bằng Google</Text>
          </TouchableOpacity>

          <Text style={styles.footerText}>
            Bằng việc tiếp tục, bạn đã đọc và đồng ý với Điều khoản sử dụng
            và Chính sách bảo mật thông tin cá nhân của Ticketbox.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  card: {
    width: 420,
    maxWidth: "90%",
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  closeBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 2,
    padding: 4,
  },
  closeText: {
    fontSize: 18,
    color: "#4b5563",
  },
  header: {
    backgroundColor: "#19c48a",
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    marginRight: 46, // chừa chỗ cho mascot
  },
  mascot: {
    position: "absolute",
    right: 24,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#fef9c3",
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: "#fff",
  },
  primaryBtn: {
    marginTop: 8,
    backgroundColor: "#19c48a",
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: "center",
  },
  primaryText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  cfRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 4,
  },
  cfIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#22c55e",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    backgroundColor: "#ecfdf3",
  },
  cfText: {
    fontSize: 14,
    color: "#16a34a",
    fontWeight: "600",
  },
  linkCenter: {
    marginTop: 6,
    textAlign: "center",
    color: "#2563eb",
    fontSize: 13,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  dividerText: {
    marginHorizontal: 8,
    color: "#6b7280",
    fontSize: 13,
  },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  googleIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#9ca3af",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  googleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  footerText: {
    marginTop: 14,
    fontSize: 11,
    color: "#6b7280",
    lineHeight: 15,
    textAlign: "center",
  },
});
