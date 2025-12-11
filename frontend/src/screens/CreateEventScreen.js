// src/screens/CreateEventScreen.js
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
  Dimensions,
  Modal,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import OrganizerHeader from "../components/OrganizerHeader";
import OrganizerSidebar from "../components/OrganizerSidebar";
import * as ImagePicker from "expo-image-picker";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const isMobile = Platform.OS === "ios" || Platform.OS === "android" || SCREEN_WIDTH < 768;

// ===== MẪU NỘI DUNG THÔNG TIN SỰ KIỆN =====
const EVENT_DESC_TEMPLATE = `Giới thiệu sự kiện:
[Tóm tắt ngắn gọn về sự kiện: Nội dung chính của sự kiện, điểm đặc sắc nhất và lý do khiến người tham gia không nên bỏ lỡ]

Chi tiết sự kiện:
• Chương trình chính: [Liệt kê những hoạt động nổi bật trong sự kiện: các phần trình diễn, khách mời đặc biệt, lịch trình các tiết mục cụ thể nếu có.]
• Khách mời: [Thông tin về các khách mời đặc biệt, nghệ sĩ, diễn giả sẽ tham gia sự kiện. Có thể bao gồm mô tả ngắn gọn về họ và những gì họ sẽ mang lại cho sự kiện.]
• Trải nghiệm đặc biệt: [Nếu có các hoạt động đặc biệt khác như workshop, khu trải nghiệm, photo booth, khu vực check-in hay các phần quà/ưu đãi dành riêng cho người tham dự.]

Điều khoản và điều kiện:
[TnC] sự kiện
Lưu ý về điều khoản trẻ em
Lưu ý về điều khoản VAT
`;

const CATEGORY_OPTIONS = [
  "Nhạc sống",
  "Sân khấu & Nghệ thuật",
  "Thể thao",
  "Khác",
];

