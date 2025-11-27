import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SIDE_MARGIN = 80;
const CONTAINER_WIDTH = Math.min(SCREEN_WIDTH - SIDE_MARGIN * 2, 1320);

export default function LocationSection({ title, data, onPressItem }) {
  return (
    <View style={styles.section}>
      <View style={styles.container}>

        <Text style={styles.sectionTitle}>{title}</Text>

        <View style={styles.row}>
          {data.slice(0, 4).map((item, index) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.9}
              style={[
                styles.cardWrapper,
                index === 3 && { marginRight: 0 }, // bỏ margin cuối
              ]}
              onPress={() => onPressItem?.(item)}
            >
              <View style={styles.card}>
                <Image source={item.image} style={styles.image} />

                <View style={styles.gradient} />

                <Text style={styles.cardText}>{item.title}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

      </View>
    </View>
  );
}

// CARD nhỏ hơn
const CARD_HEIGHT = 280;

const styles = StyleSheet.create({
  section: {
    marginTop: 32,
    alignItems: "center",
  },

  container: {
    width: CONTAINER_WIDTH,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 16,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  cardWrapper: {
    flex: 1,
    marginRight: 20,
  },

  card: {
    width: "100%",
    height: CARD_HEIGHT,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "#000",
  },

  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "42%",
    backgroundColor: "rgba(52, 168, 83, 0.55)",
  },

  cardText: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    color: "#fff",
    fontSize: 22,     // nhỏ hơn bản trước
    fontWeight: "700",
  },
});
