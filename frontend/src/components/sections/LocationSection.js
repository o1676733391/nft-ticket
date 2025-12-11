import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  ScrollView,
} from "react-native";

export default function LocationSection({ title, data, onPressItem }) {
  const { width: screenWidth } = useWindowDimensions();
  const isTabletOrDesktop = screenWidth >= 768;
  
  const SIDE_MARGIN = isTabletOrDesktop ? 80 : 16;
  const CONTAINER_WIDTH = Math.min(screenWidth - SIDE_MARGIN * 2, 1320);
  const CARD_HEIGHT = isTabletOrDesktop ? 280 : 180;
  const cardGap = isTabletOrDesktop ? 24 : 12;
  
  return (
    <View style={[styles.section, { marginTop: isTabletOrDesktop ? 32 : 24 }]}>
      <View style={[styles.container, { 
        width: isTabletOrDesktop ? CONTAINER_WIDTH : screenWidth,
        paddingHorizontal: isTabletOrDesktop ? 0 : 16,
      }]}>

        <Text style={[styles.sectionTitle, {
          fontSize: isTabletOrDesktop ? 22 : 20,
          marginBottom: isTabletOrDesktop ? 16 : 14,
        }]}>{title}</Text>

        <View style={[styles.row, { gap: cardGap }]}>
          {data.slice(0, isTabletOrDesktop ? 4 : 2).map((item, index) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.9}
              style={[styles.cardWrapper, {
                width: isTabletOrDesktop 
                  ? `calc((100% - ${cardGap * 3}px) / 4)` 
                  : `calc((100% - ${cardGap}px) / 2)`,
                height: CARD_HEIGHT,
              }]}
              onPress={() => onPressItem?.(item)}
            >
              <View style={[styles.card, { height: CARD_HEIGHT }]}>
                <Image 
                  source={typeof item.image === 'string' ? { uri: item.image } : item.image} 
                  style={styles.image} 
                />

                <View style={styles.gradient} />

                <Text style={[styles.cardText, {
                  fontSize: isTabletOrDesktop ? 20 : 16,
                }]}>{item.title}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    alignItems: "center",
  },

  container: {},

  sectionTitle: {
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.5,
  },

  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  cardWrapper: {
    marginBottom: 12,
  },

  card: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#000",
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
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
    backgroundColor: "rgba(16, 185, 129, 0.65)",
  },

  cardText: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    color: "#fff",
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});
