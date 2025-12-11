import React from "react";
import { View, Text, StyleSheet, Dimensions, Platform } from "react-native";
import { MaterialIcons, Feather } from "@expo/vector-icons";

const SCREEN_WIDTH = Dimensions.get("window").width;
const isMobile = Platform.OS === 'android' || Platform.OS === 'ios';
const SIDE_MARGIN = 80;
const CONTAINER_WIDTH = Math.min(SCREEN_WIDTH - SIDE_MARGIN * 2, 1320);

export default function Footer() {
  // Hide footer on mobile
  if (isMobile) {
    return null;
  }

  return (
    <View style={styles.footer}>
      <View style={styles.container}>

        <View style={styles.row}>

          {/* --- CỘT 1: Hotline --- */}
          <View style={styles.col}>
            <Text style={styles.title}>Hotline</Text>

            <View style={styles.iconRow}>
              <Feather name="clock" size={16} color="#ccc" />
              <Text style={styles.text}>Thứ 2 - Chủ Nhật (8:00 - 23:00)</Text>
            </View>

            <Text style={styles.hotline}>1900.6408</Text>

            <Text style={[styles.title, { marginTop: 24 }]}>Email</Text>
            <View style={styles.iconRow}>
              <MaterialIcons name="email" size={16} color="#ccc" />
              <Text style={styles.text}>support@ticketbox.vn</Text>
            </View>

            <Text style={[styles.title, { marginTop: 24 }]}>Văn phòng chính</Text>
            <View style={styles.iconRow}>
              <Feather name="map-pin" size={16} color="#ccc" />
              <View style={{ flexShrink: 1 }}>
                <Text style={styles.text}>
                  Tầng 12, Tòa nhà Viettel, 285 Cách Mạng Tháng Tám, Phường Hoà Hưng, TP. Hồ Chí Minh
                </Text>
              </View>
            </View>
          </View>

          {/* --- CỘT 2: Dành cho Khách hàng --- */}
          <View style={styles.col}>
            <Text style={styles.title}>Dành cho Khách hàng</Text>
            <Text style={styles.link}>Điều khoản sử dụng cho khách hàng</Text>

            <Text style={[styles.title, { marginTop: 24 }]}>Dành cho Ban Tổ chức</Text>
            <Text style={styles.link}>Điều khoản sử dụng cho ban tổ chức</Text>
          </View>

          {/* --- CỘT 3: Về công ty chúng tôi --- */}
          <View style={styles.col}>
            <Text style={styles.title}>Về công ty chúng tôi</Text>
            <Text style={styles.link}>Quy chế hoạt động</Text>
            <Text style={styles.link}>Chính sách bảo mật thông tin</Text>
            <Text style={styles.link}>Cơ chế giải quyết tranh chấp/ khiếu nại</Text>
            <Text style={styles.link}>Chính sách bảo mật thanh toán</Text>
            <Text style={styles.link}>Chính sách đổi trả & kiểm hàng</Text>
            <Text style={styles.link}>Điều kiện vận chuyển và giao nhận</Text>
            <Text style={styles.link}>Phương thức thanh toán</Text>
          </View>

        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    width: "100%",
    backgroundColor: "#2d323b",
    paddingVertical: 40,
    marginTop: 40,
  },

  container: {
    width: CONTAINER_WIDTH,
    alignSelf: "center",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  col: {
    width: "30%",
  },

  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },

  text: {
    color: "#ccc",
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 6,
  },

  iconRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },

  hotline: {
    fontSize: 24,
    fontWeight: "700",
    color: "#22c55e",
    marginTop: 4,
  },

  link: {
    color: "#ccc",
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 6,
  },
});
