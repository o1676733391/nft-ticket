import React from "react";
import {
  View,
  FlatList,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import BaseCard from "../common/BaseCard";
import { useNavigation } from "@react-navigation/native";
import SectionTitle from "../common/SectionTitle";

export default function ForYouSection({ title, data, onPressItem }) {
  const navigation = useNavigation();
  const { width: screenWidth } = useWindowDimensions();
  const isTabletOrDesktop = screenWidth >= 768;
  
  const SIDE_MARGIN = isTabletOrDesktop ? 80 : 16;
  const CONTAINER_WIDTH = Math.min(screenWidth - SIDE_MARGIN * 2, 1320);
  const cardWidth = isTabletOrDesktop ? 360 : 280;
  const cardHeight = isTabletOrDesktop ? 170 : 140;
  const cardSpacing = isTabletOrDesktop ? 24 : 12;

  return (
    <View style={[styles.section, { marginTop: isTabletOrDesktop ? 32 : 20 }]}>
      <View style={[styles.container, { width: isTabletOrDesktop ? CONTAINER_WIDTH : screenWidth }]}>
        <SectionTitle title={title} />

        <FlatList
          horizontal
          data={data}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: isTabletOrDesktop ? 0 : 16 }}
          renderItem={({ item }) => (
            <BaseCard
              image={item.image}
              width={cardWidth}
              height={cardHeight}
              title={item.title}
              price={item.price}
              date={item.date}
              onPress={() => (onPressItem ? onPressItem(item) : navigation.navigate("EventDetail", { event: item }))}
              containerStyle={{ marginRight: cardSpacing }}
            />
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { alignItems: "center" },
  container: {},
});
