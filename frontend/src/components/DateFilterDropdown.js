import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Dimensions,
} from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SIDE_MARGIN = 80;
const CONTAINER_WIDTH = Math.min(SCREEN_WIDTH - SIDE_MARGIN * 2, 1320);
const SIDE_GAP = (SCREEN_WIDTH - CONTAINER_WIDTH) / 2;

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
  if (!visible) return null;

  const today = new Date();

  const [activeTab, setActiveTab] = useState("today");
  const [selectedRange, setSelectedRange] = useState(getTodayRange());
  const [displayYear, setDisplayYear] = useState(today.getFullYear());
  const [displayMonth, setDisplayMonth] = useState(today.getMonth());

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

  return (
    <View style={styles.root}>
      {/* BLUR BACKDROP */}
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View style={styles.dropdown}>
        {/* TAB ROW */}
        <View style={styles.tabRow}>
          <Tab id="today" label="Hôm nay" active={activeTab} onPress={handleTab} />
          <Tab id="tomorrow" label="Ngày mai" active={activeTab} onPress={handleTab} />
          <Tab id="weekend" label="Cuối tuần này" active={activeTab} onPress={handleTab} />
          <Tab id="month" label="Tháng này" active={activeTab} onPress={handleTab} />
        </View>

        {/* MONTH TITLE */}
        <Text style={styles.monthTitle}>
          Tháng {displayMonth + 1}, {displayYear}
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
          <TouchableOpacity style={styles.resetBtn} onPress={() => handleTab("today")}>
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
    position: "absolute",
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: "100%",
    zIndex: 1500,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  dropdown: {
    position: "absolute",
    top: 70,
    right: SIDE_GAP + 10,
    width: 700,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    elevation: 12,
  },

  /* Tabs */
  tabRow: {
    flexDirection: "row",
    marginBottom: 15,
  },
  tab: {
    backgroundColor: "#f1f1f1",
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 8,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: "#16a34a22",
  },
  tabText: {
    fontSize: 15,
  },
  tabTextActive: {
    fontWeight: "700",
    color: "#16a34a",
  },

  monthTitle: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },

  weekHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  weekTxt: {
    width: "14.285%",
    textAlign: "center",
    color: "#666",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: "14.285%",
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  dayText: {
    fontSize: 16,
    color: "#333",
  },
  dayActive: {
    backgroundColor: "#16a34a33",
  },
  dayTextActive: {
    color: "#0e5f28",
    fontWeight: "700",
  },

  footer: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  resetBtn: {
    borderColor: "#16a34a",
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
  },
  resetText: {
    color: "#16a34a",
    fontWeight: "700",
  },

  applyBtn: {
    backgroundColor: "#eee",
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  applyText: {
    fontWeight: "700",
    fontSize: 16,
  },
});
