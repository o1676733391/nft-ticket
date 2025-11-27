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
} from "react-native";
import Header from "../components/Header";
import OrganizerSidebar from "../components/OrganizerSidebar";
import * as ImagePicker from "expo-image-picker";

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
    <TouchableOpacity style={styles.uploadBox} onPress={onPress} activeOpacity={0.8}>
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

  return (
    <View style={styles.screen}>
      <Header />

      <View style={styles.pageBody}>
        <OrganizerSidebar />

        <ScrollView style={styles.mainScroll} contentContainerStyle={{ paddingBottom: 80 }}>
          {/* ===== THANH BƯỚC (STEP BAR) ===== */}
          <View style={styles.stepBar}>
          {[
            "Thông tin sự kiện",
            "Thời gian & Loại vé",
            "Cài đặt",
            "Thông tin thanh toán",
          ].map((label, index) => {
            const step = index + 1;
            const active = step === 1;
            return (
              <View key={label} style={styles.stepItem}>
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
                <Text
                  style={[styles.stepLabel, active && styles.stepLabelActive]}
                >
                  {label}
                </Text>
              </View>
            );
          })}
        </View>

        {/* ===== CARD CHỨA FORM ===== */}
        <View style={styles.card}>
          {/* ==== UPLOAD HÌNH ẢNH ==== */}
          <Text style={styles.sectionTitle}>
            <Text style={styles.redStar}>* </Text>
            Upload hình ảnh{" "}
            <Text style={styles.linkText}>Xem vị trí hiển thị các ảnh</Text>
          </Text>

          <View style={styles.uploadRow}>
            <UploadBox
              uri={mainImage}
              labelTop="Thêm ảnh sự kiện để"
              labelBottom="hiển thị ở các vị trí khác"
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
          <View style={styles.fieldRow}>
            <View style={[styles.fieldCol, { marginRight: 12 }]}>
              <Text style={styles.fieldLabel}>Tỉnh/Thành</Text>
              <TextInput
                style={styles.input}
                placeholder="Tỉnh/Thành"
                placeholderTextColor="#9ca3af"
                value={city}
                onChangeText={setCity}
              />
            </View>
            <View style={[styles.fieldCol, { marginLeft: 12 }]}>
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
          <View style={styles.fieldRow}>
            <View style={[styles.fieldCol, { marginRight: 12 }]}>
              <Text style={styles.fieldLabel}>Phường/Xã</Text>
              <TextInput
                style={styles.input}
                placeholder="Phường/Xã"
                placeholderTextColor="#9ca3af"
                value={ward}
                onChangeText={setWard}
              />
            </View>
            <View style={[styles.fieldCol, { marginLeft: 12 }]}>
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

            <View style={styles.organizerRow}>
              <TouchableOpacity
                style={styles.logoBox}
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

              <View style={{ flex: 1, marginLeft: 20 }}>
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



  // Step bar
  stepBar: {
    flexDirection: "row",
    backgroundColor: "#020617",
    paddingHorizontal: 32,
    paddingTop: 18,
    paddingBottom: 10,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 40,
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
  fieldCol: {
    flex: 1,
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
  logoImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
});
