import React from "react";
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import BaseCard from "../common/BaseCard";
import SectionTitle from "../common/SectionTitle";
import { useNavigation } from "@react-navigation/native";

export default function HorizontalEventSection({ title, data, onPressMore }) {
  const navigation = useNavigation();
  const { width: screenWidth } = useWindowDimensions();
  const isTabletOrDesktop = screenWidth >= 768;
  
  const SIDE_MARGIN = isTabletOrDesktop ? 80 : 16;
  const CONTAINER_WIDTH = Math.min(screenWidth - SIDE_MARGIN * 2, 1320);
  const cardWidth = isTabletOrDesktop ? 360 : 280;
  const cardHeight = isTabletOrDesktop ? 170 : 140;
  const cardSpacing = isTabletOrDesktop ? 24 : 12;

  const openDetail = (item) => {
    navigation.navigate("EventDetail", { event: item });
  };

  return (
    <View style={[styles.section, { marginTop: isTabletOrDesktop ? 32 : 20 }]}>
      <View style={[styles.container, { width: isTabletOrDesktop ? CONTAINER_WIDTH : screenWidth }]}>

        {/* Header */}
        <View style={[styles.headerRow, { paddingHorizontal: isTabletOrDesktop ? 0 : 16 }]}>
          <Text style={[styles.sectionTitle, { 
            fontSize: isTabletOrDesktop ? 22 : 20,
            marginBottom: isTabletOrDesktop ? 16 : 14,
          }]}>{title}</Text>

          {isTabletOrDesktop && (
            <TouchableOpacity onPress={onPressMore}>
              <View style={styles.moreRow}>
                <Text style={styles.moreText}>Xem thêm</Text>
                <Text style={styles.moreArrow}>›</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Card list */}
        <FlatList
          horizontal
          data={data}
          keyExtractor={(item) => item.id.toString()}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: isTabletOrDesktop ? 0 : 16 }}
          renderItem={({ item }) => (
            <BaseCard
              image={item.image}
              width={cardWidth}
              height={cardHeight}
              title={item.title}
              price={item.price}
              date={item.date}
              onPress={() => openDetail(item)}    
              containerStyle={{ marginRight: cardSpacing }}
            />
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    alignItems: "center",
  },
  container: {},

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitle: {
    color: "#fff",
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  moreRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  moreText: {
    fontSize: 14,
    color: "#e5e7eb",
    fontWeight: "600",
  },
  moreArrow: {
    marginLeft: 4,
    fontSize: 18,
    color: "#e5e7eb",
  },
});
