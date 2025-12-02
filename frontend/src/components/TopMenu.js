import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function TopMenu() {
  const menus = ["Nhạc sống", "Sân khấu & Nghệ thuật", "Thể Thao", "Khác"];
  const navigation = useNavigation();

  return (
    <View style={styles.menuBar}>
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
    backgroundColor: "#111",
    paddingVertical: 19,
    flexDirection: "row",
    justifyContent: "center",
    gap: 40,
  },
  menuText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
  },
});
