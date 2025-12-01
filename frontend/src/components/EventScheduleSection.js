import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";


const SCREEN_WIDTH = Dimensions.get("window").width;
const SIDE_MARGIN = 80;
const CONTAINER_WIDTH = Math.min(SCREEN_WIDTH - SIDE_MARGIN * 2, 1320);

export default function EventScheduleSection({ schedule }) {
  if (!schedule || schedule.length === 0) return null;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.sectionTitle}>Lịch diễn</Text>

      <View style={styles.table}>
        {schedule.map((day, dayIndex) => (
          <View key={dayIndex}>

            {/* ===================== NGÀY ===================== */}
            <View style={styles.dayHeader}>
              <Text style={styles.dateText}>{day.dateText}</Text>
            </View>

            {/* ===================== KHUNG GIỜ ===================== */}
            {day.slots.map((slot, slotIndex) => (
              <SlotRow key={slotIndex} slot={slot} />
            ))}

          </View>
        ))}
      </View>
    </View>
  );
}

/* =====================================================
      COMPONENT KHUNG GIỜ (Slot)
===================================================== */

function SlotRow({ slot }) {
  const [open, setOpen] = useState(false);

  return (
    <View>
      {/* ----------- HÀNG KHUNG GIỜ ----------- */}
      <TouchableOpacity
        style={styles.row}
        onPress={() => setOpen(!open)}
        activeOpacity={0.8}
      >
        <View style={styles.arrowBox}>
          <Text style={[styles.arrow, open && styles.arrowOpen]}>›</Text>
        </View>

        <View style={styles.timeBox}>
          <Text style={styles.timeText}>{slot.time}</Text>
        </View>

        <TouchableOpacity style={styles.buyBtn}>
          <Text style={styles.buyText}>Mua vé ngay</Text>
        </TouchableOpacity>
      </TouchableOpacity>

      {/* ----------- DANH SÁCH LOẠI VÉ ----------- */}
      {open && (
        <View style={styles.ticketBox}>
          {slot.tickets.map((t, i) => (
            <View key={i} style={styles.ticketRow}>
              <View style={styles.ticketNameBox}>
                <Text style={styles.ticketName}>{t.name}</Text>
              </View>

              <Text style={styles.ticketPrice}>{t.price}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

/* =====================================================
                    STYLES
===================================================== */

const styles = StyleSheet.create({
  wrapper: {
    width: CONTAINER_WIDTH,
    marginTop: 40,
  },

  sectionTitle: {
    color: "#22c55e",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
  },

  table: {
    backgroundColor: "#1f2733",
    borderRadius: 12,
    overflow: "hidden",
  },

  /* ----- DATE HEADER ----- */
  dayHeader: {
    backgroundColor: "#2b323e",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#3a414d",
  },

  dateText: {
    color: "#4ade80",
    fontSize: 16,
    fontWeight: "700",
  },

  /* ----- SLOT ROW ----- */
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#2e3544",
  },

  arrowBox: {
    width: 35,
  },

  arrow: {
    color: "#b5bac4",
    fontSize: 22,
    transform: [{ rotate: "0deg" }],
    transition: "0.2s",
  },

  arrowOpen: {
    transform: [{ rotate: "90deg" }],
  },

  timeBox: {
    flex: 1,
  },

  timeText: {
    color: "#fff",
    fontSize: 15,
    marginBottom: 4,
  },

  buyBtn: {
    backgroundColor: "#22c55e",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },

  buyText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },

  /* ----- TICKET BOX ----- */
  ticketBox: {
    backgroundColor: "#262d38",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },

  ticketRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#343b47",
  },

  ticketNameBox: {
    flex: 1,
  },

  ticketName: {
    color: "#fff",
    fontSize: 15,
  },

  ticketPrice: {
    color: "#4ade80",
    fontSize: 15,
    fontWeight: "600",
  },
});
