import React from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Dimensions,
} from "react-native";
import BaseCard from "../common/BaseCard";
import { useNavigation } from "@react-navigation/native";
import SectionTitle from "../common/SectionTitle";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SIDE_MARGIN = 80;
const CONTAINER_WIDTH = Math.min(SCREEN_WIDTH - SIDE_MARGIN * 2, 1320);

export default function ForYouSection({ title, data, onPressItem }) {
  const navigation = useNavigation();

  return (
    <View style={styles.section}>
      <View style={styles.container}>
        <SectionTitle title={title} />

        <FlatList
          horizontal
          data={data}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <BaseCard
              image={item.image}
              width={360}
              height={170}
              title={item.title}
              price={item.price}
              date={item.date}
              onPress={() => (onPressItem ? onPressItem(item) : navigation.navigate("EventDetail", { event: item }))}
              containerStyle={{ marginRight: 24 }}
            />
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 32, alignItems: "center" },
  container: { width: CONTAINER_WIDTH },
});
