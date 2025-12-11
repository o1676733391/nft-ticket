import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  useWindowDimensions,
  ScrollView,
} from "react-native";

/* -----------------------------------------------------
   DATE RANGE LOGIC — CHUẨN TICKETBOX
----------------------------------------------------- */

// Hôm nay
function getTodayRange() {
  const d = new Date();
  return {
    startDate: new Date(d.getFullYear(), d.getMonth(), d.getDate()),
    endDate: new Date(d.getFullYear(), d.getMonth(), d.getDate()),
  };
}

// Ngày mai = hôm nay + 1
function getTomorrowRange() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return {
    startDate: new Date(d.getFullYear(), d.getMonth(), d.getDate()),
    endDate: new Date(d.getFullYear(), d.getMonth(), d.getDate()),
  };
}

// Cuối tuần = T7 & CN gần nhất
function getWeekendRange() {
  const today = new Date();
  const day = today.getDay(); // 0 CN → 6 T7

  // Nếu hôm nay là CN → chỉ lấy CN
  if (day === 0) {
    return {
      startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
      endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
    };
  }

  // Ngày thứ 7 gần nhất
  const saturday = new Date(today);
  saturday.setDate(today.getDate() + (6 - day));

  // Chủ nhật liền sau
  const sunday = new Date(saturday);
  sunday.setDate(saturday.getDate() + 1);

  return {
    startDate: new Date(saturday.getFullYear(), saturday.getMonth(), saturday.getDate()),
    endDate: new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate()),
  };
}

// Tháng này = từ hôm nay → cuối tháng
function getThisMonthRange() {
  const today = new Date();
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  return {
    startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
    endDate: end,
  };
}

/* Số ngày trong tháng */
function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

/* -----------------------------------------------------
   COMPONENT CHÍNH
----------------------------------------------------- */

export default function DateFilterDropdown({ visible, onClose, onApply }) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const isTabletOrDesktop = screenWidth >= 768;
  
  const today = new Date();

  // All hooks MUST be called before any return statement
  const [activeTab, setActiveTab] = useState("today");
  const [selectedRange, setSelectedRange] = useState(getTodayRange());
  const [displayYear, setDisplayYear] = useState(today.getFullYear());
  const [displayMonth, setDisplayMonth] = useState(today.getMonth());

  // Early return AFTER all hooks
  if (!visible) return null;

  /* -----------------------------------
     Khi đổi TAB → cập nhật range + tháng
  ----------------------------------- */
  const handleTab = (id) => {
    setActiveTab(id);

    let range;
    if (id === "today") range = getTodayRange();
    if (id === "tomorrow") range = getTomorrowRange();
    if (id === "weekend") range = getWeekendRange();
    if (id === "month") range = getThisMonthRange();

    setSelectedRange(range);
    setDisplayMonth(range.startDate.getMonth());
    setDisplayYear(range.startDate.getFullYear());
  };

  /* -----------------------------------
     Tạo GRID ngày — CHUẨN TICKETBOX
     (có offset ngày bắt đầu)
  ----------------------------------- */

  // Day JS: 0 CN → 6 T7
  const jsFirstDay = new Date(displayYear, displayMonth, 1).getDay();

  // Mapping sang format Ticketbox (T2=1,…,T7=6,CN=7)
  const tbxStartCol = jsFirstDay === 0 ? 7 : jsFirstDay;

  const emptyCells = tbxStartCol - 1;
  const totalDays = getDaysInMonth(displayYear, displayMonth);

  const calendarDays = [
    ...Array(emptyCells).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];

  /* Kiểm tra highlight */
  const isInRange = (day) => {
    if (!day) return false;
    const d = new Date(displayYear, displayMonth, day);
    return d >= selectedRange.startDate && d <= selectedRange.endDate;
  };

  const apply = () => {
    onApply(selectedRange);
    onClose();
  };

  // Mobile-first styles
  const dynamicStyles = {
    dropdown: {
      position: isTabletOrDesktop ? "absolute" : "absolute",
      top: isTabletOrDesktop ? 130 : 100,
      left: isTabletOrDesktop ? undefined : 16,
      right: isTabletOrDesktop ? 100 : 16,
      width: isTabletOrDesktop ? 700 : screenWidth - 32,
      maxHeight: screenHeight - 160,
      backgroundColor: "#1f2937",
      borderRadius: 16,
      padding: isTabletOrDesktop ? 20 : 16,
      elevation: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
    },
  };

  return (
    <View style={styles.root}>
      {/* BLUR BACKDROP */}
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View style={dynamicStyles.dropdown}>
        {/* TAB ROW */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.tabScrollView}
          contentContainerStyle={styles.tabRow}
        >
          <Tab id="today" label="Hôm nay" active={activeTab} onPress={handleTab} />
          <Tab id="tomorrow" label="Ngày mai" active={activeTab} onPress={handleTab} />
          <Tab id="weekend" label="Cuối tuần này" active={activeTab} onPress={handleTab} />
          <Tab id="month" label="Tháng này" active={activeTab} onPress={handleTab} />
        </ScrollView>

        {/* MONTH TITLE */}
        <Text style={styles.monthTitle}>
          {displayYear}
        </Text>

        {/* WEEK HEADER */}
        <View style={styles.weekHeader}>
          {["T2","T3","T4","T5","T6","T7","CN"].map((t) => (
            <Text key={t} style={styles.weekTxt}>{t}</Text>
          ))}
        </View>

        {/* CALENDAR GRID */}
        <View style={styles.grid}>
          {calendarDays.map((day, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.dayCell, day && isInRange(day) && styles.dayActive]}
              disabled={!day}
            >
              <Text
                style={[
                  styles.dayText,
                  day && isInRange(day) && styles.dayTextActive,
                ]}
              >
                {day ?? ""}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.applyBtn} onPress={apply}>
            <Text style={styles.applyText}>Áp dụng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

/* -----------------------------------------------------
   TAB COMPONENT
----------------------------------------------------- */

const Tab = ({ id, label, active, onPress }) => (
  <TouchableOpacity
    onPress={() => onPress(id)}
    style={[styles.tab, active === id && styles.tabActive]}
  >
    <Text style={[styles.tabText, active === id && styles.tabTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

/* -----------------------------------------------------
   STYLE
----------------------------------------------------- */

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },

  /* Tabs */
  tabScrollView: {
    marginBottom: 16,
  },
  tabRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 4,
  },
  tab: {
    backgroundColor: "#374151",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  tabActive: {
    backgroundColor: "#10b981",
  },
  tabText: {
    fontSize: 14,
    color: "#9ca3af",
    fontWeight: "600",
  },
  tabTextActive: {
    fontWeight: "700",
    color: "#fff",
  },

  monthTitle: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 16,
    color: "#fff",
  },

  weekHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  weekTxt: {
    width: "14.285%",
    textAlign: "center",
    color: "#9ca3af",
    fontSize: 14,
    fontWeight: "600",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: "14.285%",
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  dayText: {
    fontSize: 16,
    color: "#d1d5db",
    fontWeight: "500",
  },
  dayActive: {
    backgroundColor: "#10b98133",
  },
  dayTextActive: {
    color: "#10b981",
    fontWeight: "800",
  },

  footer: {
    marginTop: 20,
    alignItems: "center",
  },

  applyBtn: {
    backgroundColor: "#10b981",
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 12,
    minWidth: 160,
    alignItems: "center",
  },
  applyText: {
    fontWeight: "700",
    fontSize: 16,
    color: "#fff",
  },
});
