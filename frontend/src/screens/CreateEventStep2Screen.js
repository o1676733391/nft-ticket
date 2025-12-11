// src/screens/CreateEventStep2Screen.js
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
  Modal,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import OrganizerHeader from "../components/OrganizerHeader";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const isMobile = Platform.OS === "ios" || Platform.OS === "android" || SCREEN_WIDTH < 768;

// Conditionally import DateTimePicker only on native platforms
let DateTimePicker = null;
if (Platform.OS !== "web") {
  DateTimePicker = require("@react-native-community/datetimepicker").default;
}

export default function CreateEventStep2Screen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { eventData } = route.params || {};

  // Current step
  const currentStep = 2;

  // Thời gian sự kiện
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState("date"); // "date" or "time"
  const [tempDate, setTempDate] = useState(new Date()); // Temp date for Android 2-step picker

  // Loại vé
  const [ticketTypes, setTicketTypes] = useState([
    { id: 1, name: "Vé thường", price: "", quantity: "", description: "" },
  ]);

  // Thêm loại vé mới
  const addTicketType = () => {
    const newId = ticketTypes.length + 1;
    setTicketTypes([
      ...ticketTypes,
      { id: newId, name: "", price: "", quantity: "", description: "" },
    ]);
  };

  // Xóa loại vé
  const removeTicketType = (id) => {
    if (ticketTypes.length === 1) {
      Alert.alert("Lỗi", "Phải có ít nhất một loại vé");
      return;
    }
    setTicketTypes(ticketTypes.filter((t) => t.id !== id));
  };

  // Cập nhật loại vé
  const updateTicketType = (id, field, value) => {
    setTicketTypes(
      ticketTypes.map((t) =>
        t.id === id ? { ...t, [field]: value } : t
      )
    );
  };

  // Format date
  const formatDate = (date) => {
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Handle date picker for Android (2-step: date then time)
  const onStartDateChange = (event, selectedDate) => {
    if (Platform.OS === "android") {
      setShowStartPicker(false);
      if (event.type === "dismissed") return;
      
      if (selectedDate) {
        if (pickerMode === "date") {
          setTempDate(selectedDate);
          setPickerMode("time");
          setTimeout(() => setShowStartPicker(true), 100);
        } else {
          // Combine temp date with selected time
          const finalDate = new Date(tempDate);
          finalDate.setHours(selectedDate.getHours());
          finalDate.setMinutes(selectedDate.getMinutes());
          setStartDate(finalDate);
          setPickerMode("date");
        }
      }
    } else {
      // iOS
      if (selectedDate) setStartDate(selectedDate);
    }
  };

  const onEndDateChange = (event, selectedDate) => {
    if (Platform.OS === "android") {
      setShowEndPicker(false);
      if (event.type === "dismissed") return;
      
      if (selectedDate) {
        if (pickerMode === "date") {
          setTempDate(selectedDate);
          setPickerMode("time");
          setTimeout(() => setShowEndPicker(true), 100);
        } else {
          // Combine temp date with selected time
          const finalDate = new Date(tempDate);
          finalDate.setHours(selectedDate.getHours());
          finalDate.setMinutes(selectedDate.getMinutes());
          setEndDate(finalDate);
          setPickerMode("date");
        }
      }
    } else {
      // iOS
      if (selectedDate) setEndDate(selectedDate);
    }
  };

  const openStartPicker = () => {
    setPickerMode("date");
    setShowStartPicker(true);
  };

  const openEndPicker = () => {
    setPickerMode("date");
    setShowEndPicker(true);
  };

  // Validation
  const validateStep2 = () => {
    const errors = [];

    if (endDate <= startDate) {
      errors.push("Thời gian kết thúc phải sau thời gian bắt đầu");
    }

    for (const ticket of ticketTypes) {
      if (!ticket.name.trim()) {
        errors.push("Vui lòng nhập tên cho tất cả loại vé");
        break;
      }
      if (!ticket.price || isNaN(Number(ticket.price)) || Number(ticket.price) < 0) {
        errors.push("Vui lòng nhập giá vé hợp lệ");
        break;
      }
      if (!ticket.quantity || isNaN(Number(ticket.quantity)) || Number(ticket.quantity) <= 0) {
        errors.push("Vui lòng nhập số lượng vé hợp lệ");
        break;
      }
    }

    return errors;
  };

  const handleNextStep = () => {
    const errors = validateStep2();

    if (errors.length > 0) {
      Alert.alert("Thông tin chưa đầy đủ", errors.join("\n"), [{ text: "OK" }]);
      return;
    }

    // Combine data and navigate to step 3
    const step2Data = {
      ...eventData,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      ticketTypes: ticketTypes.map((t) => ({
        name: t.name,
        price: Number(t.price),
        quantity: Number(t.quantity),
        description: t.description,
      })),
    };

    navigation.navigate("CreateEventStep3", { eventData: step2Data });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.screen}>
      <OrganizerHeader title="Tạo sự kiện" />

      <ScrollView style={styles.mainScroll} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Mobile Title */}
        {isMobile && (
          <View style={styles.mobileTopBar}>
            <Text style={styles.mobileTitle}>Thời gian & Loại vé</Text>
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
          {/* Thời gian sự kiện */}
          <Text style={styles.sectionTitle}>
            <Text style={styles.redStar}>* </Text>Thời gian sự kiện
          </Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Thời gian bắt đầu</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={openStartPicker}
            >
              <Text style={styles.dateText}>{formatDate(startDate)}</Text>
            </TouchableOpacity>
            {showStartPicker && DateTimePicker && (
              <DateTimePicker
                value={pickerMode === "time" ? startDate : startDate}
                mode={pickerMode}
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onStartDateChange}
                minimumDate={new Date()}
              />
            )}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Thời gian kết thúc</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={openEndPicker}
            >
              <Text style={styles.dateText}>{formatDate(endDate)}</Text>
            </TouchableOpacity>
            {showEndPicker && DateTimePicker && (
              <DateTimePicker
                value={pickerMode === "time" ? endDate : endDate}
                mode={pickerMode}
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onEndDateChange}
                minimumDate={startDate}
              />
            )}
          </View>

          {/* Loại vé */}
          <Text style={[styles.sectionTitle, { marginTop: 32 }]}>
            <Text style={styles.redStar}>* </Text>Loại vé
          </Text>

          {ticketTypes.map((ticket, index) => (
            <View key={ticket.id} style={styles.ticketCard}>
              <View style={styles.ticketHeader}>
                <Text style={styles.ticketTitle}>Loại vé {index + 1}</Text>
                {ticketTypes.length > 1 && (
                  <TouchableOpacity onPress={() => removeTicketType(ticket.id)}>
                    <Text style={styles.removeBtn}>✕ Xóa</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Tên loại vé</Text>
                <TextInput
                  style={styles.input}
                  placeholder="VD: Vé VIP, Vé thường..."
                  placeholderTextColor="#9ca3af"
                  value={ticket.name}
                  onChangeText={(v) => updateTicketType(ticket.id, "name", v)}
                />
              </View>

              <View style={isMobile ? styles.fieldRowMobile : styles.fieldRow}>
                <View style={isMobile ? styles.fieldColMobile : styles.fieldCol}>
                  <Text style={styles.fieldLabel}>Giá vé (VNĐ)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor="#9ca3af"
                    keyboardType="numeric"
                    value={ticket.price}
                    onChangeText={(v) => updateTicketType(ticket.id, "price", v)}
                  />
                </View>
                <View style={isMobile ? styles.fieldColMobile : styles.fieldCol}>
                  <Text style={styles.fieldLabel}>Số lượng</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor="#9ca3af"
                    keyboardType="numeric"
                    value={ticket.quantity}
                    onChangeText={(v) => updateTicketType(ticket.id, "quantity", v)}
                  />
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Mô tả (không bắt buộc)</Text>
                <TextInput
                  style={[styles.input, styles.textAreaSmall]}
                  placeholder="Mô tả quyền lợi của loại vé này..."
                  placeholderTextColor="#9ca3af"
                  multiline
                  textAlignVertical="top"
                  value={ticket.description}
                  onChangeText={(v) => updateTicketType(ticket.id, "description", v)}
                />
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.addTicketBtn} onPress={addTicketType}>
            <Text style={styles.addTicketText}>+ Thêm loại vé</Text>
          </TouchableOpacity>

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
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  redStar: {
    color: "#f97373",
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
  dateInput: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#4b5563",
    backgroundColor: "#0f172a",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  dateText: {
    color: "#fff",
    fontSize: 15,
  },
  fieldRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  fieldRowMobile: {
    flexDirection: "column",
  },
  fieldCol: {
    flex: 1,
  },
  fieldColMobile: {
    marginBottom: 16,
  },
  textAreaSmall: {
    height: 80,
    textAlignVertical: "top",
  },
  ticketCard: {
    backgroundColor: "#111827",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  ticketHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  ticketTitle: {
    color: "#22c55e",
    fontSize: 16,
    fontWeight: "600",
  },
  removeBtn: {
    color: "#ef4444",
    fontSize: 14,
  },
  addTicketBtn: {
    borderWidth: 2,
    borderColor: "#22c55e",
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 24,
  },
  addTicketText: {
    color: "#22c55e",
    fontSize: 16,
    fontWeight: "600",
  },
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#1f2937",
  },
  navigationButtonsMobile: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
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
