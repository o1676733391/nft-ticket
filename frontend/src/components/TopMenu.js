import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";

const isMobile = Platform.OS === 'android' || Platform.OS === 'ios';

export default function TopMenu() {
  const menus = ["Nhạc sống", "Sân khấu & Nghệ thuật", "Thể Thao", "Khác"];
  const navigation = useNavigation();

  // Mobile: Horizontal scroll, Web: Center layout
  if (isMobile) {
    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.menuBar}
        contentContainerStyle={styles.menuContentMobile}
      >
        {menus.map((item, idx) => (
          <TouchableOpacity 
            key={idx} 
            style={styles.menuButtonMobile}
            onPress={() => navigation.navigate("SearchResult", { query: "", category: item })}
          >
            <Text style={styles.menuText}>{item}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  }

  return (
    <View style={[styles.menuBar, { justifyContent: "center", flexDirection: "row", gap: 40 }]}>
      {menus.map((item, idx) => (
        <TouchableOpacity key={idx} onPress={() => navigation.navigate("SearchResult", { query: "", category: item })}>
          <Text style={styles.menuText}>{item}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  menuBar: {
    backgroundColor: "#1f2937",
    paddingVertical: isMobile ? 12 : 19,
    flexDirection: isMobile ? undefined : "row",
  },
  menuContentMobile: {
    paddingHorizontal: 16,
    gap: 12,
    alignItems: 'center',
  },
  menuButtonMobile: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#374151',
    borderRadius: 24,
    minHeight: 48,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  menuText: {
    color: "#fff",
    fontSize: isMobile ? 15 : 15,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});
