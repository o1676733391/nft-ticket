// src/screens/CreateEventStep3Screen.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Dimensions,
  Alert,
  Switch,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import OrganizerHeader from "../components/OrganizerHeader";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const isMobile = Platform.OS === "ios" || Platform.OS === "android" || SCREEN_WIDTH < 768;

export default function CreateEventStep3Screen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { eventData } = route.params || {};

  const currentStep = 3;

  // Cài đặt sự kiện
  const [isPublic, setIsPublic] = useState(true);
  const [allowRefund, setAllowRefund] = useState(false);
  const [refundDeadline, setRefundDeadline] = useState("24"); // hours before event
  const [maxTicketsPerOrder, setMaxTicketsPerOrder] = useState("10");
  const [requireApproval, setRequireApproval] = useState(false);
  const [showRemainingTickets, setShowRemainingTickets] = useState(true);
  const [allowTransfer, setAllowTransfer] = useState(true);

  // Validation
  const validateStep3 = () => {
    const errors = [];

    if (allowRefund && (!refundDeadline || isNaN(Number(refundDeadline)) || Number(refundDeadline) < 0)) {
      errors.push("Vui lòng nhập thời hạn hoàn vé hợp lệ");
    }

    if (!maxTicketsPerOrder || isNaN(Number(maxTicketsPerOrder)) || Number(maxTicketsPerOrder) <= 0) {
      errors.push("Vui lòng nhập số vé tối đa mỗi đơn hàng hợp lệ");
    }

    return errors;
  };

  const handleNextStep = () => {
    const errors = validateStep3();

    if (errors.length > 0) {
      Alert.alert("Thông tin chưa đầy đủ", errors.join("\n"), [{ text: "OK" }]);
      return;
    }

    const step3Data = {
      ...eventData,
      settings: {
        isPublic,
        allowRefund,
        refundDeadline: allowRefund ? Number(refundDeadline) : 0,
        maxTicketsPerOrder: Number(maxTicketsPerOrder),
        requireApproval,
        showRemainingTickets,
        allowTransfer,
      },
    };

    navigation.navigate("CreateEventStep4", { eventData: step3Data });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const SettingRow = ({ label, description, value, onValueChange }) => (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingLabel}>{label}</Text>
        {description && <Text style={styles.settingDescription}>{description}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#4b5563", true: "#22c55e" }}
        thumbColor={value ? "#fff" : "#9ca3af"}
      />
    </View>
  );

  return (
    <View style={styles.screen}>
      <OrganizerHeader title="Tạo sự kiện" />

      <ScrollView style={styles.mainScroll} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Mobile Title */}
        {isMobile && (
          <View style={styles.mobileTopBar}>
            <Text style={styles.mobileTitle}>Cài đặt sự kiện</Text>
          </View>
        )}

        {/* Step Bar */}
        <View style={isMobile ? styles.stepBarMobile : styles.stepBar}>
          {["Thông tin sự kiện", "Thời gian & Loại vé", "Cài đặt", "Thông tin thanh toán"].map(
            (label, index) => {
              const step = index + 1;
              const active = step === currentStep;
              const completed = step < currentStep;
              return (
                <View key={label} style={isMobile ? styles.stepItemMobile : styles.stepItem}>
                  <View
                    style={[
                      styles.stepCircle,
                      (active || completed) && styles.stepCircleActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.stepCircleText,
                        (active || completed) && styles.stepCircleTextActive,
                      ]}
                    >
                      {completed ? "✓" : step}
                    </Text>
                  </View>
                  {!isMobile && (
                    <Text style={[styles.stepLabel, active && styles.stepLabelActive]}>
                      {label}
                    </Text>
                  )}
                </View>
              );
            }
          )}
        </View>

        {/* Form */}
        <View style={isMobile ? styles.cardMobile : styles.card}>
          {/* Hiển thị sự kiện */}
          <Text style={styles.sectionTitle}>Hiển thị sự kiện</Text>

          <SettingRow
            label="Sự kiện công khai"
            description="Sự kiện sẽ hiển thị trên trang chủ và kết quả tìm kiếm"
            value={isPublic}
            onValueChange={setIsPublic}
          />

          <SettingRow
            label="Hiển thị số vé còn lại"
            description="Người mua có thể thấy số lượng vé còn lại"
            value={showRemainingTickets}
            onValueChange={setShowRemainingTickets}
          />

          {/* Chính sách vé */}
          <Text style={[styles.sectionTitle, { marginTop: 32 }]}>Chính sách vé</Text>

          <SettingRow
            label="Cho phép hoàn vé"
            description="Người mua có thể yêu cầu hoàn vé trước sự kiện"
            value={allowRefund}
            onValueChange={setAllowRefund}
          />

          {allowRefund && (
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Thời hạn hoàn vé (giờ trước sự kiện)</Text>
              <TextInput
                style={styles.input}
                placeholder="24"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                value={refundDeadline}
                onChangeText={setRefundDeadline}
              />
            </View>
          )}

          <SettingRow
            label="Cho phép chuyển nhượng vé"
            description="Người mua có thể chuyển vé cho người khác"
            value={allowTransfer}
            onValueChange={setAllowTransfer}
          />

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Số vé tối đa mỗi đơn hàng</Text>
            <TextInput
              style={styles.input}
              placeholder="10"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
              value={maxTicketsPerOrder}
              onChangeText={setMaxTicketsPerOrder}
            />
          </View>

          {/* Phê duyệt */}
          <Text style={[styles.sectionTitle, { marginTop: 32 }]}>Phê duyệt</Text>

          <SettingRow
            label="Yêu cầu phê duyệt đơn hàng"
            description="Bạn sẽ phải phê duyệt mỗi đơn hàng trước khi vé được phát hành"
            value={requireApproval}
            onValueChange={setRequireApproval}
          />

          {/* Navigation Buttons */}
          <View style={isMobile ? styles.navigationButtonsMobile : styles.navigationButtons}>
            <TouchableOpacity style={styles.btnSecondary} onPress={handleBack}>
              <Text style={styles.btnSecondaryText}>Quay lại</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnPrimary} onPress={handleNextStep}>
              <Text style={styles.btnPrimaryText}>Tiếp theo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#020617",
  },
  mainScroll: {
    flex: 1,
  },
  mobileTopBar: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  mobileTitle: {
    color: "#22c55e",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  stepBar: {
    flexDirection: "row",
    backgroundColor: "#020617",
    paddingHorizontal: 32,
    paddingTop: 18,
    paddingBottom: 10,
  },
  stepBarMobile: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 40,
  },
  stepItemMobile: {
    alignItems: "center",
    marginHorizontal: 8,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#4b5563",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  stepCircleActive: {
    backgroundColor: "#22c55e",
    borderColor: "#22c55e",
  },
  stepCircleText: {
    color: "#9ca3af",
    fontSize: 14,
    fontWeight: "600",
  },
  stepCircleTextActive: {
    color: "#052e16",
  },
  stepLabel: {
    color: "#9ca3af",
    fontSize: 14,
  },
  stepLabelActive: {
    color: "#fff",
    fontWeight: "600",
  },
  card: {
    marginHorizontal: 32,
    marginTop: 10,
    paddingVertical: 24,
  },
  cardMobile: {
    marginHorizontal: 0,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    color: "#e5e7eb",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    color: "#e5e7eb",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  settingDescription: {
    color: "#9ca3af",
    fontSize: 13,
  },
  fieldGroup: {
    marginTop: 16,
    marginBottom: 8,
  },
  fieldLabel: {
    color: "#e5e7eb",
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#4b5563",
    backgroundColor: "#0f172a",
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#fff",
    fontSize: 15,
  },
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 40,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#1f2937",
  },
  navigationButtonsMobile: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 32,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#1f2937",
  },
  btnPrimary: {
    backgroundColor: "#22c55e",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    minWidth: 140,
    alignItems: "center",
  },
  btnPrimaryText: {
    color: "#052e16",
    fontSize: 16,
    fontWeight: "700",
  },
  btnSecondary: {
    backgroundColor: "transparent",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#4b5563",
    minWidth: 100,
    alignItems: "center",
  },
  btnSecondaryText: {
    color: "#e5e7eb",
    fontSize: 16,
    fontWeight: "600",
  },
});
