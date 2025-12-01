// src/components/RegisterModal.js
import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

export default function RegisterModal({ onClose, onSwitchToLogin }) {
  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        {/* nút X */}
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>

        {/* header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Đăng ký tài khoản</Text>
        </View>

        <View style={styles.body}>
          {/* Đăng ký bằng Google */}
          <TouchableOpacity style={styles.googleBtnTop}>
            <View style={styles.googleIcon}>
              <Text style={{ fontSize: 16 }}>G</Text>
            </View>
            <Text style={styles.googleTextTop}>Đăng ký bằng Google</Text>
          </TouchableOpacity>

          {/* divider Hoặc */}
          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>Hoặc</Text>
            <View style={styles.divider} />
          </View>

          {/* 3 input */}
          <View style={styles.fieldGroup}>
            <TextInput
              placeholder="Nhập email của bạn"
              placeholderTextColor="#9ca3af"
              style={styles.input}
            />
          </View>

          <View style={styles.fieldGroup}>
            <TextInput
              placeholder="Nhập mật khẩu"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              style={styles.input}
            />
          </View>

          <View style={styles.fieldGroup}>
            <TextInput
              placeholder="Nhập lại mật khẩu"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              style={styles.input}
            />
          </View>

          
          {/* link chuyển sang login */}
          <View style={{ alignItems: "center", marginTop: 10 }}>
            <Text style={{ fontSize: 13, color: "#6b7280" }}>
              Đã có tài khoản?
            </Text>
            <TouchableOpacity onPress={onSwitchToLogin}>
              <Text style={styles.linkLogin}>Đăng nhập ngay</Text>
            </TouchableOpacity>
          </View>

         

          {/* nút Tiếp tục */}
          <TouchableOpacity style={styles.primaryBtn}>
            <Text style={styles.primaryText}>Tiếp tục</Text>
          </TouchableOpacity>
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
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
  },
  body: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  googleBtnTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1d4ed8",
    borderRadius: 6,
    paddingVertical: 10,
  },
  googleIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  googleTextTop: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
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
  fieldGroup: {
    marginBottom: 12,
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
  errorBox: {
    borderWidth: 1,
    borderColor: "#f97373",
    backgroundColor: "#fef2f2",
    borderRadius: 6,
    padding: 10,
    marginTop: 8,
  },
  errorTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  errorIcon: {
    color: "#ef4444",
    marginRight: 6,
    fontSize: 14,
  },
  errorTitle: {
    color: "#ef4444",
    fontWeight: "700",
    fontSize: 13,
  },
  errorItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 2,
  },
  errorDot: {
    color: "#ef4444",
    marginRight: 6,
    fontSize: 10,
    marginTop: 2,
  },
  errorText: {
    color: "#991b1b",
    fontSize: 13,
    flexShrink: 1,
  },
  linkLogin: {
    marginTop: 4,
    color: "#2563eb",
    fontSize: 13,
    fontWeight: "600",
  },
  cfRow: {
    flexDirection: "row",
    alignItems: "center",
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
  primaryBtn: {
    marginTop: 14,
    backgroundColor: "#d1d5db",
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: "center",
  },
  primaryText: {
    color: "#4b5563",
    fontWeight: "700",
    fontSize: 15,
  },
});
