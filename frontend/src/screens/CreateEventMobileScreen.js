// src/screens/CreateEventMobileScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Platform,
  Modal,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../context/AuthContext";
import * as mobileApi from "../services/mobileApi";

const CATEGORY_OPTIONS = [
  { id: "music", label: "Nhạc sống", icon: "music" },
  { id: "theater", label: "Sân khấu & Nghệ thuật", icon: "theater-masks" },
  { id: "sports", label: "Thể thao", icon: "running" },
  { id: "other", label: "Khác", icon: "ellipsis-h" },
];

const STEPS = [
  { id: 1, title: "Thông tin cơ bản", icon: "file-alt" },
  { id: 2, title: "Địa điểm & Thời gian", icon: "map-marker-alt" },
  { id: 3, title: "Loại vé", icon: "ticket-alt" },
  { id: 4, title: "Xác nhận", icon: "check-circle" },
];

export default function CreateEventMobileScreen({ navigation }) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Step 1: Basic Info
  const [mainImage, setMainImage] = useState(null);
  const [eventName, setEventName] = useState("");
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [description, setDescription] = useState("");

  // Step 2: Location & Time
  const [isOffline, setIsOffline] = useState(true);
  const [venueName, setVenueName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");

  // Step 3: Tickets
  const [tickets, setTickets] = useState([
    { id: 1, name: "Vé thường", price: "", quantity: "", tier: "standard" },
  ]);

  // Image Picker
  const pickImage = async () => {
    try {
      if (Platform.OS !== "web") {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) {
          Alert.alert("Thông báo", "Cần quyền truy cập thư viện ảnh");
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setMainImage(result.assets[0].uri);
      }
    } catch (err) {
      console.error("Pick image error:", err);
    }
  };

  // Add ticket type
  const addTicketType = () => {
    setTickets([
      ...tickets,
      {
        id: Date.now(),
        name: "",
        price: "",
        quantity: "",
        tier: "standard",
      },
    ]);
  };

  // Remove ticket type
  const removeTicketType = (id) => {
    if (tickets.length > 1) {
      setTickets(tickets.filter((t) => t.id !== id));
    }
  };

  // Update ticket
  const updateTicket = (id, field, value) => {
    setTickets(
      tickets.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  // Validate step
  const validateStep = () => {
    if (currentStep === 1) {
      if (!eventName.trim()) {
        Alert.alert("Lỗi", "Vui lòng nhập tên sự kiện");
        return false;
      }
    } else if (currentStep === 2) {
      if (isOffline && !venueName.trim()) {
        Alert.alert("Lỗi", "Vui lòng nhập tên địa điểm");
        return false;
      }
      if (!startDate || !startTime) {
        Alert.alert("Lỗi", "Vui lòng chọn ngày giờ bắt đầu");
        return false;
      }
    } else if (currentStep === 3) {
      const validTickets = tickets.filter(
        (t) => t.name && t.price && t.quantity
      );
      if (validTickets.length === 0) {
        Alert.alert("Lỗi", "Vui lòng thêm ít nhất một loại vé");
        return false;
      }
    }
    return true;
  };

  // Next step
  const nextStep = () => {
    if (validateStep() && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Previous step
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Submit event
  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Upload image if local file
      let uploadedImageUrl = mainImage;
      if (mainImage && mainImage.startsWith('file://')) {
        try {
          console.log('Uploading image...');
          const uploadResult = await mobileApi.uploadImage(mainImage, 'events');
          uploadedImageUrl = uploadResult.url;
          console.log('Image uploaded:', uploadedImageUrl);
        } catch (uploadError) {
          console.error('Failed to upload image:', uploadError);
          // Continue without image
          uploadedImageUrl = null;
        }
      }

      // Format data to match backend API expectations
      const eventData = {
        title: eventName,
        description: description,
        category: category.id || "other",
        isOnline: !isOffline,
        venue: venueName,
        location: address || city || venueName,
        startDate: `${startDate}T${startTime}:00`,
        endDate: endDate ? `${endDate}T${endTime || "23:59"}:00` : `${startDate}T${startTime}:00`,
        imageUrl: uploadedImageUrl,
        ticketTemplates: tickets
          .filter((t) => t.name && t.price && t.quantity)
          .map((t) => ({
            name: t.name,
            description: t.description || "",
            price: parseFloat(t.price) || 0,
            supply: parseInt(t.quantity) || 100,
            tier: t.tier || "general",
          })),
      };

      console.log("Creating event with data:", JSON.stringify(eventData, null, 2));

      const result = await mobileApi.createEvent(eventData);
      console.log("Create event result:", result);
      
      Alert.alert("Thành công", "Sự kiện đã được tạo!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error("Create event error:", error);
      console.error("Error details:", error.response?.data || error.message);
      Alert.alert(
        "Lỗi", 
        error.response?.data?.error || error.message || "Không thể tạo sự kiện. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return null;
    }
  };

  // Step 1: Basic Info
  const renderStep1 = () => (
    <View style={styles.stepContent}>
      {/* Event Image */}
      <TouchableOpacity style={styles.imageUpload} onPress={pickImage}>
        {mainImage ? (
          <Image source={{ uri: mainImage }} style={styles.uploadedImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <FontAwesome5 name="image" size={40} color="#6b7280" />
            <Text style={styles.imagePlaceholderText}>
              Tải ảnh sự kiện (16:9)
            </Text>
          </View>
        )}
        <View style={styles.imageEditBadge}>
          <FontAwesome5 name="camera" size={14} color="#fff" />
        </View>
      </TouchableOpacity>

      {/* Event Name */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
          <Text style={styles.required}>* </Text>Tên sự kiện
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập tên sự kiện"
          placeholderTextColor="#6b7280"
          value={eventName}
          onChangeText={setEventName}
          maxLength={100}
        />
        <Text style={styles.charCount}>{eventName.length}/100</Text>
      </View>

      {/* Category */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
          <Text style={styles.required}>* </Text>Thể loại
        </Text>
        <View style={styles.categoryGrid}>
          {CATEGORY_OPTIONS.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryItem,
                category.id === cat.id && styles.categoryItemActive,
              ]}
              onPress={() => setCategory(cat)}
            >
              <FontAwesome5
                name={cat.icon}
                size={20}
                color={category.id === cat.id ? "#10b981" : "#9ca3af"}
              />
              <Text
                style={[
                  styles.categoryText,
                  category.id === cat.id && styles.categoryTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Description */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Mô tả sự kiện</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Mô tả chi tiết về sự kiện của bạn..."
          placeholderTextColor="#6b7280"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />
      </View>
    </View>
  );

  // Step 2: Location & Time
  const renderStep2 = () => (
    <View style={styles.stepContent}>
      {/* Online/Offline Toggle */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, isOffline && styles.toggleBtnActive]}
          onPress={() => setIsOffline(true)}
        >
          <FontAwesome5
            name="map-marker-alt"
            size={16}
            color={isOffline ? "#fff" : "#9ca3af"}
          />
          <Text
            style={[styles.toggleText, isOffline && styles.toggleTextActive]}
          >
            Offline
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, !isOffline && styles.toggleBtnActive]}
          onPress={() => setIsOffline(false)}
        >
          <FontAwesome5
            name="video"
            size={16}
            color={!isOffline ? "#fff" : "#9ca3af"}
          />
          <Text
            style={[styles.toggleText, !isOffline && styles.toggleTextActive]}
          >
            Online
          </Text>
        </TouchableOpacity>
      </View>

      {isOffline && (
        <>
          {/* Venue Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              <Text style={styles.required}>* </Text>Tên địa điểm
            </Text>
            <TextInput
              style={styles.input}
              placeholder="VD: Nhà hát Lớn Hà Nội"
              placeholderTextColor="#6b7280"
              value={venueName}
              onChangeText={setVenueName}
            />
          </View>

          {/* Address */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Địa chỉ</Text>
            <TextInput
              style={styles.input}
              placeholder="Số nhà, đường..."
              placeholderTextColor="#6b7280"
              value={address}
              onChangeText={setAddress}
            />
          </View>

          {/* City */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Thành phố</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: TP. Hồ Chí Minh"
              placeholderTextColor="#6b7280"
              value={city}
              onChangeText={setCity}
            />
          </View>
        </>
      )}

      {/* Start Date/Time */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
          <Text style={styles.required}>* </Text>Ngày giờ bắt đầu
        </Text>
        <View style={styles.dateTimeRow}>
          <TextInput
            style={[styles.input, styles.dateInput]}
            placeholder="DD/MM/YYYY"
            placeholderTextColor="#6b7280"
            value={startDate}
            onChangeText={setStartDate}
          />
          <TextInput
            style={[styles.input, styles.timeInput]}
            placeholder="HH:MM"
            placeholderTextColor="#6b7280"
            value={startTime}
            onChangeText={setStartTime}
          />
        </View>
      </View>

      {/* End Date/Time */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Ngày giờ kết thúc</Text>
        <View style={styles.dateTimeRow}>
          <TextInput
            style={[styles.input, styles.dateInput]}
            placeholder="DD/MM/YYYY"
            placeholderTextColor="#6b7280"
            value={endDate}
            onChangeText={setEndDate}
          />
          <TextInput
            style={[styles.input, styles.timeInput]}
            placeholder="HH:MM"
            placeholderTextColor="#6b7280"
            value={endTime}
            onChangeText={setEndTime}
          />
        </View>
      </View>
    </View>
  );

  // Step 3: Tickets
  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.sectionTitle}>Loại vé</Text>

      {tickets.map((ticket, index) => (
        <View key={ticket.id} style={styles.ticketCard}>
          <View style={styles.ticketHeader}>
            <Text style={styles.ticketIndex}>Loại vé {index + 1}</Text>
            {tickets.length > 1 && (
              <TouchableOpacity
                onPress={() => removeTicketType(ticket.id)}
                style={styles.removeBtn}
              >
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
              </TouchableOpacity>
            )}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Tên loại vé (VD: VIP, Thường...)"
            placeholderTextColor="#6b7280"
            value={ticket.name}
            onChangeText={(v) => updateTicket(ticket.id, "name", v)}
          />

          <View style={styles.ticketRow}>
            <View style={styles.ticketInputHalf}>
              <Text style={styles.inputLabelSmall}>Giá (VNĐ)</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor="#6b7280"
                value={ticket.price}
                onChangeText={(v) => updateTicket(ticket.id, "price", v)}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.ticketInputHalf}>
              <Text style={styles.inputLabelSmall}>Số lượng</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor="#6b7280"
                value={ticket.quantity}
                onChangeText={(v) => updateTicket(ticket.id, "quantity", v)}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Tier selection */}
          <View style={styles.tierRow}>
            {["standard", "vip", "premium"].map((tier) => (
              <TouchableOpacity
                key={tier}
                style={[
                  styles.tierBtn,
                  ticket.tier === tier && styles.tierBtnActive,
                ]}
                onPress={() => updateTicket(ticket.id, "tier", tier)}
              >
                <Text
                  style={[
                    styles.tierText,
                    ticket.tier === tier && styles.tierTextActive,
                  ]}
                >
                  {tier.charAt(0).toUpperCase() + tier.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.addTicketBtn} onPress={addTicketType}>
        <Ionicons name="add-circle-outline" size={24} color="#10b981" />
        <Text style={styles.addTicketText}>Thêm loại vé</Text>
      </TouchableOpacity>
    </View>
  );

  // Step 4: Confirmation
  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.sectionTitle}>Xác nhận thông tin</Text>

      {/* Preview Card */}
      <View style={styles.previewCard}>
        {mainImage && (
          <Image source={{ uri: mainImage }} style={styles.previewImage} />
        )}

        <View style={styles.previewContent}>
          <Text style={styles.previewTitle}>{eventName || "Tên sự kiện"}</Text>

          <View style={styles.previewRow}>
            <FontAwesome5 name="folder" size={14} color="#10b981" />
            <Text style={styles.previewText}>{category.label}</Text>
          </View>

          {isOffline && venueName && (
            <View style={styles.previewRow}>
              <FontAwesome5 name="map-marker-alt" size={14} color="#10b981" />
              <Text style={styles.previewText}>{venueName}</Text>
            </View>
          )}

          {startDate && (
            <View style={styles.previewRow}>
              <FontAwesome5 name="calendar" size={14} color="#10b981" />
              <Text style={styles.previewText}>
                {startDate} {startTime && `• ${startTime}`}
              </Text>
            </View>
          )}

          <View style={styles.previewDivider} />

          <Text style={styles.previewSubtitle}>Loại vé:</Text>
          {tickets
            .filter((t) => t.name && t.price)
            .map((ticket) => (
              <View key={ticket.id} style={styles.previewTicketRow}>
                <Text style={styles.previewTicketName}>{ticket.name}</Text>
                <Text style={styles.previewTicketPrice}>
                  {parseInt(ticket.price || 0).toLocaleString("vi-VN")}đ
                </Text>
              </View>
            ))}
        </View>
      </View>

      <Text style={styles.confirmNote}>
        Vui lòng kiểm tra lại thông tin trước khi tạo sự kiện. Bạn có thể chỉnh
        sửa sau khi sự kiện được tạo.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Tạo sự kiện</Text>

        <TouchableOpacity
          style={styles.menuBtn}
          onPress={() => setMenuOpen(true)}
        >
          <Ionicons name="menu" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Step Indicator */}
      <View style={styles.stepIndicator}>
        {STEPS.map((step, index) => (
          <React.Fragment key={step.id}>
            <TouchableOpacity
              style={[
                styles.stepDot,
                currentStep >= step.id && styles.stepDotActive,
                currentStep === step.id && styles.stepDotCurrent,
              ]}
              onPress={() => {
                if (step.id < currentStep) setCurrentStep(step.id);
              }}
            >
              {currentStep > step.id ? (
                <Ionicons name="checkmark" size={14} color="#fff" />
              ) : (
                <Text
                  style={[
                    styles.stepDotText,
                    currentStep >= step.id && styles.stepDotTextActive,
                  ]}
                >
                  {step.id}
                </Text>
              )}
            </TouchableOpacity>
            {index < STEPS.length - 1 && (
              <View
                style={[
                  styles.stepLine,
                  currentStep > step.id && styles.stepLineActive,
                ]}
              />
            )}
          </React.Fragment>
        ))}
      </View>

      <Text style={styles.stepTitle}>{STEPS[currentStep - 1].title}</Text>

      {/* Content */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderStepContent()}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Buttons */}
      <View style={styles.bottomBar}>
        {currentStep > 1 && (
          <TouchableOpacity style={styles.prevBtn} onPress={prevStep}>
            <Ionicons name="arrow-back" size={20} color="#10b981" />
            <Text style={styles.prevBtnText}>Quay lại</Text>
          </TouchableOpacity>
        )}

        {currentStep < 4 ? (
          <TouchableOpacity
            style={[styles.nextBtn, currentStep === 1 && { flex: 1 }]}
            onPress={nextStep}
          >
            <Text style={styles.nextBtnText}>Tiếp tục</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.submitBtnText}>Tạo sự kiện</Text>
                <FontAwesome5 name="check" size={16} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Hamburger Menu Modal */}
      <Modal
        visible={menuOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setMenuOpen(false)}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setMenuOpen(false)}
        >
          <View style={styles.menuContainer}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Các bước tạo sự kiện</Text>
              <TouchableOpacity onPress={() => setMenuOpen(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {STEPS.map((step) => (
              <TouchableOpacity
                key={step.id}
                style={[
                  styles.menuItem,
                  currentStep === step.id && styles.menuItemActive,
                ]}
                onPress={() => {
                  setCurrentStep(step.id);
                  setMenuOpen(false);
                }}
              >
                <View
                  style={[
                    styles.menuItemIcon,
                    currentStep >= step.id && styles.menuItemIconActive,
                  ]}
                >
                  <FontAwesome5
                    name={step.icon}
                    size={16}
                    color={currentStep >= step.id ? "#fff" : "#6b7280"}
                  />
                </View>
                <View style={styles.menuItemContent}>
                  <Text
                    style={[
                      styles.menuItemTitle,
                      currentStep === step.id && styles.menuItemTitleActive,
                    ]}
                  >
                    {step.title}
                  </Text>
                  <Text style={styles.menuItemStatus}>
                    {currentStep > step.id
                      ? "✓ Hoàn thành"
                      : currentStep === step.id
                      ? "Đang thực hiện"
                      : "Chưa hoàn thành"}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}

            <View style={styles.menuFooter}>
              <TouchableOpacity
                style={styles.menuCancelBtn}
                onPress={() => {
                  setMenuOpen(false);
                  Alert.alert(
                    "Hủy tạo sự kiện",
                    "Bạn có chắc muốn hủy? Dữ liệu sẽ không được lưu.",
                    [
                      { text: "Tiếp tục", style: "cancel" },
                      { text: "Hủy", style: "destructive", onPress: () => navigation.goBack() },
                    ]
                  );
                }}
              >
                <Text style={styles.menuCancelText}>Hủy tạo sự kiện</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 50 : 16,
    paddingBottom: 16,
    backgroundColor: "#1f2937",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#374151",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  menuBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#374151",
    justifyContent: "center",
    alignItems: "center",
  },

  // Step Indicator
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#374151",
    justifyContent: "center",
    alignItems: "center",
  },
  stepDotActive: {
    backgroundColor: "#10b981",
  },
  stepDotCurrent: {
    borderWidth: 3,
    borderColor: "#10b981",
    backgroundColor: "#1f2937",
  },
  stepDotText: {
    color: "#9ca3af",
    fontSize: 14,
    fontWeight: "600",
  },
  stepDotTextActive: {
    color: "#fff",
  },
  stepLine: {
    flex: 1,
    height: 3,
    backgroundColor: "#374151",
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: "#10b981",
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },

  // Content
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 180,
  },
  stepContent: {
    gap: 16,
  },

  // Image Upload
  imageUpload: {
    height: 180,
    borderRadius: 12,
    backgroundColor: "#1f2937",
    overflow: "hidden",
    position: "relative",
  },
  uploadedImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#374151",
    borderStyle: "dashed",
    borderRadius: 12,
    margin: 2,
  },
  imagePlaceholderText: {
    color: "#6b7280",
    marginTop: 8,
    fontSize: 14,
  },
  imageEditBadge: {
    position: "absolute",
    bottom: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#10b981",
    justifyContent: "center",
    alignItems: "center",
  },

  // Input Group
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    color: "#d1d5db",
    fontSize: 14,
    fontWeight: "600",
  },
  inputLabelSmall: {
    color: "#9ca3af",
    fontSize: 12,
    marginBottom: 4,
  },
  required: {
    color: "#ef4444",
  },
  input: {
    backgroundColor: "#1f2937",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#374151",
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#fff",
    fontSize: 15,
  },
  textArea: {
    minHeight: 120,
  },
  charCount: {
    color: "#6b7280",
    fontSize: 12,
    textAlign: "right",
  },

  // Category
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1f2937",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#374151",
    gap: 8,
  },
  categoryItemActive: {
    borderColor: "#10b981",
    backgroundColor: "#10b98115",
  },
  categoryText: {
    color: "#9ca3af",
    fontSize: 13,
  },
  categoryTextActive: {
    color: "#10b981",
  },

  // Toggle
  toggleRow: {
    flexDirection: "row",
    backgroundColor: "#1f2937",
    borderRadius: 8,
    padding: 4,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 6,
    gap: 8,
  },
  toggleBtnActive: {
    backgroundColor: "#10b981",
  },
  toggleText: {
    color: "#9ca3af",
    fontWeight: "600",
  },
  toggleTextActive: {
    color: "#fff",
  },

  // Date/Time
  dateTimeRow: {
    flexDirection: "row",
    gap: 12,
  },
  dateInput: {
    flex: 2,
  },
  timeInput: {
    flex: 1,
  },

  // Tickets
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  ticketCard: {
    backgroundColor: "#1f2937",
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  ticketHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ticketIndex: {
    color: "#10b981",
    fontWeight: "700",
    fontSize: 14,
  },
  removeBtn: {
    padding: 4,
  },
  ticketRow: {
    flexDirection: "row",
    gap: 12,
  },
  ticketInputHalf: {
    flex: 1,
  },
  tierRow: {
    flexDirection: "row",
    gap: 8,
  },
  tierBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: "#374151",
    alignItems: "center",
  },
  tierBtnActive: {
    backgroundColor: "#10b981",
  },
  tierText: {
    color: "#9ca3af",
    fontSize: 12,
    fontWeight: "600",
  },
  tierTextActive: {
    color: "#fff",
  },
  addTicketBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#10b981",
    borderStyle: "dashed",
    gap: 8,
  },
  addTicketText: {
    color: "#10b981",
    fontWeight: "600",
  },

  // Preview
  previewCard: {
    backgroundColor: "#1f2937",
    borderRadius: 12,
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    height: 160,
  },
  previewContent: {
    padding: 16,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 12,
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  previewText: {
    color: "#d1d5db",
    fontSize: 14,
  },
  previewDivider: {
    height: 1,
    backgroundColor: "#374151",
    marginVertical: 12,
  },
  previewSubtitle: {
    color: "#9ca3af",
    fontSize: 13,
    marginBottom: 8,
  },
  previewTicketRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  previewTicketName: {
    color: "#d1d5db",
    fontSize: 14,
  },
  previewTicketPrice: {
    color: "#10b981",
    fontWeight: "700",
  },
  confirmNote: {
    color: "#9ca3af",
    fontSize: 13,
    textAlign: "center",
    marginTop: 16,
    lineHeight: 20,
  },

  // Bottom Bar
  bottomBar: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === "ios" ? 100 : 80,
    backgroundColor: "#1f2937",
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#374151",
  },
  prevBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#10b981",
    gap: 8,
  },
  prevBtnText: {
    color: "#10b981",
    fontWeight: "700",
    fontSize: 15,
  },
  nextBtn: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10b981",
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  nextBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  submitBtn: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10b981",
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },

  // Menu Modal
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  menuContainer: {
    backgroundColor: "#1f2937",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },
  menuHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingHorizontal: 20,
    gap: 16,
  },
  menuItemActive: {
    backgroundColor: "#10b98115",
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#374151",
    justifyContent: "center",
    alignItems: "center",
  },
  menuItemIconActive: {
    backgroundColor: "#10b981",
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    color: "#d1d5db",
    fontSize: 15,
    fontWeight: "600",
  },
  menuItemTitleActive: {
    color: "#10b981",
  },
  menuItemStatus: {
    color: "#6b7280",
    fontSize: 12,
    marginTop: 2,
  },
  menuFooter: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#374151",
    marginTop: 8,
  },
  menuCancelBtn: {
    alignItems: "center",
    paddingVertical: 12,
  },
  menuCancelText: {
    color: "#ef4444",
    fontWeight: "600",
  },
});
