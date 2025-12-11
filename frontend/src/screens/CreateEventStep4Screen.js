// src/screens/CreateEventStep4Screen.js
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
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import OrganizerHeader from "../components/OrganizerHeader";
import { createEvent, uploadImage } from "../services/mobileApi";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const isMobile = Platform.OS === "ios" || Platform.OS === "android" || SCREEN_WIDTH < 768;

export default function CreateEventStep4Screen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { eventData } = route.params || {};

  const currentStep = 4;

  // Thông tin thanh toán
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [taxCode, setTaxCode] = useState("");

  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation
  const validateStep4 = () => {
    const errors = [];

    // Chỉ validate nếu có vé có giá > 0
    const hasPaidTickets = eventData.ticketTypes?.some(t => t.price > 0);

    if (hasPaidTickets) {
      if (!bankName.trim()) {
        errors.push("Vui lòng nhập tên ngân hàng");
      }
      if (!accountNumber.trim()) {
        errors.push("Vui lòng nhập số tài khoản");
      }
      if (!accountHolder.trim()) {
        errors.push("Vui lòng nhập tên chủ tài khoản");
      }
    }

    return errors;
  };

  const handleSubmit = async () => {
    const errors = validateStep4();

    if (errors.length > 0) {
      Alert.alert("Thông tin chưa đầy đủ", errors.join("\n"), [{ text: "OK" }]);
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload images first if they are local files
      let bannerUrl = null;
      let coverUrl = null;

      console.log("Checking images to upload...");

      // Upload main image
      if (eventData.mainImage && eventData.mainImage.startsWith('file://')) {
        console.log("Uploading main image...");
        try {
          const uploadResult = await uploadImage(eventData.mainImage, 'events');
          bannerUrl = uploadResult.url;
          console.log("Main image uploaded:", bannerUrl);
        } catch (uploadError) {
          console.error("Failed to upload main image:", uploadError);
          // Continue without image
        }
      } else if (eventData.mainImage) {
        bannerUrl = eventData.mainImage;
      }

      // Upload cover image
      if (eventData.coverImage && eventData.coverImage.startsWith('file://')) {
        console.log("Uploading cover image...");
        try {
          const uploadResult = await uploadImage(eventData.coverImage, 'events');
          coverUrl = uploadResult.url;
          console.log("Cover image uploaded:", coverUrl);
        } catch (uploadError) {
          console.error("Failed to upload cover image:", uploadError);
          // Continue without image
        }
      } else if (eventData.coverImage) {
        coverUrl = eventData.coverImage;
      }

      // Transform eventData to match backend API format
      const apiData = {
        title: eventData.eventName,
        description: eventData.eventDescription || "",
        category: eventData.category || "other",
        isOnline: !eventData.isOffline,
        venue: eventData.venueName || "",
        location: [eventData.street, eventData.ward, eventData.district, eventData.city]
          .filter(Boolean)
          .join(", ") || eventData.venueName || "",
        startDate: eventData.startDate,
        endDate: eventData.endDate || eventData.startDate,
        imageUrl: bannerUrl,
        coverUrl: coverUrl,
        ticketTemplates: (eventData.ticketTypes || []).map((t) => ({
          name: t.name,
          description: t.description || "",
          price: parseFloat(t.price) || 0,
          supply: parseInt(t.quantity) || 100,
          tier: t.tier || "general",
        })),
        settings: eventData.settings || {},
        paymentInfo: {
          bankName,
          accountNumber,
          accountHolder,
          taxCode,
        },
      };

      console.log("Sending API request...");
      console.log("API data:", JSON.stringify(apiData, null, 2));

      // Add timeout for the request
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Request timeout - vui lòng kiểm tra kết nối")), 30000)
      );

      const result = await Promise.race([
        createEvent(apiData),
        timeoutPromise
      ]);
      
      console.log("Create event result:", result);

      Alert.alert(
        "Thành công! 🎉",
        "Sự kiện của bạn đã được tạo thành công và đang chờ duyệt.",
        [
          {
            text: "Xem sự kiện",
            onPress: () => {
              // Navigate to organizer events list
              navigation.reset({
                index: 0,
                routes: [{ name: "OrganizerMain" }],
              });
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error creating event:", error);
      console.error("Error details:", error.response?.data || error.message);
      Alert.alert(
        "Lỗi", 
        error.response?.data?.error || error.message || "Không thể tạo sự kiện. Vui lòng thử lại."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  // Check if there are paid tickets
  const hasPaidTickets = eventData?.ticketTypes?.some(t => t.price > 0);

  return (
    <View style={styles.screen}>
      <OrganizerHeader title="Tạo sự kiện" />

      <ScrollView style={styles.mainScroll} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Mobile Title */}
        {isMobile && (
          <View style={styles.mobileTopBar}>
            <Text style={styles.mobileTitle}>Thông tin thanh toán</Text>
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
          {/* Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>📋 Tóm tắt sự kiện</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tên sự kiện:</Text>
              <Text style={styles.summaryValue}>{eventData?.eventName}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Số loại vé:</Text>
              <Text style={styles.summaryValue}>{eventData?.ticketTypes?.length || 0}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tổng số vé:</Text>
              <Text style={styles.summaryValue}>
                {eventData?.ticketTypes?.reduce((sum, t) => sum + t.quantity, 0) || 0}
              </Text>
            </View>
          </View>

          {/* Payment Info */}
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
            {hasPaidTickets ? (
              <>
                <Text style={styles.redStar}>* </Text>Thông tin nhận thanh toán
              </>
            ) : (
              "Thông tin nhận thanh toán (không bắt buộc)"
            )}
          </Text>

          {!hasPaidTickets && (
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                ℹ️ Sự kiện của bạn chỉ có vé miễn phí nên không cần thông tin thanh toán.
              </Text>
            </View>
          )}

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>
              {hasPaidTickets && <Text style={styles.redStar}>* </Text>}
              Tên ngân hàng
            </Text>
            <TextInput
              style={styles.input}
              placeholder="VD: Vietcombank, MB Bank..."
              placeholderTextColor="#9ca3af"
              value={bankName}
              onChangeText={setBankName}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>
              {hasPaidTickets && <Text style={styles.redStar}>* </Text>}
              Số tài khoản
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Số tài khoản ngân hàng"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
              value={accountNumber}
              onChangeText={setAccountNumber}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>
              {hasPaidTickets && <Text style={styles.redStar}>* </Text>}
              Tên chủ tài khoản
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Tên chủ tài khoản (viết hoa, không dấu)"
              placeholderTextColor="#9ca3af"
              autoCapitalize="characters"
              value={accountHolder}
              onChangeText={setAccountHolder}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Mã số thuế (không bắt buộc)</Text>
            <TextInput
              style={styles.input}
              placeholder="Mã số thuế doanh nghiệp/cá nhân"
              placeholderTextColor="#9ca3af"
              value={taxCode}
              onChangeText={setTaxCode}
            />
          </View>

          {/* Navigation Buttons */}
          <View style={isMobile ? styles.navigationButtonsMobile : styles.navigationButtons}>
            <TouchableOpacity 
              style={styles.btnSecondary} 
              onPress={handleBack}
              disabled={isSubmitting}
            >
              <Text style={styles.btnSecondaryText}>Quay lại</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.btnPrimary, isSubmitting && styles.btnDisabled]} 
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#052e16" />
              ) : (
                <Text style={styles.btnPrimaryText}>Tạo sự kiện</Text>
              )}
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
  summaryCard: {
    backgroundColor: "#111827",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  summaryTitle: {
    color: "#22c55e",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
  },
  summaryLabel: {
    color: "#9ca3af",
    fontSize: 14,
  },
  summaryValue: {
    color: "#e5e7eb",
    fontSize: 14,
    fontWeight: "600",
  },
  sectionTitle: {
    color: "#e5e7eb",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 20,
  },
  redStar: {
    color: "#f97373",
  },
  infoBox: {
    backgroundColor: "#1e3a5f",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  infoText: {
    color: "#93c5fd",
    fontSize: 14,
  },
  fieldGroup: {
    marginBottom: 16,
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
    justifyContent: "center",
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
  btnDisabled: {
    opacity: 0.6,
  },
});
