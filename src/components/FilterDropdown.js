import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Switch,
  Dimensions,
} from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SIDE_MARGIN = 80;
const CONTAINER_WIDTH = Math.min(SCREEN_WIDTH - SIDE_MARGIN * 2, 1320);
const SIDE_GAP = (SCREEN_WIDTH - CONTAINER_WIDTH) / 2;

export default function FilterDropdown({ visible, onClose, onApply }) {
  if (!visible) return null;

  /* -----------------------------
        STATES
  ----------------------------- */
  const [location, setLocation] = useState("all");
  const [freeOnly, setFreeOnly] = useState(false);

  // FE-selected text (giữ nguyên)
  const [categories, setCategories] = useState([]);

  // Mapping FE → prefix
  const categoryMap = {
    "Nhạc sống": "music",
    "Sân khấu & Nghệ thuật": "stage",
    "Thể thao": "sport",
    "Khác": "other",
  };

  const categoryList = [
    "Nhạc sống",
    "Sân khấu & Nghệ thuật",
    "Thể thao",
    "Khác",
  ];

  const toggleCategory = (name) => {
    if (categories.includes(name)) {
      setCategories(categories.filter((c) => c !== name));
    } else {
      setCategories([...categories, name]);
    }
  };

  const resetAll = () => {
    setLocation("all");
    setFreeOnly(false);
    setCategories([]);
  };

  const apply = () => {
    // convert FE → backend filter values
    const mappedCategory = categories.map((c) => categoryMap[c]);

    onApply({
      location,
      freeOnly,
      categories: mappedCategory, // CHỈNH Ở ĐÂY
    });

    onClose();
  };

  return (
    <View style={styles.root}>
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View style={styles.box}>
        {/* Vị trí */}
        <Text style={styles.sectionTitle}>Vị trí</Text>

        {[
          { id: "all", label: "Toàn quốc" },
          { id: "hcm", label: "Hồ Chí Minh" },
          { id: "hn", label: "Hà Nội" },
          { id: "dl", label: "Đà Lạt" },
          { id: "other", label: "Vị trí khác" },
        ].map((opt) => (
          <TouchableOpacity
            key={opt.id}
            style={styles.radioRow}
            onPress={() => setLocation(opt.id)}
          >
            <View style={styles.radioOuter}>
              {location === opt.id && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.radioLabel}>{opt.label}</Text>
          </TouchableOpacity>
        ))}

        <View style={styles.divider} />

        {/* Giá tiền */}
        <Text style={styles.sectionTitle}>Giá tiền</Text>

        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Miễn phí</Text>
          <Switch
            value={freeOnly}
            onValueChange={(val) => setFreeOnly(val)}
            thumbColor={freeOnly ? "#16a34a" : "#ccc"}
            trackColor={{ true: "#16a34a55", false: "#ccc" }}
          />
        </View>

        <View style={styles.divider} />

        {/* Thể loại */}
        <Text style={styles.sectionTitle}>Thể loại</Text>

        <View style={styles.categoryWrap}>
          {categoryList.map((item) => {
            const active = categories.includes(item);
            return (
              <TouchableOpacity
                key={item}
                style={[styles.categoryBtn, active && styles.categoryBtnActive]}
                onPress={() => toggleCategory(item)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    active && styles.categoryTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.resetBtn} onPress={resetAll}>
            <Text style={styles.resetText}>Thiết lập lại</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.applyBtn} onPress={apply}>
            <Text style={styles.applyText}>Áp dụng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

/* Styles giữ nguyên */
const styles = StyleSheet.create({
  root: { position: "absolute", top: 0, left: 0, width: SCREEN_WIDTH, height: "100%", zIndex: 2000 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.35)" },
  box: { position: "absolute", top: 70, right: SIDE_GAP + 0, width: 600, backgroundColor: "#fff", borderRadius: 10, padding: 20, elevation: 10 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10, marginTop: 10 },
  radioRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  radioOuter: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: "#16a34a", justifyContent: "center", alignItems: "center", marginRight: 10 },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: "#16a34a" },
  radioLabel: { fontSize: 16 },
  divider: { height: 1, backgroundColor: "#ddd", marginVertical: 15 },
  priceRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
  priceLabel: { fontSize: 16 },
  categoryWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  categoryBtn: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: "#eee", borderRadius: 20 },
  categoryBtnActive: { backgroundColor: "#16a34a33" },
  categoryText: { fontSize: 15 },
  categoryTextActive: { fontWeight: "700", color: "#16a34a" },
  footer: { marginTop: 25, flexDirection: "row", justifyContent: "space-between" },
  resetBtn: { borderColor: "#16a34a", borderWidth: 1, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  resetText: { fontSize: 16, fontWeight: "600", color: "#16a34a" },
  applyBtn: { backgroundColor: "#16a34a", paddingHorizontal: 28, paddingVertical: 12, borderRadius: 8 },
  applyText: { fontSize: 16, fontWeight: "700", color: "#fff" },
});