export default function CreateEventScreen() {
  const navigation = useNavigation();
  
  // Current step (1-4)
  const [currentStep, setCurrentStep] = useState(1);
  
  // Ảnh
  const [mainImage, setMainImage] = useState(null);      // ảnh sự kiện (720x958)
  const [coverImage, setCoverImage] = useState(null);    // ảnh nền (1280x720)
  const [organizerLogo, setOrganizerLogo] = useState(null); // logo BTC

  // Thông tin sự kiện
  const [eventName, setEventName] = useState("");
  const [isOffline, setIsOffline] = useState(true);
  const [venueName, setVenueName] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [ward, setWard] = useState("");
  const [street, setStreet] = useState("");

  // Thể loại
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);

  // Mô tả sự kiện
  const [eventDescription, setEventDescription] =
    useState(EVENT_DESC_TEMPLATE);

  // Ban tổ chức
  const [organizerName, setOrganizerName] = useState("");
  const [organizerInfo, setOrganizerInfo] = useState("");

  // Sidebar drawer for mobile
  const [sidebarVisible, setSidebarVisible] = useState(false);

  // ================= VALIDATION =================
  const validateStep1 = () => {
    const errors = [];
    
    if (!mainImage) {
      errors.push("Vui lòng chọn ảnh sự kiện");
    }
    if (!eventName.trim()) {
      errors.push("Vui lòng nhập tên sự kiện");
    }
    if (eventName.length > 100) {
      errors.push("Tên sự kiện không được quá 100 ký tự");
    }
    if (isOffline && !venueName.trim()) {
      errors.push("Vui lòng nhập tên địa điểm");
    }
    if (!organizerName.trim()) {
      errors.push("Vui lòng nhập tên ban tổ chức");
    }
    if (!organizerInfo.trim()) {
      errors.push("Vui lòng nhập thông tin ban tổ chức");
    }
    
    return errors;
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      const errors = validateStep1();
      
      if (errors.length > 0) {
        Alert.alert(
          "Thông tin chưa đầy đủ",
          errors.join("\n"),
          [{ text: "OK" }]
        );
        return;
      }
      
      // Lưu data step 1 và chuyển sang step 2
      const step1Data = {
        mainImage,
        coverImage,
        eventName,
        isOffline,
        venueName,
        city,
        district,
        ward,
        street,
        category,
        eventDescription,
        organizerName,
        organizerInfo,
        organizerLogo,
      };
      
      // Navigate to step 2 (Time & Ticket Types)
      navigation.navigate("CreateEventStep2", { eventData: step1Data });
    }
  };

  const handleCancel = () => {
    Alert.alert(
      "Hủy tạo sự kiện?",
      "Bạn có chắc muốn hủy? Thông tin đã nhập sẽ không được lưu.",
      [
        { text: "Tiếp tục chỉnh sửa", style: "cancel" },
        { 
          text: "Hủy", 
          style: "destructive",
          onPress: () => navigation.goBack()
        },
      ]
    );
  };

  // ================= IMAGE PICKER (web + mobile) =================
  const pickImage = async (target) => {
    try {
      // Trên mobile phải xin quyền, web thì không cần
      if (Platform.OS !== "web") {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) {
          alert("Ứng dụng cần quyền truy cập thư viện ảnh để chọn hình.");
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.9,
      });

      if (result.canceled) return;

      const uri = result.assets && result.assets[0] && result.assets[0].uri;
      if (!uri) return;

      if (target === "main") setMainImage(uri);
      if (target === "cover") setCoverImage(uri);
      if (target === "logo") setOrganizerLogo(uri);
    } catch (err) {
      console.log("pickImage error:", err);
      alert("Không chọn được ảnh, bạn thử lại nhé.");
    }
  };

  // Box upload dùng chung
  const UploadBox = ({ uri, labelTop, labelBottom, sizeText, onPress }) => (
    <TouchableOpacity style={isMobile ? styles.uploadBoxMobile : styles.uploadBox} onPress={onPress} activeOpacity={0.8}>
      {uri ? (
        <Image source={{ uri }} style={styles.uploadImage} />
      ) : (
        <View style={styles.uploadPlaceholder}>
          <View style={styles.uploadIconBox}>
            <Text style={styles.uploadIcon}>📦</Text>
          </View>
          <Text style={styles.uploadTitle}>{labelTop}</Text>
          {!!labelBottom && <Text style={styles.uploadSub}>{labelBottom}</Text>}
          {!!sizeText && <Text style={styles.uploadSize}>{sizeText}</Text>}
        </View>
      )}
    </TouchableOpacity>
  );

  // Hamburger Icon Component
  const HamburgerIcon = () => (
    <TouchableOpacity
      style={styles.hamburgerBtn}
      onPress={() => setSidebarVisible(true)}
      activeOpacity={0.7}
    >
      <View style={styles.hamburgerLine} />
      <View style={styles.hamburgerLine} />
      <View style={styles.hamburgerLine} />
    </TouchableOpacity>
  );

  // Mobile Sidebar Drawer
  const SidebarDrawer = () => (
    <Modal
      visible={sidebarVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setSidebarVisible(false)}
    >
      <View style={styles.drawerOverlay}>
        <TouchableOpacity
          style={styles.drawerBackdrop}
          activeOpacity={1}
          onPress={() => setSidebarVisible(false)}
        />
        <View style={styles.drawerContent}>
          <TouchableOpacity
            style={styles.drawerCloseBtn}
            onPress={() => setSidebarVisible(false)}
          >
            <Text style={styles.drawerCloseText}>✕</Text>
          </TouchableOpacity>
          <OrganizerSidebar onItemPress={() => setSidebarVisible(false)} />
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.screen}>
      <OrganizerHeader title="Tạo sự kiện" />

      {/* Mobile Sidebar Drawer */}
      {isMobile && <SidebarDrawer />}

      <View style={styles.pageBody}>
        {/* Desktop: show sidebar, Mobile: hide sidebar */}
        {!isMobile && <OrganizerSidebar />}

        <ScrollView style={styles.mainScroll} contentContainerStyle={{ paddingBottom: 80 }}>
          {/* Mobile: Hamburger + Title Bar */}
          {isMobile && (
            <View style={styles.mobileTopBar}>
              <HamburgerIcon />
              <Text style={styles.mobileTitle}>Tạo sự kiện</Text>
              <View style={{ width: 40 }} />
            </View>
          )}

          {/* ===== THANH BƯỚC (STEP BAR) ===== */}
          <View style={isMobile ? styles.stepBarMobile : styles.stepBar}>
          {[
            "Thông tin sự kiện",
            "Thời gian & Loại vé",
            "Cài đặt",
            "Thông tin thanh toán",
          ].map((label, index) => {
            const step = index + 1;
            const active = step === currentStep;
            const completed = step < currentStep;
            return (
              <View key={label} style={isMobile ? styles.stepItemMobile : styles.stepItem}>
                <View
                  style={[
                    styles.stepCircle,
                    active && styles.stepCircleActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.stepCircleText,
                      active && styles.stepCircleTextActive,
                    ]}
                  >
                    {step}
                  </Text>
                </View>
                {!isMobile && (
                  <Text
                    style={[styles.stepLabel, active && styles.stepLabelActive]}
                  >
                    {label}
                  </Text>
                )}
              </View>
            );
          })}
        </View>

        {/* ===== CARD CHỨA FORM ===== */}
        <View style={isMobile ? styles.cardMobile : styles.card}>
          {/* ==== UPLOAD HÌNH ẢNH ==== */}
          <Text style={styles.sectionTitle}>
            <Text style={styles.redStar}>* </Text>
            Upload hình ảnh{" "}
            {!isMobile && <Text style={styles.linkText}>Xem vị trí hiển thị các ảnh</Text>}
          </Text>

          <View style={isMobile ? styles.uploadRowMobile : styles.uploadRow}>
            <UploadBox
              uri={mainImage}
              labelTop="Thêm ảnh sự kiện"
              labelBottom={isMobile ? "" : "hiển thị ở các vị trí khác"}
              sizeText="(720x958)"
              onPress={() => pickImage("main")}
            />
            <UploadBox
              uri={coverImage}
              labelTop="Thêm ảnh nền sự kiện"
              labelBottom=""
              sizeText="(1280x720)"
              onPress={() => pickImage("cover")}
            />
          </View>

          {/* ==== TÊN SỰ KIỆN ==== */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>
              <Text style={styles.redStar}>* </Text>Tên sự kiện
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Tên sự kiện"
              placeholderTextColor="#9ca3af"
              value={eventName}
              onChangeText={setEventName}
            />
            <Text style={styles.counterText}>{eventName.length} / 100</Text>
          </View>

          {/* ==== ĐỊA CHỈ SỰ KIỆN ==== */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>
              <Text style={styles.redStar}>* </Text>Địa chỉ sự kiện
            </Text>

            {/* Toggle Offline / Online */}
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  isOffline && styles.toggleBtnActive,
                ]}
                onPress={() => setIsOffline(true)}
              >
                <View
                  style={[
                    styles.radioDot,
                    isOffline && styles.radioDotActive,
                  ]}
                />
                <Text
                  style={[
                    styles.toggleText,
                    isOffline && styles.toggleTextActive,
                  ]}
                >
                  Sự kiện Offline
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  !isOffline && styles.toggleBtnActive,
                ]}
                onPress={() => setIsOffline(false)}
              >
                <View
                  style={[
                    styles.radioDot,
                    !isOffline && styles.radioDotActive,
                  ]}
                />
                <Text
                  style={[
                    styles.toggleText,
                    !isOffline && styles.toggleTextActive,
                  ]}
                >
                  Sự kiện Online
                </Text>
              </TouchableOpacity>
            </View>

            {/* Tên địa điểm */}
            <Text style={[styles.fieldLabel, { marginTop: 12 }]}>
              Tên địa điểm
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Tên địa điểm"
              placeholderTextColor="#9ca3af"
              value={venueName}
              onChangeText={setVenueName}
            />
          </View>

          {/* Tỉnh / Thành & Quận / Huyện */}
          <View style={isMobile ? styles.fieldRowMobile : styles.fieldRow}>
            <View style={isMobile ? styles.fieldColMobile : [styles.fieldCol, { marginRight: 12 }]}>
              <Text style={styles.fieldLabel}>Tỉnh/Thành</Text>
              <TextInput
                style={styles.input}
                placeholder="Tỉnh/Thành"
                placeholderTextColor="#9ca3af"
                value={city}
                onChangeText={setCity}
              />
            </View>
            <View style={isMobile ? styles.fieldColMobile : [styles.fieldCol, { marginLeft: 12 }]}>
              <Text style={styles.fieldLabel}>Quận/Huyện</Text>
              <TextInput
                style={styles.input}
                placeholder="Quận/Huyện"
                placeholderTextColor="#9ca3af"
                value={district}
                onChangeText={setDistrict}
              />
            </View>
          </View>

          {/* Phường / Xã & Số nhà đường */}
          <View style={isMobile ? styles.fieldRowMobile : styles.fieldRow}>
            <View style={isMobile ? styles.fieldColMobile : [styles.fieldCol, { marginRight: 12 }]}>
              <Text style={styles.fieldLabel}>Phường/Xã</Text>
              <TextInput
                style={styles.input}
                placeholder="Phường/Xã"
                placeholderTextColor="#9ca3af"
                value={ward}
                onChangeText={setWard}
              />
            </View>
            <View style={isMobile ? styles.fieldColMobile : [styles.fieldCol, { marginLeft: 12 }]}>
              <Text style={styles.fieldLabel}>Số nhà, đường</Text>
              <TextInput
                style={styles.input}
                placeholder="Số nhà, đường"
                placeholderTextColor="#9ca3af"
                value={street}
                onChangeText={setStreet}
              />
            </View>
          </View>

          {/* ==== THỂ LOẠI SỰ KIỆN ==== */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>
              <Text style={styles.redStar}>* </Text>Thể loại sự kiện
            </Text>

            <TouchableOpacity
              style={styles.input}
              activeOpacity={0.8}
              onPress={() => setCategoryOpen((v) => !v)}
            >
              <Text style={{ color: "#fff" }}>{category}</Text>
            </TouchableOpacity>

            {categoryOpen && (
              <View style={styles.dropdown}>
                {CATEGORY_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={[
                      styles.dropdownItem,
                      opt === category && styles.dropdownItemActive,
                    ]}
                    onPress={() => {
                      setCategory(opt);
                      setCategoryOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownText,
                        opt === category && styles.dropdownTextActive,
                      ]}
                    >
                      {opt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* ==== THÔNG TIN SỰ KIỆN ==== */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>
              <Text style={styles.redStar}>* </Text>Thông tin sự kiện
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              multiline
              textAlignVertical="top"
              value={eventDescription}
              onChangeText={setEventDescription}
            />
          </View>

          {/* ==== BAN TỔ CHỨC ==== */}
          <View style={[styles.fieldGroup, { marginTop: 24 }]}>
            <Text style={styles.fieldLabel}>
              <Text style={styles.redStar}>* </Text>Ban tổ chức
            </Text>

            <View style={isMobile ? styles.organizerRowMobile : styles.organizerRow}>
              <TouchableOpacity
                style={isMobile ? styles.logoBoxMobile : styles.logoBox}
                onPress={() => pickImage("logo")}
                activeOpacity={0.8}
              >
                {organizerLogo ? (
                  <Image
                    source={{ uri: organizerLogo }}
                    style={styles.logoImage}
                  />
                ) : (
                  <View style={styles.uploadPlaceholder}>
                    <View style={styles.uploadIconBox}>
                      <Text style={styles.uploadIcon}>📦</Text>
                    </View>
                    <Text style={styles.uploadTitle}>
                      Thêm logo ban tổ chức
                    </Text>
                    <Text style={styles.uploadSize}>(275x275)</Text>
                  </View>
                )}
              </TouchableOpacity>

              <View style={isMobile ? styles.organizerInfoMobile : { flex: 1, marginLeft: 20 }}>
                <Text style={styles.fieldLabel}>
                  <Text style={styles.redStar}>* </Text>Tên ban tổ chức
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Tên ban tổ chức"
                  placeholderTextColor="#9ca3af"
                  value={organizerName}
                  onChangeText={setOrganizerName}
                />

                <Text style={[styles.fieldLabel, { marginTop: 12 }]}>
                  <Text style={styles.redStar}>* </Text>Thông tin ban tổ chức
                </Text>
                <TextInput
                  style={[styles.input, styles.textAreaSmall]}
                  multiline
                  textAlignVertical="top"
                  placeholder="Thông tin ban tổ chức"
                  placeholderTextColor="#9ca3af"
                  value={organizerInfo}
                  onChangeText={setOrganizerInfo}
                />
              </View>
            </View>
          </View>

          {/* ===== NÚT ĐIỀU HƯỚNG ===== */}
          <View style={isMobile ? styles.navigationButtonsMobile : styles.navigationButtons}>
            <TouchableOpacity
              style={styles.btnSecondary}
              activeOpacity={0.8}
              onPress={handleCancel}
            >
              <Text style={styles.btnSecondaryText}>Hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnPrimary}
              activeOpacity={0.8}
              onPress={handleNextStep}
            >
              <Text style={styles.btnPrimaryText}>Tiếp theo</Text>
            </TouchableOpacity>
          </View>
        </View>
        </ScrollView>
      </View>
    </View>
  );
}

// =============== STYLES ===============
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#020617",
  },

  pageBody: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  mainScroll: {
    flex: 1,
    height: "100vh",
    overflowY: "auto",
  },

  // Mobile Top Bar with Hamburger
  mobileTopBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#020617",
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
  },
  mobileTitle: {
    color: "#22c55e",
    fontSize: 18,
    fontWeight: "700",
  },

  // Hamburger Button
  hamburgerBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },
  hamburgerLine: {
    width: 22,
    height: 3,
    backgroundColor: "#22c55e",
    borderRadius: 2,
    marginVertical: 2,
  },

  // Drawer Styles
  drawerOverlay: {
    flex: 1,
    flexDirection: "row",
  },
  drawerBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  drawerContent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 280,
    backgroundColor: "#072018",
  },
  drawerCloseBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  drawerCloseText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },

  // Step bar
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
    backgroundColor: "#020617",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 40,
  },
  stepItemMobile: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 8,
  },
  stepCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#9ca3af",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  stepCircleActive: {
    backgroundColor: "#22c55e",
    borderColor: "#22c55e",
  },
  stepCircleText: {
    color: "#9ca3af",
    fontSize: 12,
  },
  stepCircleTextActive: {
    color: "#052e16",
    fontWeight: "700",
  },
  stepLabel: {
    color: "#9ca3af",
    fontSize: 14,
  },
  stepLabelActive: {
    color: "#ffffff",
    fontWeight: "600",
  },

  // Card
  card: {
    marginHorizontal: 32,
    marginTop: 10,
    borderRadius: 4,
    backgroundColor: "#020617",
    paddingVertical: 24,
  },
  cardMobile: {
    marginHorizontal: 0,
    marginTop: 10,
    borderRadius: 0,
    backgroundColor: "#020617",
    paddingVertical: 16,
  },

  sectionTitle: {
    color: "#e5e7eb",
    fontSize: 15,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  redStar: { color: "#f97373" },
  linkText: { color: "#22c55e", fontSize: 14 },

  // Upload
  uploadRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 24,
    columnGap: 12,
  },
  uploadRowMobile: {
    flexDirection: "column",
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  uploadBox: {
    flex: 1,
    height: 260,
    borderRadius: 4,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#4b5563",
    backgroundColor: "#111827",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadBoxMobile: {
    width: "100%",
    height: 180,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#4b5563",
    backgroundColor: "#111827",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  uploadImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  uploadPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  uploadIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "#22c55e",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  uploadIcon: {
    fontSize: 28,
  },
  uploadTitle: {
    color: "#e5e7eb",
    fontWeight: "600",
    textAlign: "center",
  },
  uploadSub: {
    color: "#d1d5db",
    marginTop: 4,
    textAlign: "center",
  },
  uploadSize: {
    color: "#9ca3af",
    marginTop: 6,
    fontSize: 12,
  },

  // Form chung
  fieldGroup: {
    paddingHorizontal: 16,
    marginTop: 22,
  },
  fieldLabel: {
    color: "#e5e7eb",
    fontSize: 14,
    marginBottom: 6,
  },
  input: {
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#4b5563",
    backgroundColor: "#0f172a",
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 12 : 10,
    color: "#fff",
    fontSize: 14,
  },
  counterText: {
    color: "#9ca3af",
    fontSize: 12,
    textAlign: "right",
    marginTop: 4,
  },

  // Toggle offline / online
  toggleRow: {
    flexDirection: "row",
    marginTop: 6,
  },
  toggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#4b5563",
    marginRight: 12,
  },
  toggleBtnActive: {
    borderColor: "#22c55e",
    backgroundColor: "#022c22",
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#9ca3af",
    marginRight: 6,
  },
  radioDotActive: {
    borderColor: "#22c55e",
    backgroundColor: "#22c55e",
  },
  toggleText: {
    color: "#e5e7eb",
    fontSize: 13,
  },
  toggleTextActive: {
    color: "#bbf7d0",
  },

  fieldRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: 14,
  },
  fieldRowMobile: {
    flexDirection: "column",
    paddingHorizontal: 16,
    marginTop: 0,
  },
  fieldCol: {
    flex: 1,
  },
  fieldColMobile: {
    width: "100%",
    marginTop: 14,
  },

  // Dropdown thể loại
  dropdown: {
    marginTop: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#4b5563",
    backgroundColor: "#020617",
    overflow: "hidden",
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  dropdownItemActive: {
    backgroundColor: "#022c22",
  },
  dropdownText: {
    color: "#e5e7eb",
  },
  dropdownTextActive: {
    color: "#bbf7d0",
    fontWeight: "600",
  },

  textArea: {
    height: 260,
    marginTop: 4,
  },
  textAreaSmall: {
    height: 120,
    marginTop: 4,
  },

  // Ban tổ chức
  organizerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 10,
  },
  organizerRowMobile: {
    flexDirection: "column",
    alignItems: "center",
    marginTop: 10,
  },
  organizerInfoMobile: {
    width: "100%",
    marginTop: 16,
  },
  logoBox: {
    width: 210,
    height: 210,
    borderRadius: 4,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#4b5563",
    backgroundColor: "#111827",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  logoBoxMobile: {
    width: 150,
    height: 150,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#4b5563",
    backgroundColor: "#111827",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  logoImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  // Navigation Buttons
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 24,
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#1f2937",
    gap: 12,
  },
  navigationButtonsMobile: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginTop: 16,
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
