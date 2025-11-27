import React from "react";
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import BaseCard from "../common/BaseCard";
import SectionTitle from "../common/SectionTitle";
import { useNavigation } from "@react-navigation/native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SIDE_MARGIN = 80;
const CONTAINER_WIDTH = Math.min(SCREEN_WIDTH - SIDE_MARGIN * 2, 1320);

export default function HorizontalEventSection({ title, data, onPressMore }) {
  const navigation = useNavigation();

  const openDetail = (item) => {
    navigation.navigate("EventDetail", { event: item });
  };

  return (
    <View style={styles.section}>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>{title}</Text>

          <TouchableOpacity onPress={onPressMore}>
            <View style={styles.moreRow}>
              <Text style={styles.moreText}>Xem thêm</Text>
              <Text style={styles.moreArrow}>›</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Card list */}
        <FlatList
          horizontal
          data={data}
          keyExtractor={(item) => item.id.toString()}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <BaseCard
              image={item.image}
              width={360}
              height={170}
              title={item.title}
              price={item.price}
              date={item.date}
              onPress={() => openDetail(item)}    
              containerStyle={{ marginRight: 24 }}
            />
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 32,
    alignItems: "center",
  },
  container: {
    width: CONTAINER_WIDTH,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  sectionTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },

  moreRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  moreText: {
    fontSize: 14,
    color: "#e5e7eb",
  },
  moreArrow: {
    marginLeft: 4,
    fontSize: 18,
    color: "#e5e7eb",
  },
});
