import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Switch,
  useWindowDimensions,
  ScrollView,
} from "react-native";

export default function FilterDropdown({ visible, onClose, onApply }) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const isTabletOrDesktop = screenWidth >= 768;

  /* -----------------------------
        STATES - Must be before any return!
  ----------------------------- */
  const [location, setLocation] = useState("all");
  const [freeOnly, setFreeOnly] = useState(false);
  const [categories, setCategories] = useState([]);
  
  // Early return AFTER all hooks
  if (!visible) return null;

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
      categories: mappedCategory,
    });

    onClose();
  };

  // Mobile-first dynamic styles
  const dynamicStyles = {
    box: {
      position: "absolute",
      top: isTabletOrDesktop ? 130 : 100,
      left: isTabletOrDesktop ? undefined : 16,
      right: isTabletOrDesktop ? 100 : 16,
      width: isTabletOrDesktop ? 600 : screenWidth - 32,
      maxHeight: screenHeight - 160,
      backgroundColor: "#1f2937",
      borderRadius: 16,
      padding: isTabletOrDesktop ? 20 : 16,
      elevation: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
    },
  };

  return (
    <View style={styles.root}>
      <Pressable style={styles.backdrop} onPress={onClose} />

      <ScrollView style={dynamicStyles.box} showsVerticalScrollIndicator={false}>
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
            thumbColor={freeOnly ? "#10b981" : "#6b7280"}
            trackColor={{ true: "#10b98155", false: "#374151" }}
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
      </ScrollView>
    </View>
  );
}

/* Dark theme styles */
const styles = StyleSheet.create({
  root: { 
    ...StyleSheet.absoluteFillObject, 
    zIndex: 100,
  },
  backdrop: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: "700", 
    marginBottom: 12, 
    marginTop: 10,
    color: "#fff",
  },
  radioRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginBottom: 12,
    paddingVertical: 4,
  },
  radioOuter: { 
    width: 22, 
    height: 22, 
    borderRadius: 11, 
    borderWidth: 2, 
    borderColor: "#10b981", 
    justifyContent: "center", 
    alignItems: "center", 
    marginRight: 12,
  },
  radioInner: { 
    width: 12, 
    height: 12, 
    borderRadius: 6, 
    backgroundColor: "#10b981",
  },
  radioLabel: { 
    fontSize: 16, 
    color: "#d1d5db",
  },
  divider: { 
    height: 1, 
    backgroundColor: "#374151", 
    marginVertical: 16,
  },
  priceRow: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center",
    marginBottom: 8,
    paddingVertical: 4,
  },
  priceLabel: { 
    fontSize: 16, 
    color: "#d1d5db",
  },
  categoryWrap: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    gap: 10,
  },
  categoryBtn: { 
    paddingVertical: 10, 
    paddingHorizontal: 16, 
    backgroundColor: "#374151", 
    borderRadius: 20,
  },
  categoryBtnActive: { 
    backgroundColor: "#10b98133",
  },
  categoryText: { 
    fontSize: 15, 
    color: "#9ca3af",
  },
  categoryTextActive: { 
    fontWeight: "700", 
    color: "#10b981",
  },
  footer: { 
    marginTop: 25, 
    marginBottom: 20,
    flexDirection: "row", 
    justifyContent: "space-between",
  },
  resetBtn: { 
    borderColor: "#10b981", 
    borderWidth: 1.5, 
    paddingHorizontal: 20, 
    paddingVertical: 12, 
    borderRadius: 12,
  },
  resetText: { 
    fontSize: 16, 
    fontWeight: "600", 
    color: "#10b981",
  },
  applyBtn: { 
    backgroundColor: "#10b981", 
    paddingHorizontal: 28, 
    paddingVertical: 12, 
    borderRadius: 12,
  },
  applyText: { 
    fontSize: 16, 
    fontWeight: "700", 
    color: "#fff",
  },
});
